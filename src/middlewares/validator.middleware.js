const logger = require('./logger.middleware')

const putToLight = async (req, res, next) => {
    if (req.body.productId == '' || req.body.productId == undefined) {
        logger.error('Invalid productId', { value: req.body })
        return res.status(400).json({
            status: 'fail',
            message: 'Mã sản phẩm không hợp lệ'
        });
    }
    else if (req.body.orderId == '' || req.body.orderId == undefined) {
        logger.error('Invalid orderId', { value: req.body })
        return res.status(400).json({
            status: 'fail',
            message: 'Mã phiếu không hợp lệ'
        });
    }
    else if (req.body.binId == undefined || req.body.binId === "") {
        logger.error('Invalid binId', { value: req.body })
        return res.status(400).json({
            status: 'fail',
            message: 'Mã ô không hợp lệ'
        });
    }
    else if (req.body.price == '' || req.body.price == undefined) {
        logger.error('Invalid price', { value: req.body })
        return res.status(400).json({
            status: 'fail',
            message: 'Giá sản phẩm không hợp lệ'
        });
    }
    next()
}

const pickToLight = async (req, res, next) => {
    next()
}

module.exports = {
    putToLight,
    pickToLight
}