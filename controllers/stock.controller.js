require('dotenv').config({ path: './.env' })
const logger = require('../logger/logger')
const StockCollection = require('../models/stock')
const BackupCollection = require('../models/backup')
const HistoryCollection = require('../models/hist')
const rgbHub = require('../rgbHub')
const { all } = require('axios')
const { error } = require('winston')

let tempLightCursor = 0;
let tempBinIndex = 0;
let tempBinIndex_X = 0;
let tempBinIndex_Y = 0;

const numOfLedPerStrip = process.env.NUM_OF_LED_PER_STRIP
const numOfStrip = process.env.NUM_OF_STRIP

const holdingLightInSeconds = process.env.HOLDING_LIGHT_IN_SECONDS || 180
const searchingLightColor = process.env.SEARCHING_MODE_LIGHT_COLOR || 'ffff00'
const gettingSuggestLightColor = process.env.PUTTING_SUGGEST_MODE_LIGHT_COLOR || '40ff40'
const puttingLightColor = process.env.PUTTING_MODE_LIGHT_COLOR || '00ff00'
const pickToLightSearchColor = process.env.PICKING_SEARCH_MODE_LIGHT_COLOR || '80ffff'
const pickingLightColor = process.env.PICKING_MODE_LIGHT_COLOR || 'ffffff'

let lightOffTimeout

reload()

async function getStock(req, res) {
    const binIdFromRequest = req.query.binId || false

    if (binIdFromRequest === false) {
        try {
            const result = await StockCollection.find()
            if (result == undefined || result == null) {
                logger.error('Cannot retrieve from database', { value: result })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Loi he thong',
                    error: 'Khong truy xuat duoc database'
                })
            }
            else
                return res.status(200).json({
                    status: 'success',
                    data: result
                })
        } catch (err) {
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Loi he thong',
                error: err
            })
        }
    }
    else {
        try {
            const result = await StockCollection.find({ binId: binIdFromRequest })
            return res.status(200).json({
                status: 'success',
                data: result
            })
        }
        catch (err) {
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Loi he thong',
                error: err
            })
        }
    }
}

async function getBin(req, res) {
    let result
    try {
        result = await StockCollection.findById(req.params.id)
        if (result == null || result == undefined) {
            logger.error('Cannot retrieve from database', { value: result })
            return res.status(500).json({
                status: 'fail',
                message: 'Loi he thong',
                error: 'Khong truy xuat duoc database'
            })
        }
    } catch (err) {
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: err
        })
    }
    return res.status(200).json({
        status: 'success',
        data: result
    })
}

async function deleteBin(req, res) {
    return res.status()
}

async function getProductList(req, res) {
    try {
        const inputOrderId = req.query.orderId || false
        if (inputOrderId == false) {
            const allBins = await StockCollection.find()
            if (allBins == undefined || allBins == null) {
                logger.error('Cannot retrieve from database', { value: allBins })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Loi he thong',
                    error: 'Khong truy xuat duoc database'
                })
            }
            else {
                let results = []
                allBins.forEach((bin, binIdx) => {
                    bin.stock.forEach(product => {
                        let isIncluded = false
                        results.forEach((result, idx) => {
                            if (result.productId == product.productId) {
                                isIncluded = true
                                result.productQuantity += product.productQuantity
                                result.passedProductQuantity += product.passedProductQuantity
                                result.scrappedProductQuantity += product.scrappedProductQuantity
                                result.pickedProductQuantity += product.pickedProductQuantity
                                if (product.vendorName != undefined) result.vendorName = product.vendorName
                                result.location.push({
                                    binId: bin.binId,
                                    binName: bin.binName,
                                    orderId: product.orderId,
                                    quantity: product.productQuantity,
                                    passedQuantity: product.passedProductQuantity,
                                    scrappedQuantity: product.scrappedProductQuantity,
                                    pickedQuantity: product.pickedProductQuantity
                                })
                            }
                        })
                        if (!isIncluded) {
                            let temp = product
                            temp.location = []
                            temp.location.push(bin.binId)
                            results.push({
                                productId: product.productId,
                                productName: product.productName,
                                M_Product_ID: product.M_Product_ID,
                                price: product.price,
                                vendorName: product.vendorName || '',
                                productQuantity: product.productQuantity,
                                passedProductQuantity: product.passedProductQuantity,
                                scrappedProductQuantity: product.scrappedProductQuantity,
                                pickedProductQuantity: product.pickedProductQuantity,
                                notIncludedInOrder: product.notIncludedInOrder,
                                location: [{
                                    binId: bin.binId,
                                    binName: bin.binName,
                                    orderId: product.orderId,
                                    quantity: product.productQuantity,
                                    passedQuantity: product.passedProductQuantity,
                                    scrappedQuantity: product.scrappedProductQuantity,
                                    pickedQuantity: product.pickedProductQuantity
                                }]
                            })
                        }
                    })
                })
                // result.sort(function (a, b) { return a.productId - b.productId })
                return res.status(200).json({
                    status: 'success',
                    data: results
                })
            }
        }
        else {
            const bins = await StockCollection.find()
            if (bins == undefined || bins == null) {
                logger.error('Cannot retrieve from database', { value: bins })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Loi he thong',
                    error: 'Khong truy xuat duoc database'
                })
            }
            else {
                let results = []
                bins.forEach((bin, binIdx) => {
                    //
                    bin.stock.forEach(product => {
                        let isIncluded = false
                        results.forEach((result, idx) => {
                            if (result.productId == product.productId && result.orderId == product.orderId) {
                                isIncluded = true
                                result.productQuantity += product.productQuantity
                                result.passedProductQuantity += product.passedProductQuantity
                                result.scrappedProductQuantity += product.scrappedProductQuantity
                                result.pickedProductQuantity += product.pickedProductQuantity
                                if (product.vendorName != undefined) result.vendorName = product.vendorName
                                result.location.push({
                                    binId: bin.binId,
                                    binName: bin.binName,
                                    quantity: product.productQuantity,
                                    passedQuantity: product.passedProductQuantity,
                                    scrappedQuantity: product.scrappedProductQuantity,
                                    pickedQuantity: product.pickedProductQuantity
                                })
                            }
                        })
                        if (!isIncluded && product.orderId == inputOrderId) {
                            let temp = product
                            temp.location = []
                            temp.location.push(bin.binId)
                            results.push({
                                productId: product.productId,
                                productName: product.productName,
                                M_Product_ID: product.M_Product_ID,
                                price: product.price,
                                vendorName: product.vendorName || '',
                                orderId: product.orderId,
                                productQuantity: product.productQuantity,
                                passedProductQuantity: product.passedProductQuantity,
                                scrappedProductQuantity: product.scrappedProductQuantity,
                                pickedProductQuantity: product.pickedProductQuantity,
                                notIncludedInOrder: product.notIncludedInOrder,
                                location: [{
                                    binId: bin.binId,
                                    binName: bin.binName,
                                    quantity: product.productQuantity,
                                    passedQuantity: product.passedProductQuantity,
                                    scrappedQuantity: product.scrappedProductQuantity,
                                    pickedQuantity: product.pickedProductQuantity
                                }]
                            })
                        }
                    })
                })
                // result.sort(function (a, b) { return a.productId - b.productId })
                return res.status(200).json({
                    status: 'success',
                    data: results
                })
            }
        }
    } catch (err) {
        logger.error('Catch unknown error', { err: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: err
        })
    }
}

async function searchProduct(req, res) {
    const productIdFromRequest = req.query.productId
    const orderIdFromRequest = req.query.orderId
    const binIdFromRequest = req.query.binId
    const lightOnFlag = req.query.lightOn || 'false'
    const locationReturnFlag = req.query.locationReturn || 'false'

    try {
        switch (req.query.groupBy) {
            case 'binId':
                groupByBinId()
                break
            case 'productId':
                groupByProductId()
                break
            case 'orderId':
                groupByOrderId()
                break
            default:
                groupByProductId()
                break
        }

        async function groupByBinId() {
            // query
            let queryObj = { stock: { $elemMatch: {} } }
            if (productIdFromRequest != undefined) queryObj.stock.$elemMatch.productId = productIdFromRequest
            if (orderIdFromRequest != undefined) queryObj.stock.$elemMatch.orderId = orderIdFromRequest
            if (binIdFromRequest != undefined) queryObj.binId = binIdFromRequest
            // projection
            let projectionObj = { _id: 0, coordinate: 1, binId: 1, binName: 1, binWidth: 1, stock: 1 }
            // get all matched bins
            let allMatchedBin = await StockCollection.find(queryObj, projectionObj)
            // if stock is empty
            if (allMatchedBin == null || allMatchedBin == undefined) {
                logger.error('Cannot retrieve from database', { value: allMatchedBin })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Loi he thong',
                    error: 'Khong truy xuat duoc database'
                })
            }
            // filering result
            let results = []
            allMatchedBin.forEach(eachBin => {
                let result = {}
                result.binId = eachBin.binId
                result.binName = eachBin.binName
                result.binWidth = eachBin.binWidth
                result.stock = eachBin.stock
                if (productIdFromRequest != undefined)
                    result.stock = result.stock.filter(eachProduct => {
                        return eachProduct.productId == productIdFromRequest
                    })
                results.push(result)
            });
            // turn light on
            if (lightOnFlag == 'true') {
                _clearLightTimeout()
                _clearLight()
                allMatchedBin.forEach(eachBin => {
                    // rgbHub.write(`F${eachBin.coordinate.Y_index + 1}:000000\n`)
                    rgbHub.write(`W${eachBin.coordinate.Y_index + 1}:${eachBin.coordinate.startPoint}:${eachBin.coordinate.endPoint}:${searchingLightColor}\n`)
                })
                _setLightTimeout(holdingLightInSeconds)
            }

            return res.status(200).json({
                status: 'success',
                groupBy: 'binId',
                data: results
            })
        }
        async function groupByProductId() {
            // query
            let queryObj = { stock: { $elemMatch: {} } }
            if (productIdFromRequest != undefined) queryObj.stock.$elemMatch.productId = productIdFromRequest
            if (orderIdFromRequest != undefined) queryObj.stock.$elemMatch.orderId = orderIdFromRequest
            if (binIdFromRequest != undefined) queryObj.binId = binIdFromRequest
            // projection
            let projectionObj = { _id: 0, coordinate: 1, binId: 1, binName: 1, binWidth: 1, stock: 1 }
            // get all matched bins
            let allMatchedBin = await StockCollection.find(queryObj, projectionObj)
            // if stock is empty
            if (allMatchedBin == null || allMatchedBin == undefined) {
                logger.error('Cannot retrieve from database', { value: allMatchedBin })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Loi he thong',
                    error: 'Khong truy xuat duoc database'
                })
            }
            let result
            allMatchedBin.forEach(bin => {
                bin.stock.forEach(product => {
                    let isIncluded = false
                    let tmpProQty = 0
                    let tmpPasProQty = 0
                    let tmpScrProQty = 0
                    let tmpPicProQty = 0

                    if (product.productId == req.query.productId) {
                        if (result == undefined) {
                            result = {}
                            result.productId = product.productId
                            result.productName = product.productName
                            result.M_Product_ID = product.M_Product_ID
                            result.price = product.price
                            result.vendorName = product.vendorName || ''
                            result.productQuantity = product.productQuantity
                            result.passedProductQuantity = product.passedProductQuantity
                            result.scrappedProductQuantity = product.scrappedProductQuantity
                            result.pickedProductQuantity = product.pickedProductQuantity
                            result.notIncludedInOrder = product.notIncludedInOrder
                            result.location = [{
                                binId: bin.binId,
                                binName: bin.binName,
                                quantity: product.productQuantity,
                                passedQuantity: product.passedProductQuantity,
                                scrappedQuantity: product.scrappedProductQuantity,
                                pickedQuantity: product.pickedProductQuantity
                            }]
                        }
                        else {
                            result.productQuantity += product.productQuantity
                            result.passedProductQuantity += product.passedProductQuantity
                            result.scrappedProductQuantity += product.scrappedProductQuantity
                            result.pickedProductQuantity += product.pickedProductQuantity
                            let includeFlag = false
                            let includeIndex = false
                            result.location.forEach((loca, idx) => {
                                if (loca.binId == bin.binId) {
                                    includeFlag = true
                                    includeIndex = idx
                                }
                            })
                            if (includeFlag == true) {
                                result.location[includeIndex].quantity += product.productQuantity
                                result.location[includeIndex].passedQuantity += product.passedProductQuantity
                                result.location[includeIndex].scrappedQuantity += product.scrappedProductQuantity
                                result.location[includeIndex].pickedQuantity += product.pickedProductQuantity
                            }
                            else {
                                result.location.push({
                                    binId: bin.binId,
                                    binName: bin.binName,
                                    quantity: product.productQuantity,
                                    passedQuantity: product.passedProductQuantity,
                                    scrappedQuantity: product.scrappedProductQuantity,
                                    pickedQuantity: product.pickedProductQuantity
                                })
                            }
                        }
                    }
                })
            })
            // turn light on
            if (lightOnFlag == 'true') {
                _clearLightTimeout()
                _clearLight()
                allMatchedBin.forEach(eachBin => {
                    // rgbHub.write(`F${eachBin.coordinate.Y_index + 1}:000000\n`)
                    rgbHub.write(`W${eachBin.coordinate.Y_index + 1}:${eachBin.coordinate.startPoint}:${eachBin.coordinate.endPoint}:${searchingLightColor}\n`)
                })
                _setLightTimeout(holdingLightInSeconds)
            }

            let results = []
            if (result != null) results.push(result)
            return res.status(200).json({
                status: 'success',
                groupBy: 'productId',
                data: results
            })
        }
        async function groupByOrderId() {
            const allBins = await StockCollection.find()
            if (allBins == undefined || allBins == null) {
                logger.error('Cannot retrieve from database', { value: allBins })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Loi he thong',
                    error: 'Khong truy xuat duoc database'
                })
            }
            else {
                let results = []
                allBins.forEach((bin, binIdx) => {
                    bin.stock.forEach(product => {
                        let isIncluded = false
                        results.forEach((result, idx) => {
                            if (result.orderId == product.orderId) {
                                isIncluded = true
                            }
                        })
                        if (!isIncluded) {
                            results.push({
                                orderId: product.orderId
                            })
                        }
                    })
                })
                // turn light on
                if (lightOnFlag == 'true') {
                    _clearLightTimeout()
                    _clearLight()
                    allBins.forEach(eachBin => {
                        // rgbHub.write(`F${eachBin.coordinate.Y_index + 1}:000000\n`)
                        rgbHub.write(`W${eachBin.coordinate.Y_index + 1}:${eachBin.coordinate.startPoint}:${eachBin.coordinate.endPoint}:${searchingLightColor}\n`)
                    })
                    _setLightTimeout(holdingLightInSeconds)
                }
                // result.sort(function (a, b) { return a.productId - b.productId })
                return res.status(200).json({
                    status: 'success',
                    data: results
                })
            }
        }



    } catch (err) {
        console.log(err)
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: err
        })
    }
}

async function deleteProduct(req, res) {
    try {
        // get matched bin
        const inputProductId = req.params.productId

        const allMatchedBin = await StockCollection.find({ stock: { $elemMatch: { productId: inputProductId } } }, { _id: 1, coordinate: 1, binId: 1, stock: 1 })

        // if stock is empty
        if (allMatchedBin == null || allMatchedBin == undefined) {
            logger.error('Cannot retrieve from database', { value: allMatchedBin })
            return res.status(500).json({
                status: 'fail',
                message: 'Loi he thong',
                error: 'Khong truy xuat duoc database'
            })
        }
        // if no bin have matched product
        if (allMatchedBin.length == 0)
            return res.status(400).json({
                status: 'fail',
                message: `Khong tim thay san pham co id:${inputProductId}`
            })
        // remove matched Product
        allMatchedBin.forEach((eachBin, index) => {
            const filteredBin = eachBin.stock.filter(eachStock => {
                return eachStock.productId != inputProductId
            })
            eachBin.stock = filteredBin
        })
        // update stock
        let result = []
        allMatchedBin.forEach(async (eachBin, index) => {
            const out = await eachBin.save()
            result.push(out)
            if (index == allMatchedBin.length - 1)
                return res.status(200).json({
                    status: 'success',
                    data: result
                })
        })
    } catch (err) {
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: err
        })
    }
}

async function getConfiguration(req, res) {
    const result = JSON.parse(process.env.BIN_WIDTH_VALUE_ARRAY_IN_CM)
    if (result == null || result == undefined) {
        logger.error('Cannot retrieve from configuration', { value: allMatchedBin })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: 'Khong truy xuat duoc database'
        })
    }
    else {
        return res.status(200).json({
            status: 'success',
            data: result
        })
    }
}

async function config(req, res) {
    const rgbHubBrightness = Number(req.query.brightness) || 150
    rgbHub.write(`CFG:B${rgbHubBrightness}\n`)
    return res.status(202).json({
        status: 'accepted',
    })
}

async function getSuggestion(req, res) {
    // {
    //     "userId": "Minh_Nhat",
    //     "productId": "7104110382456",
    //     "orderId": "590028/20/XT/QV/ABQ",
    //     "arrangeMode": "default",
    //     "binWidth": "20cm",
    //     "lightColor": "00ff00",
    //     "mergeId": "1347869093563"
    // }
    const arrangeMode = req.body.arrangeMode
    if (req.body.productId == '' || req.body.productId == undefined) {
        logger.error('Invalid productId', { value: req.body })
        return res.status(400).json({
            status: 'fail',
            message: 'Mã sản phẩm không hợp lệ'
        });
    }
    if (req.body.orderId == '' || req.body.orderId == undefined) {
        logger.error('Invalid orderId', { value: req.body })
        return res.status(400).json({
            status: 'fail',
            message: 'Mã phiếu không hợp lệ'
        });
    }
    if (req.body.notIncludedInOrder == true) {
        logger.warn('Product is not included in order', { value: req.body })
    }
    switch (arrangeMode) {
        case 'default':
            handleDefaultMode(req, res)
            break
        case 'extend':
            handleExtendMode(req, res)
            break
        case 'merge':
            handleMergeMode(req, res)
            break
        default:
            logger.error('Invalid arrangeMode', { value: req.body })
            return res.status(400).json({
                status: 'fail',
                message: 'Chế độ không hợp lệ'
            });
    }

    async function handleMergeMode(req, res) {
        try {
            const queryObj = { stock: { $elemMatch: { productId: req.body.mergeId } } }
            const allBin = await StockCollection.find(queryObj)
            if (allBin == null || allBin == undefined) {
                logger.error('Cannot retrieve from database', { value: allBin })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Lỗi hệ thống',
                    error: 'Cannot retrieve from database'
                })
            }
            if (allBin.length == 0) {
                logger.error('MergeId not found', { value: req.body })
                return res.status(400).json({
                    status: 'fail',
                    message: `Không tìm thấy mã gộp:${req.body.mergeId}`
                })
            }

            const matchedBin = allBin[allBin.length - 1]
            matchedBin.stock.push({
                productId: req.body.productId,
                orderId: req.body.orderId
            })
            _clearLightTimeout()
            _clearLight()
            // rgbHub.write(`F${matchedBin.coordinate.Y_index + 1}:000000\n`);
            rgbHub.write(`W${matchedBin.coordinate.Y_index + 1}:${matchedBin.coordinate.startPoint}:${matchedBin.coordinate.endPoint}:${gettingSuggestLightColor}\n`)
            _setLightTimeout(holdingLightInSeconds)
            return res.status(200).json({
                status: 'success',
                data: matchedBin
            })

        } catch (err) {
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Lỗi hệ thống',
                error: err
            })
        }
    }
    async function handleExtendMode(req, res) {
        _createVolume(req, res)
    }
    async function handleDefaultMode(req, res) {
        try {
            const queryObj = { stock: { $elemMatch: { productId: req.body.productId } } }
            const allBin = await StockCollection.find(queryObj)
            if (allBin == null || allBin == undefined) {
                logger.error('Cannot retrieve from database', { value: allBin })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Lỗi hệ thống',
                    error: 'Cannot retrieve from database'
                })
            }
            else if (allBin.length == 0) _createVolume(req, res)
            else {
                const tempRes = allBin[allBin.length - 1]
                _clearLightTimeout()
                _clearLight()
                // rgbHub.write(`F${tempRes.coordinate.Y_index + 1}:000000\n`)
                rgbHub.write(`W${tempRes.coordinate.Y_index + 1}:${tempRes.coordinate.startPoint}:${tempRes.coordinate.endPoint}:${gettingSuggestLightColor}\n`)
                _setLightTimeout(holdingLightInSeconds)
                return res.status(200).json({
                    status: 'success',
                    data: tempRes
                })
            }
        } catch (err) {
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Lỗi hệ thống',
                error: err
            })
        }
    }
    async function _createVolume(req, res) {
        let startPoint = tempLightCursor;
        const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER);
        let endPoint = tempLightCursor + Math.floor(Number(req.body.binWidth.replace('cm', '')) / 100 * ledsPerMetterOfLedStrip) - 1;
        const lightColor = req.body.lightColor;
        let lightRow = tempBinIndex_Y + 1
        if (endPoint >= numOfLedPerStrip) {
            if (lightRow >= numOfStrip) {
                logger.error('Not enough space to create new bin', { value: req.body })
                return res.status(400).json({
                    status: 'fail',
                    message: 'Không còn ô trống trên tường, Vui lòng chuyển sang chế độ gộp',
                    error: 'Out of space, use merge mode instead'
                })
            }
            else {
                endPoint = endPoint - startPoint
                startPoint = 0
                lightRow += 1
            }
        }
        _clearLightTimeout()
        _clearLight()
        // rgbHub.write(`F${lightRow}:000000\n`)
        rgbHub.write(`W${lightRow}:${startPoint}:${endPoint}:${gettingSuggestLightColor}\n`)
        _setLightTimeout(holdingLightInSeconds)
        const newStock = {
            binId: tempBinIndex,
            binWidth: req.body.binWidth,
            coordinate: {
                startPoint: startPoint,
                endPoint: endPoint,
                X_index: tempBinIndex_X,
                Y_index: tempBinIndex_Y
            },
            stock: [{
                productId: req.body.productId,
                orderId: req.body.orderId
            }]
        }
        return res.status(201).json({
            status: 'success',
            url: '/api/v1',
            object: 'review_result',
            data: newStock
        });
    }
}

async function putToLight(req, res) {
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
    // get bin with the same binId, productId, orderId
    // if exist, update product quantity
    const binList_1 = await StockCollection.find({ binId: Number(req.body.binId), stock: { $elemMatch: { productId: req.body.productId, orderId: req.body.orderId } } })
    try {
        // If bin exists, update product quantity on this bin
        if (binList_1.length == 1) {
            const thisBin = binList_1[0]
            updateProductQuantity(req, res, thisBin)
        }
        // If no bin matched, find bin with the same binId only
        else if (binList_1.length == 0) {
            // get bin with the same binId only
            const binList_2 = await StockCollection.find({ binId: Number(req.body.binId) })
            if (binList_2.length == 1) {
                // push new product to this bin
                const thisBin = binList_2[0]
                pushNewProduct(req, res, thisBin)
            }
            else if (binList_2.length == 0) {
                // create new bin
                createNewBin(req, res)
            }
            else {
                logger.error('Unexpected search from db, conflict data', { value: binList_2 })
                return res.status(500).json({
                    status: 'fail',
                    message: 'Lỗi hệ thống',
                    error: 'Unexpected search from db, conflict data',
                    value: binList_2
                })
            }
        }
        else {
            logger.error('Unexpected search from db, conflict data', { value: binList_1 })
            return res.status(500).json({
                status: 'fail',
                message: 'Lỗi hệ thống',
                error: 'Unexpected search from db, conflict data',
                value: binList_1
            })
        }
    }
    catch (err) {
        console.log(err)
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: err
        })
    }

    async function createNewBin(req, res) {
        logger.debug('putToLight:create new bin')
        //
        const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER)
        const binWidthInCm = Number(req.body.binWidth.replace('cm', '').replace('Cm', '').replace('CM', ''))
        //
        const deltaPoint = Math.floor(binWidthInCm / 100 * ledsPerMetterOfLedStrip) - 1
        let startPoint
        let endPoint
        // if row is full, add new row
        if (tempLightCursor + deltaPoint >= numOfLedPerStrip) {
            // if no row to expand
            if (tempBinIndex_Y + 1 >= numOfStrip) {
                logger.error('Out of space, use another binId instead')
                return res.status(400).json({
                    status: 'fail',
                    message: 'Không còn ô trống trên tường, Vui lòng chuyển sang chế độ gộp',
                    error: 'Out of space, use another binId instead'
                })
            }
            else {
                tempBinIndex_Y += 1
                tempBinIndex_X = 0
                startPoint = 0
                endPoint = deltaPoint
            }
        }
        else {
            startPoint = tempLightCursor
            endPoint = tempLightCursor + deltaPoint
        }

        try {
            const passedProQty = Number(req.body.passedProductQuantity || 0)
            const scrappedProQty = Number(req.body.scrappedProductQuantity || 0)
            const stock = new StockCollection({
                binId: tempBinIndex,
                binName: `TH-${tempBinIndex}`,
                binWidth: req.body.binWidth,
                coordinate: {
                    startPoint: startPoint,
                    endPoint: endPoint,
                    X_index: tempBinIndex_X,
                    Y_index: tempBinIndex_Y
                },
                stock: [{
                    productId: req.body.productId,
                    productName: req.body.productName || '',
                    M_Product_ID: req.body.M_Product_ID || '',
                    price: req.body.price,
                    vendorName: req.body.vendorName,
                    orderId: req.body.orderId,
                    passedProductQuantity: passedProQty,
                    scrappedProductQuantity: scrappedProQty,
                    productQuantity: passedProQty + scrappedProQty,
                    pickedProductQuantity: 0,
                    notIncludedInOrder: req.body.notIncludedInOrder
                }]
            });
            let backup = await BackupCollection.findOne({})
            tempLightCursor = endPoint + 1
            tempBinIndex_X += 1
            tempBinIndex += 1
            backup.lightCursor = tempLightCursor
            backup.binIndex = tempBinIndex
            backup.binIndex_X = tempBinIndex_X
            backup.binIndex_Y = tempBinIndex_Y
            const newStock = await stock.save()
            const out = await backup.save()
            _clearLightTimeout()
            _clearLight()
            // rgbHub.write(`F${tempBinIndex_Y + 1}:000000\n`)
            rgbHub.write(`W${tempBinIndex_Y + 1}:${startPoint}:${endPoint}:${puttingLightColor}\n`)
            _setLightTimeout(holdingLightInSeconds)
            return res.status(201).json({
                status: 'success',
                data: newStock
            })
        } catch (err) {
            console.log(err)
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Lỗi hệ thống',
                error: err
            })
        }
    }

    async function updateProductQuantity(req, res, thisBin) {
        logger.debug('putToLight:update quantity')
        try {
            thisBin.stock.forEach(async (eachProduct, productIndex) => {
                if (eachProduct.productId == req.body.productId && eachProduct.orderId == req.body.orderId) {
                    let updateProduct = eachProduct
                    const passedProQty = Number(req.body.passedProductQuantity)
                    const scrappedProQty = Number(req.body.scrappedProductQuantity)
                    updateProduct.passedProductQuantity = updateProduct.passedProductQuantity + passedProQty
                    updateProduct.scrappedProductQuantity = updateProduct.scrappedProductQuantity + scrappedProQty
                    updateProduct.productQuantity += (passedProQty + scrappedProQty)
                    thisBin.stock.push(updateProduct)
                    thisBin.stock.splice(productIndex, 1)
                    const updatedBin = await thisBin.save()
                    _clearLightTimeout()
                    _clearLight()
                    // rgbHub.write(`F${thisBin.coordinate.Y_index + 1}:000000\n`)
                    rgbHub.write(`W${thisBin.coordinate.Y_index + 1}:${thisBin.coordinate.startPoint}:${thisBin.coordinate.endPoint}:${puttingLightColor}\n`)
                    _setLightTimeout(holdingLightInSeconds)
                    return res.status(201).json({
                        status: 'success',
                        data: updatedBin
                    })
                }
            })
        } catch (err) {
            console.log(err)
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Lỗi hệ thống',
                error: err
            })
        }
    }

    async function pushNewProduct(req, res, thisBin) {
        logger.debug('putToLight:push new product')
        try {
            const passedProQty = Number(req.body.passedProductQuantity || 0)
            const scrappedProQty = Number(req.body.scrappedProductQuantity || 0)
            thisBin.stock.push({
                productId: req.body.productId,
                productName: req.body.productName || '',
                M_Product_ID: req.body.M_Product_ID || '',
                price: req.body.price,
                vendorName: req.body.vendorName,
                orderId: req.body.orderId,
                passedProductQuantity: passedProQty,
                scrappedProductQuantity: scrappedProQty,
                productQuantity: passedProQty + scrappedProQty,
                pickedProductQuantity: 0,
                notIncludedInOrder: req.body.notIncludedInOrder
            })
            const updatedBin = await thisBin.save()
            _clearLightTimeout()
            _clearLight()
            // rgbHub.write(`F${thisBin.coordinate.Y_index + 1}:000000\n`)
            rgbHub.write(`W${thisBin.coordinate.Y_index + 1}:${thisBin.coordinate.startPoint}:${thisBin.coordinate.endPoint}:${puttingLightColor}\n`)
            _setLightTimeout(holdingLightInSeconds)
            return res.status(201).json({
                status: 'success',
                data: updatedBin
            })
        } catch (err) {
            console.log(err)
            logger.error('Catch unknown error', { error: err })
            return res.status(500).json({
                status: 'fail',
                message: 'Lỗi hệ thống',
                error: err
            })
        }
    }
}

async function putToLight_updateQuantity(req, res) {
    try {
        let result = []
        const locations = req.body.locations
        let updateToBeDone = []

        // find all matched bins
        locations.forEach(async (location, idx) => {
            if (location.passedQuantity == undefined || location.scrappedQuantity == undefined) {
                logger.error('Invalid product information', { value: req.body })
                return res.status(400).json({
                    status: 'fail',
                    message: 'Số lượng sản phẩm không hợp lệ',
                    error: 'Invalid product information'
                });
            }
            const bin = await StockCollection.findOne({ binId: location.binId, stock: { $elemMatch: { productId: req.body.productId, orderId: req.body.orderId } } },
                { _id: 1, binId: 1, coordinate: 1, stock: 1 })
            // update quantity
            if (bin != null) {
                updateToBeDone.push({
                    bin: bin,
                    passedProductQuantity: Number(location.passedQuantity),
                    scrappedProductQuantity: Number(location.scrappedQuantity)
                })
            }
            // end of forEach
            if (idx == locations.length - 1) {
                // if no bin found
                if (updateToBeDone.length == 0) {
                    logger.error('Invalid product information', { value: req.body })
                    return res.status(400).json({
                        status: 'fail',
                        message: 'Không tìm thấy thông tin sản phẩm',
                        error: 'Invalid product information'
                    });
                }
                else {
                    // Update all matched bins
                    updateBins(updateToBeDone)
                }
            }
        })

        // Update all matched bins
        function updateBins(changes) {
            changes.forEach((change, idx) => {
                new Promise((resolve, reject) => {
                    try {
                        let bin = change.bin
                        bin.stock.forEach(async (eachProduct, productIndex) => {
                            if (eachProduct.productId == req.body.productId && eachProduct.orderId == req.body.orderId) {
                                let updateProduct = eachProduct
                                updateProduct.passedProductQuantity = change.passedProductQuantity
                                updateProduct.scrappedProductQuantity = change.scrappedProductQuantity
                                updateProduct.productQuantity = change.passedProductQuantity + change.scrappedProductQuantity
                                bin.stock.push(updateProduct)
                                bin.stock.splice(productIndex, 1)
                            }
                            if (productIndex == bin.stock.length - 1) resolve(bin)
                        })
                    }
                    catch (err) {
                        reject(err)
                    }
                })
                    .then(async (bin) => {
                        // resolve
                        const updatedBin = await bin.save()
                        result.push(updatedBin)
                        if (idx == changes.length - 1)
                            return res.status(201).json({
                                status: 'success',
                                data: result
                            })
                    },
                        (err) => {
                            // reject
                            logger.error('Catch unknown error', { body: req.body, err: err })
                            return res.status(500).json({
                                status: 'fail',
                                message: 'Lỗi hệ thống',
                                error: err
                            })
                        })
            })
        }
    }
    catch (err) {
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Lỗi hệ thống',
            error: err
        })
    }
}

async function pickToLight_search(req, res) {
    try {
        const allBins = await StockCollection.find({ stock: { $elemMatch: { productId: req.body.productId } } })
        if (allBins == undefined || allBins.length == null) {
            logger.error('Cannot retrieve from database', { value: allBins })
            return res.status(500).json({
                status: 'fail',
                message: 'Loi he thong',
                error: 'Khong truy xuat duoc database'
            })
        }
        else if (allBins.length == 0) {
            logger.error('ProductId not found', { value: req.body })
            return res.status(400).json({
                status: 'fail',
                message: `Không tìm thấy mã sản phẩm: ${req.body.productId}`
            })
        }
        else {
            _clearLightTimeout()
            _clearLight()
            let result
            allBins.forEach(bin => {
                bin.stock.forEach(product => {
                    let isIncluded = false
                    let tmpProQty = 0
                    let tmpPasProQty = 0
                    let tmpScrProQty = 0
                    let tmpPicProQty = 0

                    if (product.productId == req.body.productId) {
                        if (result == undefined) {
                            result = {}
                            result.productId = product.productId
                            result.productName = product.productName
                            result.M_Product_ID = product.M_Product_ID
                            result.price = product.price
                            result.vendorName = product.vendorName || ''
                            result.productQuantity = product.productQuantity
                            result.passedProductQuantity = product.passedProductQuantity
                            result.scrappedProductQuantity = product.scrappedProductQuantity
                            result.pickedProductQuantity = product.pickedProductQuantity
                            result.notIncludedInOrder = product.notIncludedInOrder
                            result.location = [{
                                binId: bin.binId,
                                binName: bin.binName,
                                quantity: product.productQuantity,
                                passedQuantity: product.passedProductQuantity,
                                scrappedQuantity: product.scrappedProductQuantity,
                                pickedQuantity: product.pickedProductQuantity
                            }]
                        }
                        else {
                            result.productQuantity += product.productQuantity
                            result.passedProductQuantity += product.passedProductQuantity
                            result.scrappedProductQuantity += product.scrappedProductQuantity
                            result.pickedProductQuantity += product.pickedProductQuantity
                            let includeFlag = false
                            let includeIndex = false
                            result.location.forEach((loca, idx) => {
                                if (loca.binId == bin.binId) {
                                    includeFlag = true
                                    includeIndex = idx
                                }
                            })
                            if (includeFlag == true) {
                                result.location[includeIndex].quantity += product.productQuantity
                                result.location[includeIndex].passedQuantity += product.passedProductQuantity
                                result.location[includeIndex].scrappedQuantity += product.scrappedProductQuantity
                                result.location[includeIndex].pickedQuantity += product.pickedProductQuantity
                            }
                            else {
                                result.location.push({
                                    binId: bin.binId,
                                    binName: bin.binName,
                                    quantity: product.productQuantity,
                                    passedQuantity: product.passedProductQuantity,
                                    scrappedQuantity: product.scrappedProductQuantity,
                                    pickedQuantity: product.pickedProductQuantity
                                })
                            }
                        }
                    }
                })
                // rgbHub.write(`F${thisBin.coordinate.Y_index + 1}:000000\n`)
                rgbHub.write(`W${bin.coordinate.Y_index + 1}:${bin.coordinate.startPoint}:${bin.coordinate.endPoint}:${pickToLightSearchColor}\n`)
            })
            _setLightTimeout(holdingLightInSeconds)
            // result.sort(function (a, b) { return a.productId - b.productId })
            return res.status(200).json({
                status: 'success',
                data: [result]
            })
        }
    } catch (err) {
        console.log(err)
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Loi he thong',
            error: err
        })
    }
}
async function pickToLight(req, res) {
    try {
        // find all bin with input productId
        let allMatchedBin = await StockCollection.find({ stock: { $elemMatch: { productId: req.body.productId } } }, { _id: 1, coordinate: 1, binId: 1, stock: 1 })
        if (allMatchedBin.length == 0) {
            logger.error('ProductId not found', { value: allMatchedBin })
            return res.status(400).json({
                status: 'fail',
                message: `Không tìm thấy mã sản phẩm: ${req.body.productId}`
            })
        }
        else {
            _clearLightTimeout()
            _clearLight()
            let result = []
            allMatchedBin.forEach(async (bin, binIdx) => {
                // filering result
                bin.stock.forEach((product, proIdx) => {
                    if (product.productId == req.body.productId) {
                        let updateProduct = product
                        updateProduct.pickedProductQuantity = updateProduct.productQuantity
                        // bin.stock.push(updateProduct)
                        // bin.stock.splice(proIdx, 1)
                        bin.stock[proIdx] = updateProduct
                    }
                })
                const tmp = await bin.save()
                console.log(tmp.stock)
                result.push(tmp)
                bin.stock = bin.stock.filter(eachProduct => {
                    return eachProduct.productId == req.body.productId
                })
                // turn the light on
                rgbHub.write(`W${bin.coordinate.Y_index + 1}:${bin.coordinate.startPoint}:${bin.coordinate.endPoint}:${pickingLightColor}\n`)
                if (binIdx == allMatchedBin.length - 1) {
                    _setLightTimeout(holdingLightInSeconds)

                    return res.status(200).json({
                        status: 'success',
                        data: result
                    })
                }
            });
        }
    } catch (err) {
        logger.error('Catch unknown error', { error: err })
        return res.status(500).json({
            status: 'fail',
            message: 'Lỗi hệ thống',
            error: err
        })
    }
}

async function createHistory(req, res) {
    try {
        // Retrieve stock
        const stock = await StockCollection.find()
        // save to history
        const today = Date.now()
        const hist = new HistoryCollection({
            dateStarted: Date.now(),
            dateCompleted: Date.now(),
            data: stock
        })
        const newHistory = await hist.save()
        res.status(200).json({
            status: 'success',
            message: 'History created'
        })
    }
    catch (err) {
        logger.error('Catch unknown error', { error: err })
        res.status(500).json({
            status: 'fail',
            message: 'Lỗi hệ thống',
            error: err
        })
    }
}

async function clearStock(req, res) {
    try {
        // Retrieve stock
        const stock = await StockCollection.find()
        // save to history
        const hist = new HistoryCollection({
            dateStartd: '',
            dateCompleted: Date.now(),
            data: stock
        })
        const newHistory = await hist.save()

        // clear stock
        stock.forEach(async stock => {
            await stock.remove()
        })
        tempLightCursor = 0
        tempBinIndex = 0
        tempBinIndex_X = 0
        tempBinIndex_Y = 0
        const backup = await BackupCollection.find()
        backup.forEach(async ele => {
            await ele.remove()
        })
        await BackupCollection({
            lightCursor: tempLightCursor,
            binIndex: tempBinIndex,
            binIndex_X: tempBinIndex_X,
            binIndex_Y: tempBinIndex_Y
        }).save()
        res.status(200).json({
            status: 'success',
            message: 'Clear stock'
        })
    } catch (err) {
        logger.error('Catch unknown error', { error: err })
        res.status(500).json({
            status: 'fail',
            message: 'Lỗi hệ thống',
            error: err
        })
    }
}

async function reload(req, res) {
    try {
        const backup = await BackupCollection.find()
        if (backup.length == 0) {
            const backup = new BackupCollection({
                lightCursor: 0,
                binIndex: 0,
                binIndex_X: 0,
                binIndex_Y: 0
            })
            await backup.save()
        }
        else {
            tempLightCursor = backup[0].lightCursor
            tempBinIndex = backup[0].binIndex
            tempBinIndex_X = backup[0].binIndex_X
            tempBinIndex_Y = backup[0].binIndex_Y
        }
        _clearLight()
    } catch (err) {
        logger.error('Catch unknown error', { error: err })
    }
}

async function getHistory(req, res) {
    try {
        //
    }
    catch (err) {
        logger.error('Catch unknown error', { error: err })
        res.status(500).json({
            status: 'fail',
            message: 'Lỗi hệ thống',
            error: err
        })
    }
}

function testLight(req, res) {
    const lightColor = req.query.lightColor || '000000'
    rgbHub.write(`F1:${lightColor}\n`)
    rgbHub.write(`F2:${lightColor}\n`)
    rgbHub.write(`F3:${lightColor}\n`)
    rgbHub.write(`F4:${lightColor}\n`)
    rgbHub.write(`F5:${lightColor}\n`)
    if (lightColor != '000000')
        _setLightTimeout(5)
    return res.status(202).json({
        status: 'accepted'
    })
}

function _clearLight() {
    rgbHub.write(`F1:000000\n`)
    rgbHub.write(`F2:000000\n`)
    rgbHub.write(`F3:000000\n`)
    rgbHub.write(`F4:000000\n`)
    rgbHub.write(`F5:000000\n`)
}

function _setLightTimeout(dur) {
    lightOffTimeout = setTimeout(() => {
        // data.forEach((value) => {
        //     rgbHub.write(`F${value}:000000\n`)
        // })
        _clearLight()
    }, dur * 1000)
}

function _clearLightTimeout() {
    // _clearLight()
    if (lightOffTimeout != undefined)
        clearTimeout(lightOffTimeout)
}


module.exports = {
    getStock,
    getSuggestion,
    clearStock,
    getProductList,
    putToLight,
    putToLight_updateQuantity,
    pickToLight_search,
    pickToLight,
    getConfiguration,
    config,
    searchProduct,
    testLight,
    deleteProduct,
    getBin,
    deleteBin,
    createHistory,
    getHistory
};
