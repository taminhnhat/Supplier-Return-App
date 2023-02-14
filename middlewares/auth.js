const auth = async (req, res, next) => {
    try {
        if (req.headers.api_key === process.env.TOKEN_SECRET)
            next()
        else
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid token'
            })
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        })
    }

}
module.exports = auth