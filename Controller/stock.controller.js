require('dotenv').config({ path: './.env' })
const StockCollection = require('../Models/stock')
const BackupCollection = require('../Models/backup')
const rgbHub = require('../rgbHub')

let lightCursor = 0;
let binIndex_Default = 0;
let binIndex_X = 0;
let binIndex_Y = 0;
const numOfLedPerStrip = process.env.NUM_OF_LED_PER_STRIP
const numOfStrip = process.env.NUM_OF_STRIP

reload()

async function getStock(req, res) {
    try {
        const result = await StockCollection.find()
        if (result == null)
            return res.status(500).json({
                status: 'fail',
                message: 'Stock is empty'
            })
        else
            return res.status(200).json({
                status: 'success',
                data: result
            })
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
}

async function getBin(req, res) {
    let result
    try {
        result = await StockCollection.findById(req.params.id)
        if (result == null) {
            return res.status(500).json({
                status: 'fail',
                message: 'Stock is empty'
            })
        }
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
    return res.status(200).json({
        status: 'success',
        data: result
    })
}

async function deleteBin(req, res) {
    //
}

async function searchProduct(req, res) {

    const matchedProductId = req.query.productId
    const matchedOrderId = req.query.orderId
    const lightOnFlag = req.query.lightOn || 'false'
    console.log('lightOnFlag:', lightOnFlag)
    // query
    let queryObj = { stocks: { $elemMatch: {} } }
    if (matchedProductId != undefined) queryObj.stocks.$elemMatch.productId = matchedProductId
    if (matchedOrderId != undefined) queryObj.stocks.$elemMatch.orderId = matchedOrderId
    try {
        // get matched bin
        const allBin = await StockCollection.find(queryObj, { _id: 0, coordinate: 1, binId: 1, stocks: 1 })
        // if stock is empty
        if (allBin == null) {
            return res.status(500).json({
                status: 'fail',
                message: 'Stock is empty'
            })
        }
        // lightOn mode
        if (lightOnFlag == 'true')
            allBin.forEach(eachBin => {
                rgbHub.emit(`F${eachBin.coordinate.Y_index}:000000\n`)
                rgbHub.emit(`W${eachBin.coordinate.Y_index}:${eachBin.coordinate.startPoint}:${eachBin.coordinate.endPoint}:${process.env.FINDING_MODE_LIGHT_COLOR}\n`)
            });
        return res.status(200).json({
            status: 'success',
            data: allBin
        })
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
}

async function deleteProduct(req, res) {
    try {
        // get matched bin
        const productId = String(req.params.productId)
        const allBin = await StockCollection.find({ stocks: { $elemMatch: { productId: productId } } })
        // if stock is empty
        if (allBin == null)
            return res.status(500).json({
                status: 'fail',
                message: 'Stock is empty'
            })
        // if no bin have matched product
        if (allBin.length == 0)
            return res.status(404).json({
                status: 'fail',
                message: `Product ${productId} not found`
            })
        // remove matched Product
        allBin.forEach((eachBin, index) => {
            eachBin.stocks.forEach((eachProduct, idx) => {
                if (eachProduct.productId == productId) eachBin.stocks.splice(idx, 1)
            })
        })
        // update stock
        let result = []
        allBin.forEach(async (stock, index) => {
            const out = await stock.save()
            result.push(out)
            if (index == allBin.length - 1) return res.status(200).json({
                status: 'success',
                data: result
            })
        })
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
}

async function getConfiguration(req, res) {
    const result = JSON.parse(process.env.BIN_WIDTH_VALUE_ARRAY_IN_CM)
    if (result == null) {
        return res.status(500).json({
            status: 'fail',
            message: 'Cannot find configurations'
        })
    }
    else {
        return res.status(200).json({
            status: 'success',
            data: result
        })
    }
}

async function addStock(req, res) {
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
            return res.status(400).json({
                status: 'fail',
                message: 'Not a valid api'
            });
    }

    async function handleMergeMode(req, res) {
        try {
            const queryObj = { stocks: { $elemMatch: { productId: req.body.mergeId } } }
            const allBin = await StockCollection.find(queryObj)
            if (allBin == null)
                return res.status(500).json({
                    status: 'fail',
                    message: 'Stock is empty'
                })
            if (allBin.length == 0)
                return res.status(404).json({
                    status: 'fail',
                    message: 'Not found mergeId'
                })

            const matchedBin = allBin[allBin.length - 1]
            matchedBin.stocks.push({
                productId: req.body.productId,
                orderId: req.body.orderId
            })

            rgbHub.emit(`F1:000000\n`);
            rgbHub.emit(`W1:${matchedBin.coordinate.startPoint}:${matchedBin.coordinate.endPoint}:${process.env.PUTTING_MODE_LIGHT_COLOR}\n`)
            return res.status(200).json({
                status: 'success',
                data: matchedBin
            })

            // let result = []
            // let a = new Promise((resolve, reject) => {
            //     allBin.forEach((stock, index) => {
            //         stock.stocks.forEach(ele => {
            //             if (ele.productId == req.body.mergeId) {
            //                 result.push(stock)
            //             }
            //         })
            //         if (index == allBin.length - 1) resolve(result)
            //     });
            // })
            // a.then(async (result) => {
            //     // take the last bin
            //     const stock = result[result.length - 1]
            //     stock.stocks.push({
            //         productId: req.body.productId,
            //         orderId: req.body.orderId
            //     })

            //     rgbHub.emit(`W1:${stock.coordinate.startPoint}:${stock.coordinate.endPoint}:${stock.lightColor}\n`)
            //     return res.status(201).json({ stock })

            // }, (err) => {
            //     return res.status(500).json({ message: err })
            // })

        } catch (err) {
            console.log(err.message)
            return res.status(500).json({
                status: 'fail',
                message: err.message
            })
        }
    }
    async function handleExtendMode(req, res) {
        _createVolume(req, res)
    }
    async function handleDefaultMode(req, res) {
        try {
            const queryObj = { stocks: { $elemMatch: { productId: req.body.productId } } }
            const allBin = await StockCollection.find(queryObj)
            if (allBin == null) {
                return res.status(500).json({
                    status: 'fail',
                    message: 'Stock is empty'
                })
            }
            else if (allBin.length == 0) _createVolume(req, res)
            else {
                // let result = new Array
                // allBin.forEach(eachBin => {
                //     eachBin.stocks.forEach(pro => {
                //         if (pro.productId == req.body.productId) result.push(eachBin)
                //     })
                // });
                // if (result.length == 0) {
                //     _createVolume(req, res)
                // }
                // else {
                // }
                const tempRes = allBin[allBin.length - 1]
                rgbHub.emit(`F${tempRes.coordinate.Y_index}:000000\n`)
                rgbHub.emit(`W${tempRes.coordinate.Y_index}:${tempRes.coordinate.startPoint}:${tempRes.coordinate.endPoint}:${process.env.PUTTING_MODE_LIGHT_COLOR}\n`)
                return res.status(200).json({
                    status: 'success',
                    data: tempRes
                })
            }
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({
                status: 'fail',
                message: err.message
            })
        }
    }
}

async function putToLight(req, res) {
    // get bin with the same binId, productId, orderId
    const binList_1 = await StockCollection.find({ binId: req.body.binId, stocks: { $elemMatch: { productId: req.body.productId, orderId: req.body.orderId } } })
    console.log('binList_1:', binList_1)
    try {
        if (binList_1.length == 1) {
            // update product quantity on this bin
            const thisBin = binList_1[0]
            updateProductQuantity(req, res, thisBin)
        }
        else if (binList_1.length == 0) {
            // get bin with the same binId only
            const binList_2 = await StockCollection.find({ binId: req.body.binId })
            console.log('binList_2:', binList_2)
            if (binList_2.length == 1) {
                // push new product to this bin
                const thisBin = binList_2[0]
                pushNewProduct(req, res, thisBin)
            }
            else if (binList_2.length == 0) {
                // create new bin
                createBin(req, res)
            }
            else {
                console.log('Not expected search from db, conflict data', binList_2)
            }
        }
        else {
            console.log('Not expected search from db, conflict data', binList_1)
        }
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
    // const allBin = await StockCollection.find({ binId: req.body.binId })
    // console.log(allBin)
    // if (allBin.length == 0) {
    //     // if no bin have the same input binId, create new bin
    //     createBin(req, res)
    // }
    // else if (allBin.length == 1) {
    //     // if one bin matched, update that bin
    //     updateBin(req, res)
    // }
    // else if (allBin.length > 1) {
    //     // bad db
    //     console.log('WARNING: SOME BINS HAVE SAME BINID', allBin)
    //     updateBin(req, res)
    // }
    // else {
    //     // log error here
    //     return res.status(500).json({
    //         status: 'fail',
    //         message: 'Stock is empty'
    //     })
    // }

    async function createBin(req, res) {
        //
        console.log('create new bin')
        const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER)
        const binWidthInCm = Number(req.body.binWidth.replace('cm', ''))
        //
        const deltaPoint = Math.floor(binWidthInCm / 100 * ledsPerMetterOfLedStrip) - 1
        let startPoint
        let endPoint
        // if row is full, add new row
        if (lightCursor + deltaPoint >= numOfLedPerStrip) {
            // if no row to expand
            if (binIndex_Y + 1 >= numOfStrip)
                return res.status(400).json({
                    status: 'fail',
                    message: 'Not enough space, use exist bin instead'
                })
            else {
                binIndex_Y += 1
                binIndex_X = 0
                startPoint = 0
                endPoint = deltaPoint
            }
        }
        else {
            startPoint = lightCursor
            endPoint = lightCursor + deltaPoint
        }

        const stock = new StockCollection({
            binId: binIndex_Default,
            coordinate: {
                startPoint: startPoint,
                endPoint: endPoint,
                X_index: binIndex_X,
                Y_index: binIndex_Y
            },
            stocks: [{
                productId: req.body.productId,
                orderId: req.body.orderId,
                productQuantity: req.body.productQuantity
            }]
        });
        let backup = await BackupCollection.findOne({})
        console.log('backup:', backup)
        lightCursor = endPoint + 1
        binIndex_X += 1
        binIndex_Default += 1
        backup.lightCursor = lightCursor
        backup.binIndex = binIndex_Default
        backup.binIndex_X = binIndex_X
        backup.binIndex_Y = binIndex_Y
        const newStock = await stock.save()
        const out = await backup.save()
        rgbHub.emit(`F1:000000\n`)
        rgbHub.emit(`W${binIndex_Y + 1}:${startPoint}:${endPoint}:${process.env.PUTTING_MODE_LIGHT_COLOR}\n`)
        return res.status(201).json({
            status: 'success',
            data: newStock
        })
    }

    // async function updateBin(req, res) {
    //     // find match product in bin
    //     console.log('update bin')
    //     const matchBin = allBin[allBin.length - 1]
    //     let ifProductMatch = false
    //     let ifOrderMatch = false
    //     let temp
    //     matchBin.stocks.forEach((eachProduct, productIndex) => {
    //         if (eachProduct.productId == req.body.productId) {
    //             temp = productIndex
    //             // eachProduct.productQuantity += req.body.productQuantity // do this not work
    //             ifProductMatch = true
    //             ifOrderMatch = eachProduct.orderId == req.body.orderId
    //         }
    //     })
    //     // if no product matched, add new product
    //     if (ifProductMatch == false) {
    //         matchBin.stocks.push({
    //             productId: req.body.productId,
    //             orderId: req.body.orderId,
    //             productQuantity: req.body.productQuantity
    //         })
    //     }
    //     // if product matched, update product quantity
    //     else if (ifProductMatch == true) {
    //         if (ifOrderMatch == true) {
    //             let matchProduct = matchBin.stocks[temp]
    //             matchProduct.productQuantity += req.body.productQuantity
    //             matchBin.stocks.push(matchProduct)
    //             matchBin.stocks.splice(temp, 1)
    //         }
    //         else {
    //             matchBin.stocks.push({
    //                 productId: req.body.productId,
    //                 orderId: req.body.orderId,
    //                 productQuantity: req.body.productQuantity
    //             })
    //         }
    //     }

    //     try {
    //         // save matched bin
    //         const newBin = await matchBin.save()
    //         rgbHub.emit(`F1:000000\n`)
    //         rgbHub.emit(`W${matchBin.coordinate.Y_index + 1}:${matchBin.coordinate.startPoint}:${matchBin.coordinate.endPoint}:${req.body.lightColor}\n`)
    //         return res.status(201).json({
    //             status: 'success',
    //             data: newBin
    //         })
    //     }
    //     catch (err) {
    //         console.log(err.message)
    //         return res.status(500).json({
    //             status: 'fail',
    //             message: err.message
    //         })
    //     }
    // }

    async function updateProductQuantity(req, res, thisBin) {
        console.log('update product quantity')
        thisBin.stocks.forEach(async (eachProduct, productIndex) => {
            if (eachProduct.productId == req.body.productId && eachProduct.orderId == req.body.orderId) {
                let updateProduct = eachProduct
                updateProduct.productQuantity += req.body.productQuantity
                thisBin.stocks.push(updateProduct)
                thisBin.stocks.splice(productIndex, 1)
                const updatedBin = await thisBin.save()
                rgbHub.emit(`F1:000000\n`)
                rgbHub.emit(`W${thisBin.coordinate.Y_index + 1}:${thisBin.coordinate.startPoint}:${thisBin.coordinate.endPoint}:${req.body.lightColor}\n`)
                return res.status(201).json({
                    status: 'success',
                    data: updatedBin
                })
            }
        })
    }

    async function pushNewProduct(req, res, thisBin) {
        console.log('push new product')
        thisBin.stocks.push({
            productId: req.body.productId,
            orderId: req.body.orderId,
            productQuantity: req.body.productQuantity
        })
        const updatedBin = await thisBin.save()
        rgbHub.emit(`F1:000000\n`)
        rgbHub.emit(`W${thisBin.coordinate.Y_index + 1}:${thisBin.coordinate.startPoint}:${thisBin.coordinate.endPoint}:${req.body.lightColor}\n`)
        return res.status(201).json({
            status: 'success',
            data: updatedBin
        })
    }
}

async function pickToLight(req, res) {
    try {
        // find all bin with input productId
        const allBin = await StockCollection.find({ stocks: { $elemMatch: { productId: req.body.productId } } }, { _id: 0, binId: 1, stocks: 1 })
        if (allBin.length == 0) {
            return res.status(500).json({
                status: 'fail',
                message: 'ProductId not found'
            })
        }
        else {
            allBin.forEach(element => {
                rgbHub.emit(`W1:${element.coordinate.startPoint}:${element.coordinate.endPoint}:${element.lightColor}\n`)
            });
            return res.status(200).json({
                status: 'success',
                data: allBin
            })
        }
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
}

async function clearStock(req, res) {
    try {
        const stocks = await StockCollection.find()
        stocks.forEach(async stock => {
            await stock.remove()
        })
        lightCursor = 0
        binIndex_Default = 0
        binIndex_X = 0
        binIndex_Y = 0
        const backup = await BackupCollection.find()
        backup.forEach(async ele => {
            await ele.remove()
        })
        await BackupCollection({
            lightCursor: lightCursor,
            binIndex: binIndex_Default,
            binIndex_X: binIndex_X,
            binIndex_Y: binIndex_Y
        }).save()
        res.status(200).json({
            status: 'success',
            message: 'Deleted stocks'
        })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
}

async function reload(req, res) {
    console.log(lightCursor, binIndex_Default, binIndex_X, binIndex_Y)

    try {
        // const stocks = await StockCollection.find({}, {}, { sort: { coordinate: { Y_index: - 1 } } })
        // console.log(stocks)
        // // stocks.forEach(stock => {
        // //     if (stock.endPoint >= lightCursor) lightCursor = stock.coordinate.endPoint + 1
        // //     if (stock.coordinate.Y_index >= binIndex_Y) binIndex_Y = stock.coordinate.Y_index
        // //     if (stock.binId >= binIndex) binIndex = stock.binId + 1
        // // })
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
            lightCursor = backup[0].lightCursor
            binIndex_Default = backup[0].binIndex
            binIndex_X = backup[0].binIndex_X
            binIndex_Y = backup[0].binIndex_Y
        }
        console.log(lightCursor, binIndex_Default, binIndex_X, binIndex_Y)

        rgbHub.emit(`F1:000000\n`)
        rgbHub.emit(`F2:000000\n`)
        rgbHub.emit(`F3:000000\n`)
        rgbHub.emit(`F4:000000\n`)
        rgbHub.emit(`F5:000000\n`)
    } catch (err) {
        console.log(err.message)
    }
}

async function _createVolume(req, res) {
    let startPoint = lightCursor;
    const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER);
    let endPoint = lightCursor + Math.floor(Number(req.body.binWidth.replace('cm', '')) / 100 * ledsPerMetterOfLedStrip) - 1;
    const lightColor = req.body.lightColor;
    if (endPoint >= numOfLedPerStrip) {
        if (binIndex_Y + 1 >= numOfStrip)
            return res.status(500).json({
                status: 'fail',
                message: 'Not enough space, use merge stock instead'
            })
        else {
            endPoint = endPoint - startPoint
            startPoint = 0
        }
    }
    rgbHub.emit(`F${binIndex_Y}:000000\n`)
    rgbHub.emit(`W${binIndex_Y}:${startPoint}:${endPoint}:${process.env.PUTTING_MODE_LIGHT_COLOR}\n`)
    const newStock = {
        binId: binIndex_Default,
        coordinate: {
            startPoint: startPoint,
            endPoint: endPoint,
            X_index: binIndex_X,
            Y_index: binIndex_Y
        },
        stocks: [{
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

async function _getStockByBarcode(req, res) {
    try {
        let result = [];
        const stocks = await StockCollection.find()
        if (stocks == null) {
            return res.status(500).json({
                status: 'fail',
                message: 'Stock is empty'
            })
        }
        stocks.forEach(stock => {
            stock.stocks.forEach(ele => {
                if (ele.productId == req.params.id) result.push(stock);
            })
        });
        return result
    } catch (err) {
        throw err
        return null
    }
}

function _deleteByBarcode(stocks, matchProductId) {
    stocks.forEach((stock, index) => {
        stock.stocks.forEach((pro, idx) => {
            if (pro.productId == matchProductId) stock.stocks.splice(idx, 1)
        })
    })
    return stocks
}

module.exports = { getStock, addStock, clearStock, reload, putToLight, pickToLight, getConfiguration, searchProduct, deleteProduct, getBin, deleteBin };
