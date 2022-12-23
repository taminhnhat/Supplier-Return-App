require('dotenv').config({ path: './.env' })
const Stock = require('../Models/stock')
const rgbHub = require('../rgbHub')
const config = require('config')

let lightCursor_X = 0;
let lightCursor_Y = 0;
let binIndex = 0;
let binCoordinate_X = 0;
let binCoordinate_Y = 0;
const numOfLedPerStrip = process.env.NUM_OF_LED_PER_STRIP
const numOfStrip = process.env.NUM_OF_STRIP

async function getStock(req, res) {
    let result
    try {
        result = await Stock.find()
        if (result == null) {
            return res.status(404).json({ message: 'Cannot find subscriber' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    return res.status(200).json(result)
}

async function getBin(req, res) {
    let result
    try {
        result = await Stock.findById(req.params.id)
        if (result == null) {
            return res.status(404).json({ message: 'Cannot find subscriber' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    return res.status(200).json(result)
}

async function deleteBin(req, res) {
    //
}

async function searchProduct(req, res) {
    let result = [];
    try {
        // get all stock from db
        const stocks = await Stock.find()
        if (stocks == null) {
            return res.status(404).json({ message: 'Cannot find stock' })
        }
        stocks.forEach(stock => {
            stock.stocks.forEach(ele => {
                if (ele == req.query.productId) result.push(stock);
            })
        });
        result.forEach(element => {
            rgbHub.emit(`W1:${element.startPoint}:${element.endPoint}:${element.lightColor}\n`)
        });
        return res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

async function deleteProduct(req, res) {
    try {
        const productId = req.params.id
        const allBin = await _getStockByBarcode(req, res)
        if (allBin.length == 0)
            return res.status(404).json({ message: `Stock ${productId} not found` })
        // find matched Product
        allBin.forEach((stock, index) => {
            stock.stocks.forEach((pro, idx) => {
                // 
                if (pro.productId == matchProductId) stock.stocks.splice(idx, 1)
            })
        })
        let result = []
        allBin.forEach(async (stock, index) => {
            const out = await stock.save()
            result.push(out)
            if (index == stocksChange.length - 1) return res.status(200).json(result)
        })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

async function getConfiguration(req, res) {
    const result = JSON.parse(process.env.BIN_WIDTH_VALUE_ARRAY_IN_CM)
    console.log('configurations', result)
    if (result == null) {
        return res.status(500).json({
            message: 'Cannot find configurations'
        })
    }
    else {
        return res.status(200).json(result)
    }
}

async function addStock(req, res) {
    //   {
    //     "barcode": "3467343908",
    //     "extendVolume": false,
    //     "mergeVolume": false,
    //     "size": "20cm",
    //     "mergeBarcode": "7862398125637"
    // }
    console.log(req.body)
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
            return res.status(500).json({ message: 'Not a valid api' });
    }

    async function handleMergeMode(req, res) {
        try {
            const stocks = await Stock.find()
            if (stocks == null || stocks.length == 0) {
                return res.status(404).json({ message: 'Stock is empty, cannot merge' })
            }

            rgbHub.emit(`F1:000000`);

            let result = []
            let a = new Promise((resolve, reject) => {
                stocks.forEach((stock, index) => {
                    stock.stocks.forEach(ele => {
                        if (ele.productId == req.body.mergeId) {
                            result.push(stock)
                        }
                    })
                    if (index == stocks.length - 1) resolve(result)
                });
            })
            a.then(async (result) => {
                // take the last bin
                const stock = result[result.length - 1]
                stock.stocks.push({
                    productId: req.body.productId,
                    orderId: req.body.orderId
                })

                rgbHub.emit(`W1:${stock.startPoint}:${stock.endPoint}:${stock.lightColor}\n`)
                return res.status(201).json({ stock })

            }, () => {
                return res.status(500).json({ message: 'ERROR' })
            })

            // if (result.length == 0) return res.status(404).json({ message: 'Cannot find stock' })
            // else
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
    async function handleExtendMode(req, res) {
        _createVolume(req, res)
    }
    async function handleDefaultMode(req, res) {
        try {
            const allBin = await Stock.find()
            console.log('stock', allBin)
            if (allBin == null) {
                return res.status(404).json({ message: 'Cannot find stock' })
            }
            else if (allBin.length == 0) _createVolume(req, res)
            else {
                let result = new Array
                allBin.forEach(eachBin => {
                    eachBin.stocks.forEach(pro => {
                        if (pro.productId == req.body.productId) result.push(eachBin)
                    })
                });
                if (result.length == 0) {
                    _createVolume(req, res)
                }
                else {
                    rgbHub.emit(`F1:000000\n`);
                    // result.forEach(ele => {
                    //     rgbHub.emit(`W1:${ele.startPoint}:${ele.endPoint}:${ele.lightColor}\n`);
                    // })
                    const tempRes = result[result.length - 1]
                    rgbHub.emit(`W1:${tempRes.startPoint}:${tempRes.endPoint}:${tempRes.lightColor}\n`)
                    return res.json(tempRes)
                }
            }
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
}

async function putToLight(req, res) {
    // get all bin from db
    const allBin = await Stock.find()
    if (allBin == null) {
        // empty stock, create new bin
        createBin(req, res)
    }

    let matchBin
    allBin.forEach((eachBin, index) => {
        if (eachBin.binId == req.body.binId) matchBin = eachBin
    })
    console.log(matchBin)
    if (matchBin == undefined) {
        // no bin is matched, so create new bin
        createBin(req, res)
    }
    else {
        // update matched bin
        updateBin(req, res)
    }

    async function createBin(req, res) {
        //
        const lightColor = req.body.lightColor
        const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER)
        const binWidthInCm = Number(req.body.binWidth.replace('cm', ''))
        //
        let startPoint = lightCursor_X
        let endPoint = lightCursor_X + Math.floor(binWidthInCm / 100 * ledsPerMetterOfLedStrip) - 1
        // if row is full, add new row
        if (endPoint >= numOfLedPerStrip) {
            // if no row to expand
            if (lightCursor_Y + 1 >= numOfStrip)
                return res.status(500).json({ message: 'Not enough space, use merge stock instead' })
            else {
                lightCursor_Y += 1
                endPoint = endPoint - startPoint
                startPoint = 0
            }
        }

        const stock = new Stock({
            startPoint: startPoint,
            endPoint: endPoint,
            binId: binIndex,
            XCoordinate: binCoordinate_X,
            YCoordinate: binCoordinate_Y,
            stocks: [{
                productId: req.body.productId,
                orderId: req.body.orderId,
                productQuantity: req.body.productQuantity
            }]
        });
        binIndex += 1
        try {
            const newStock = await stock.save();
            rgbHub.emit(`F1:000000\n`);
            rgbHub.emit(`W1:${startPoint}:${endPoint}:${lightColor}\n`);
            return res.status(201).json({
                status: 'success',
                object: 'add_result',
                data: newStock
            });

        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    async function updateBin(req, res) {
        // find match product in bin
        let isAnyMatchedProduct
        matchBin.stocks.forEach((eachProduct, productIndex) => {
            if (eachProduct.productId == req.body.productId) {
                // update product quantity
                eachProduct.productQuantity += req.body.productQuantity
                isAnyMatchedProduct = true
            }
        })
        console.log('isAnyMatchedProduct', isAnyMatchedProduct)
        // if no product matched, add new product
        if (isAnyMatchedProduct == false) {
            matchBin.stocks.push({
                productId: req.body.productId,
                orderId: req.body.orderId,
                productQuantity: req.body.productQuantity
            })
        }

        try {
            console.log(matchBin)
            // save matched bin
            const newBin = await matchBin.save()
            rgbHub.emit(`F1:000000\n`)
            rgbHub.emit(`W${matchBin.YCoordinate}:${matchBin.startPoint}:${matchBin.endPoint}:${req.body.lightColor}\n`)
            return res.status(201).json(newBin)
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

async function pickToLight(req, res) {
    let result = [];
    try {
        const stocks = await Stock.find()
        if (stocks == null) {
            return res.status(404).json({ message: 'Cannot find stock' })
        }
        stocks.forEach(stock => {
            stock.stocks.forEach(ele => {
                if (ele.productId == req.body.productId) result.push(stock);
            })
        });
        result.forEach(element => {
            rgbHub.emit(`W1:${element.startPoint}:${element.endPoint}:${element.lightColor}\n`)
        });
        return res.status(200).json({
            status: 'success',
            results: result.length,
            data: result
        })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

async function clearStock(req, res) {
    try {
        const stocks = await Stock.find()
        stocks.forEach(async stock => {
            await stock.remove()
        })
        lightCursor_X = 0
        lightCursor_Y = 0
        binIndex = 0
        binCoordinate_X = 0
        binCoordinate_Y = 0
        res.json({ message: 'Deleted stocks' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

async function reload(req, res) {
    try {
        const stocks = await Stock.find()
        if (stocks == null) {
            console.log('Cannot find stocks')
        }
        stocks.forEach(stock => {
            if (stock.endPoint >= lightCursor_X) lightCursor_X = stock.endPoint + 1
            if (stock.XCoordinate >= binCoordinate_X) binCoordinate_X = stock.XCoordinate + 1
            if (stock.YCoordinate >= binCoordinate_Y) binCoordinate_Y = stock.YCoordinate + 1
            if (stock.binId >= binIndex) binIndex = stock.binId + 1
        })
    } catch (err) {
        console.log(err.message)
    }
}

async function _createVolume(req, res) {
    let startPoint = lightCursor_X;
    const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER);
    let endPoint = lightCursor_X + Math.floor(Number(req.body.binWidth.replace('cm', '')) / 100 * ledsPerMetterOfLedStrip) - 1;
    const lightColor = req.body.lightColor;
    if (endPoint >= numOfLedPerStrip) {
        if (lightCursor_Y + 1 >= numOfStrip)
            return res.status(500).json({ message: 'Not enough space, use merge stock instead' })
        else {
            endPoint = endPoint - startPoint
            startPoint = 0
        }
    }
    const newStock = {
        startPoint: startPoint,
        endPoint: endPoint,
        binId: binIndex,
        XCoordinate: binCoordinate_X,
        YCoordinate: binCoordinate_Y,
        stocks: {
            productId: req.body.productId,
            orderId: req.body.orderId
        }
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
        const stocks = await Stock.find()
        if (stocks == null) {
            return res.status(404).json({ message: 'Cannot find stock' })
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
