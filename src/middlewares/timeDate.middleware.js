const dayjs = require('dayjs')

/**
 * 
 * @param {string} mode minutes|seconds|miliseconds
 * @returns string
 */
module.exports = (mode) => {
    let formatedTime
    const t = dayjs()
    switch (mode) {
        case 'minutes':
            formatedTime = t.format("DD/MM/YYYY HH:mm")
            return formatedTime

        case 'seconds':
            formatedTime = t.format("DD/MM/YYYY HH:mm:ss")
            return formatedTime

        case 'miliseconds':
            formatedTime = t.format("DD/MM/YYYY HH:mm:ss.SSS")
            return formatedTime
                ;

        default:
            formatedTime = t.format("DD/MM/YYYY HH:mm")
            return formatedTime

    }
}