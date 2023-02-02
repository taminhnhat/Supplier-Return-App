eachBin = { stocks: [{ productId: 12, orderId: 1 }, { productId: 23, orderId: 2 }, { productId: 23, orderId: 3 }, { productId: 23, orderId: 4 }, { productId: 34, orderId: 5 }, { productId: 34, orderId: 6 }] }
eachBin_2 = { stocks: [{ productId: 12, orderId: 1 }, { productId: 23, orderId: 2 }, { productId: 23, orderId: 3 }, { productId: 23, orderId: 4 }, { productId: 34, orderId: 5 }, { productId: 34, orderId: 6 }] }
eachBin.stocks.forEach((eachProduct, idx) => {
    console.log(`loop ${idx + 1}: ${eachProduct.orderId}`)
    if (eachProduct.productId == 23) {
        eachBin.stocks.splice(idx, 1)
        console.log('->', JSON.stringify(eachBin))
    }
})
console.log('result', JSON.stringify(eachBin))

const out = eachBin_2.stocks.filter((value, index, array) => {
    return value.productId != 23
},)
console.log('out', out)

while (eachBin_2.stocks[1] == 23) {
    eachBin_2.stocks.splice(1, 1)
}
console.log('result', JSON.stringify(eachBin_2))
