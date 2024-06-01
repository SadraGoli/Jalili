const path = require('path')
const { DateTime } = require('luxon')
const { createLogger, transports, format } = require('winston');
require('winston-daily-rotate-file');

const logger = createLogger({
    levels: {
        error: 0,
        debug: 1,
        warn: 2,
        data: 3,
        info: 4,
    },
    format: format.combine(
        format.timestamp({
            format: () => DateTime.local().setZone('Asia/Tehran').toFormat('y-MM-dd,HH:mm:ss.SSS')
        }),
        format.printf(log => {
            const result = [
                log.level.toUpperCase(),
                log.timestamp,
                '_msg:' + log.message,
                '_meta:' + JSON.stringify(log.meta || {}),
                `${log.file ? path.relative(process.cwd(), log.file) : undefined}:${log.func || undefined}`,
            ]
            return result.join(' ')
        })
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: `./var/logs/application_%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
        }),
    ]
})

module.exports = logger;