const CANVAS_WITH = 320;
const CANVAS_HEIGHT = 320;
const IP = '127.0.0.1';
var API_BASE_URL = 'http://'+IP+':3000/api';

let cropper;
let canvas; 
let file;

const $profileImgInput = $('#profileImgInput');
const $changeImgBtn = $('#changeImgBtn');
const $modal = $('#cropperModal');
const $toastContainer = $('.toast-container')
const cropperImage = document.getElementById('cropperImage');
const profilePreview = document.getElementById('profilePreview')
const $uploadBtn = $('#uploadBtn')
const $progressContainer = $('.progress-container');
const $progress = $('.progress-bar');
const $picHolder = $('.pic-holder');
const $sectionOne = $('.section-one');
const $sectionTwo = $('.section-two');
const $sectionThree = $('.section-three');
const imageResults = $('.image-result');
const $resetBtn = $('#resetBtn');
const $collapseBtnToggler = $('#contactInfoToggle');
const $collpase = $('#collapseFormSection')
const provinceSelect = document.getElementById('provinceSelect')
const citySelect = document.getElementById('citySelect');
const $mainForm = $('#mainForm');

function initProvinceOptions() {
    const provinceOptions = Object.keys(Provinces).map((name) => '<option value="' + name + '">' + name + '</option>');
    provinceSelect.innerHTML = provinceSelect.innerHTML + provinceOptions
}
initProvinceOptions();

provinceSelect.addEventListener('change', function (evt) {
    const selectedProvince = Provinces[this.value];
    if (selectedProvince) {
        citySelect.disabled = false;
        const cityOptions = selectedProvince.map((name) => '<option value="' + name + '">' + name + '</option>')
        citySelect.innerHTML = '<option selected disabled>' + 'شهر' + '</option>' + cityOptions;
    } else {
        citySelect.disabled = true;
    }
})

$collpase.on('shown.bs.collapse', function () {
    this.scrollIntoView({
        alignToTop: true
    })
})
$collapseBtnToggler.on('click', function (e) {
    const isChecked = $(this).is(":checked")
    if (isChecked) {
        $collpase.collapse('show')
    } else {
        $collpase.collapse('hide')
    }
})

$resetBtn.on('click', function () {
    reset();
})

function reset() {
    cropper = undefined;
    file = undefined;
    canvas = undefined;

    profilePreview.src = './images/avatar-placeholder.png';
    profilePreview.classList.add('is-empty')
    $profileImgInput.val('')

    $picHolder.removeClass('disabled');
    $progressContainer.hide();
    $progress.attr("aria-valuenow", '0');
    $progress.width('0%');
    $uploadBtn.attr('disabled', false)
    $uploadBtn.text('ارسال');
    $picHolder.removeClass('disabled');

    $collapseBtnToggler.attr('checked', false)
    $collpase.collapse('hide');
    $mainForm.trigger('reset');

    $sectionOne.removeClass('d-none');
    $sectionTwo.addClass('d-none');
    $sectionThree.addClass('d-none');
}

$progressContainer.hide();

$modal.on('hidden.bs.modal', function () {
    if (!cropper) return;
    cropper.destroy();
    cropper = null;
})
$modal.on('shown.bs.modal', function () {
    cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 0,
    });
})

const toastCreator = (message, error) => {
    const id = 'toast-' + Date.now()
    const toast = `<div class="toast align-items-center text-white ${error ? 'bg-danger' : 'bg-primary'} border-0 fade show" id="${id}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white ms-2 m-auto" data-bs-dismiss="toast" onClick="(function(){
                $('#${id}').hide();
            })();return false;" aria-label="Close"></button>
        </div>
    </div>`
    return { toast, id }
}

$profileImgInput.on('change', function (event) {
    var files = !!this.files ? this.files : [];
    if (!files.length || !window.FileReader) {
        return;
    }

    file = files[0]
    if (/^image/.test(files[0].type)) {
        // only image file
        var reader = new FileReader();
        reader.onload = function () {
            initCropper(this.result)
        };
        reader.readAsDataURL(files[0]);
    } else {
        const { toast, id } = toastCreator("لطفا یک عکس معتبر انتخاب کنید.", true);
        $toastContainer.append(toast);
        setTimeout(() => {
            $toastContainer.find('#' + id).remove();
        }, 3000);
    }
});

$changeImgBtn.on('click', function (event) {
    $modal.modal('hide');
    $profileImgInput.trigger('click')
})

$profileImgInput.on('click', () => {
    $profileImgInput.val('');
})

function initCropper(imageData) {
    const cropperImage = document.getElementById('cropperImage');
    cropperImage.src = imageData;
    $modal.modal('show');
}

document.getElementById('crop').addEventListener('click', function () {
    if (cropper) {
        canvas = cropper.getCroppedCanvas({
            width: CANVAS_WITH,
            height: CANVAS_HEIGHT,
        });
        initialAvatarURL = profilePreview.src;
        profilePreview.src = canvas.toDataURL();
        profilePreview.classList.remove('is-empty')
    }
    $modal.modal('hide');
})



$uploadBtn.on('click', function (e) {
    e.preventDefault();
    if (!canvas) {
        const { id, toast } = toastCreator("لطفا یک عکس برای ارسال انتخاب کنید.", true);
        $toastContainer.append(toast);
        setTimeout(() => {
            $toastContainer.find('#' + id).remove();
        }, 3000);
        return;
    }

    canvas.toBlob(function (blob) {
        var formData = new FormData();
        formData.append('profile', blob, `${file.name}`);

        // append form data to formData if checkbox checked
        if ($collapseBtnToggler.is(':checked')) {
            $mainForm.serializeArray().forEach(item => {
                return formData.append(item.name, item.value);
            });
        }

        $.ajax({
            type: "POST",
            url: API_BASE_URL + "/upload/",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: () => {
                console.log('Image processing');
                $collpase.collapse('hide');
                $progressContainer.slideDown();
                $uploadBtn.attr('disabled', true)
                $uploadBtn.html(`
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    در حال بارگذاری...
                `)
                $picHolder.addClass('disabled');
            },
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = (evt.loaded / evt.total) * 100;
                        console.log(percentComplete);
                        //Do something with upload progress here
                        $progress.attr("aria-valuenow", percentComplete.toFixed(0));
                        $progress.width(percentComplete.toFixed(0) + '%');
                    }
                }, false);
                xhr.upload.addEventListener("loadend", function (e) {
                    console.log('loadend', ' upload completed', e)
                    $progressContainer.fadeOut(() => {
                        $progress.attr("aria-valuenow", '0');
                        $progress.width('0%');
                    });
                    $uploadBtn.attr('disabled', false)
                    $uploadBtn.text('ارسال');
                    $picHolder.removeClass('disabled');
                }, false);
                xhr.upload.addEventListener("load", function (e) {
                    $sectionOne.addClass('d-none');
                    $sectionTwo.removeClass('d-none')
                }, false);
                xhr.upload.addEventListener("error", function (e) {
                    const { toast, id } = toastCreator("متاسفانه بارگذاری با خطا مواجه شد لطفا مجددا تلاش کنید.", true);
                    $toastContainer.append(toast);
                    setTimeout(() => {
                        $toastContainer.find('#' + id).remove();
                    }, 3000);
                    $sectionOne.removeClass('d-none');
                    $sectionTwo.addClass('d-none');
                    $sectionThree.addClass('d-none');
                    $picHolder.removeClass('disabled');
                    $progressContainer.fadeOut(() => {
                        $progress.attr("aria-valuenow", '0');
                        $progress.width('0%');
                    });
                    $uploadBtn.attr('disabled', false)
                    $uploadBtn.text('ارسال');
                    $picHolder.removeClass('disabled');
                }, false);

                return xhr;
            },
            success: function (response) {
                $sectionTwo.addClass('d-none');
                $sectionThree.removeClass('d-none')
                // console.log('response', response);
                for (const [index, item] of response.data.entries()) {

                    imageResults.get(index).src = item.base64
                    const aDownload = $(imageResults.get(index)).closest('a');
                    aDownload.attr('href', item.base64);
                    aDownload.attr('download', item.filename)
                }
            },
            error: function (e) {
                const { toast, id } = toastCreator("متاسفانه عملیات با خطا مواجه شد لطفا مجددا تلاش کنید.", true);
                $toastContainer.append(toast);
                setTimeout(() => {
                    $toastContainer.find('#' + id).remove();
                }, 3000);
                reset();
            },
            complete: function (e) {

            }
        });
    })

})