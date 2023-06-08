const logger = require('./logger.middleware')

const log = async function (req, res, next) {
    try {
        if (req.body != undefined && Object.keys(req.body).length != 0)
            logger.info(`"${req.method} ${req.url}"`, { value: req.body })
        else
            logger.info(`"${req.method} ${req.url}"`)
        next()
    } catch (err) {
        logger.error('Catch unknown error', { err: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            err: err
        })
    }
}

module.exports = log