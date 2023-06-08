const logger = require('./logger.middleware')
const auth = async (req, res, next) => {
    try {
        if (req.headers.api_key === process.env.TOKEN_SECRET)
            next()
        else {
            logger.error('Invalid token', { headers: req.headers })
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid token'
            })
        }
    } catch (err) {
        logger.error('Catch unknown error', { err: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            err: err
        })
    }

}
module.exports = auth