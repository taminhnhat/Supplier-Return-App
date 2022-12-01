require('dotenv').config({ path: './.env' })
const Stock = require('../Models/stock')
const rgbHub = require('../rgbHub')
const config = require('config')

let lightCursor_X = 0;
let lightCursor_Y = 0;
let lightIndex = 0;
const numOfLedPerStrip = process.env.NUM_OF_LED_PER_STRIP
const numOfStrip = process.env.NUM_OF_STRIP
const numOfLed = numOfLedPerStrip * numOfStrip

async function getStock(req, res) {
    console.log(req.query)
    let result
    try {
        result = await Stock.find()
        if (result == null) {
            return res.status(404).json({ message: 'Cannot find subscriber' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    return res.status(200).json({
        status: 'success',
        results: result.length,
        data: result
    })
}

async function getStockById(req, res) {
    let result
    try {
        result = await Stock.findById(req.params.id)
        if (result == null) {
            return res.status(404).json({ message: 'Cannot find subscriber' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    return res.status(200).json({
        status: 'success',
        data: result
    })
}

async function deleteStockById(req, res) {
    //
}

async function getStockByBarcode(req, res) {
    let result = [];
    try {
        const stocks = await Stock.find()
        if (stocks == null) {
            return res.status(404).json({ message: 'Cannot find stock' })
        }
        stocks.forEach(stock => {
            stock.stocks.forEach(ele => {
                if (ele == req.params.barcode) result.push(stock);
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

async function removeBooksInStock(req, res) {
    try {
        const stocks = await _getStockByBarcode(req, res)
        if (stocks.length == 0) return res.status(404).json({ message: `Stock ${req.params.barcode} not found` })
        const stocksChange = _deleteByBarcode(stocks, req.params.barcode)
        let result = []
        stocksChange.forEach(async (stock, index) => {
            const out = await stock.save()
            result.push(out)
            if (index == stocksChange.length - 1) return res.status(200).json({
                status: 'success',
                results: result.length,
                data: result
            })
        })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

async function getConfigurations(req, res) {
    const result = JSON.parse(process.env.BIN_WIDTH_VALUE_ARRAY_IN_CM)
    console.log('configurations', result)
    if (result == null) {
        return res.status(500).json({
            status: 'fail',
            message: 'Cannot find configurations'
        })
    }
    else {
        return res.status(200).json({
            status: 'success',
            results: result.length,
            result: result
        })
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
    const defaultMode = req.body.extendVolume == false && req.body.mergeVolume == false
    const extendMode = req.body.extendVolume == true && req.body.mergeVolume == false
    const mergeMode = req.body.extendVolume == false && req.body.mergeVolume == true

    if (extendMode) {
        _createVolume(req, res)
    }
    else if (mergeMode) {
        handleMergeMode(req, res)
    }
    else if (defaultMode) {
        handleDefaultMode(req, res)
    }
    else {
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
                        if (ele == req.body.mergeBarcode) {
                            result.push(stock)
                        }
                    })
                    if (index == stocks.length - 1) resolve(result)
                });
            })
            a.then(async (result) => {
                const stock = result[result.length - 1]
                stock.stocks.push(req.body.barcode)
                const newStock = await stock.save()
                rgbHub.emit(`W1:${stock.startPoint}:${stock.endPoint}:${stock.lightColor}\n`)
                return res.status(201).json(newStock);
            }, () => {
                return res.status(500).json({ message: 'ERROR' })
            })

            // if (result.length == 0) return res.status(404).json({ message: 'Cannot find stock' })
            // else
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
    async function handleDefaultMode(req, res) {
        try {
            const stocks = await Stock.find()
            if (stocks == null) {
                return res.status(404).json({ message: 'Cannot find stock' })
            }
            else if (stocks.length == 0) _createVolume(req, res)
            else {
                let result = new Array
                stocks.forEach(stock => {
                    stock.stocks.forEach(ele => {
                        if (ele == req.body.barcode) result.push(stock)
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

async function clearStock(req, res) {
    try {
        const stocks = await Stock.find()
        stocks.forEach(async stock => {
            await stock.remove()
        })
        lightCursor_X = 0
        lightCursor_Y = 0
        lightIndex = 0
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
            if (stock.index >= lightIndex) lightIndex = stock.index + 1
        })
    } catch (err) {
        console.log(err.message)
    }
}

async function _createVolume(req, res) {
    const startPoint = lightCursor_X;
    const ledsPerMetterOfLedStrip = Number(process.env.LEDS_PER_METTER);
    const endPoint = lightCursor_X + Math.floor(Number(req.body.size.replace('cm', '')) / 100 * ledsPerMetterOfLedStrip) - 1;
    const lightColor = req.body.lightColor;
    if (endPoint >= numOfLedPerStrip) {
        lightCursor_Y += 1
        if (lightCursor_Y >= numOfStrip)
            return res.status(500).json({ message: 'Not enough space, use merge stock instead' })
        else {
            endPoint = endPoint - startPoint
            startPoint = 0;
        }
    }
    let stocks = [];
    stocks.push(req.body.barcode);
    const stock = new Stock({
        startPoint: startPoint,
        endPoint: endPoint,
        index: lightIndex,
        lightColor: lightColor,
        stocks: stocks
    });
    lightCursor_X = endPoint + 1;
    lightIndex++;
    try {
        const newStock = await stock.save();
        rgbHub.emit(`F1:000000\n`);
        rgbHub.emit(`W1:${startPoint}:${endPoint}:${lightColor}\n`);
        return res.status(201).json({
            status: 'success',
            object: 'add_result',
            url: '/api/v1/stocks',
            data: newStock
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
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
                if (ele == req.params.barcode) result.push(stock);
            })
        });
        return result
    } catch (err) {
        throw err
        return null
    }
}

function _deleteByBarcode(stocks, matchSku) {
    stocks.forEach((stock, index) => {
        stock.stocks.forEach((sku, idx) => {
            if (sku == matchSku) stock.stocks.splice(idx, 1)
        })
    })
    return stocks
}


module.exports = { getStock, getStockByBarcode, removeBooksInStock, getStockById, getConfigurations, deleteStockById, addStock, clearStock, reload };
