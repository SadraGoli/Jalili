var express = require('express');
var router = express.Router();
const path = require('path');
const formidable = require('formidable');
const sharp = require('sharp');


const db = require('../db/index')
const logger = require('../logger')

/* GET users listing. */
router.post('/upload', async function (req, res, next) {
    const form = new formidable.IncomingForm();

    let formResult;
    try {
        formResult = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ fields, files });
            })
        })
    } catch (error) {
        logger.error(String(error), { meta: { message: error.message, name: error.name, stack: error.stack }, file: __filename })
        return res.json({
            status: false,
            message: 'خطای سرور'
        }).status(500)
    }

    const { files, fields } = formResult;

    // save user data to db
    try {
        const userDetails = {
            name: fields.name,
            job: fields.job,
            province: fields.province,
            city: fields.city,
            callNumber: fields.callNumber,
            whatsapp: fields.whatsappNumber,
            telegram: fields.telegramId,
            instagram: fields.instagramId,
            meta: {
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                ua: req.headers['user-agent']
            }
        }
        const user = new db.User(userDetails)
        user.save();
    } catch (error) {
        logger.error('Unable to save user to the database: ' + String(error), { meta: { fields: fields, message: error.message, name: error.name, stack: error.stack }, file: __filename, func: 'initialize' })
    }


    if (!files.profile) {
        logger.warn('profile doesnot exists int recieved files', { file: __filename })
        return res.json({
            status: false,
            message: 'لطفا یک فایل را انتحاب و بارگذاری نمیایید.'
        }).status(422)
    }
    const profileFile = files.profile;

    const templates = [
        path.resolve(__dirname, '../storage/templates/profile/1.png'),
        path.resolve(__dirname, '../storage/templates/profile/2.png'),
        path.resolve(__dirname, '../storage/templates/profile/3.png')
    ];

    // Proccessing
    const compositedImages = [];
    for (const templatePath of templates) {
        try {
            compositedImages.push(await sharp(profileFile.path)
                .composite([{ input: templatePath }])
                .jpeg()
                .toBuffer())
        } catch (error) {
            logger.error(String(error), { meta: { message: error.message, name: error.name, stack: error.stack }, file: __filename })
        }
    }
    const result = compositedImages.map((buff) => {
        return {
            filename: 'profile-one-' + profileFile.name,
            base64: `data:image/jpeg;base64,${buff.toString('base64')}`
        }
    });

    logger.info('done.', { meta: { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] }, file: __filename })

    return res.json({
        status: true,
        data: result
    })
});

module.exports = router;
