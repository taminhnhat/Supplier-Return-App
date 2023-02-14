const validator = require('express-validator')

exports.validate = (method) => {
    switch (method) {
        case 'putToLight':
            break
        case 'pickToLight':
            break
        default:
            break;
    }
}

exports.productValidator = function productIdValidator() {
    //
}