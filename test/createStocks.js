const axios = require('axios');
require('dotenv').config({ path: '../.env' })
const token = process.env.TOKEN_SECRET
const productList = [
    '0100876534276',
    '0200710478546',
    '0300896356368',
    '0400775101058',
    '0500343625172',
    '0600610513865',
    '0700110382456',
    '0800721061103',
    '0900483065287',
    '1000869093563',
    '1100445673400',
    '1200760987632',
    '1300076286414',
    '1400576328893',
    '1500739800303',
    '1600404300043',
    '1700042387222',
    '1800756434674',
    '1900483023028',
    '2000852790291',
    '2100347569268',
    '2200362738387',
    '2300873048080',
    '2400245879803',
    '2500450298039',
    '2600398740939',
    '2700348634987',
    '2800382754089',
    '2900839799823',
    '3000364765378']

const orderList = ['590028/20/XT/QV/ABQ', '467537/20/XT/QV/ABQ', '989722/20/XT/QV/ABQ', '345628/20/XT/QV/ABQ', '228001/20/XT/QV/ABQ', '377220/20/XT/QV/ABQ']
const vendorList = ['Kim Dong', 'Nhat Tinh Anh', 'NXB Tre']
const userList = ['Minh_Nhat', 'Duc_Long', 'Viet_Son']
const url = 'http://localhost:3000/api/v1/putToLight/'
const head = { headers: { api_key: 'mgw_cEfRlzOgO2EwRe9ha7Ho' } }
function pro(binId, vendorName) {
    return {
        userId: userList[Math.floor(Math.random() * userList.length)],
        productId: productList[Math.floor(Math.random() * productList.length)],
        productName: 'Đồ chơi',
        vendorName: vendorName,
        M_Product_ID: "wyug-wrfqv-evreh",
        orderId: orderList[Math.floor(Math.random() * orderList.length)],
        binId: binId,
        price: '20.000đ',
        passedProductQuantity: Math.floor(Math.random() * 26 + 5),
        scrappedProductQuantity: Math.floor(Math.random() * 1),
        notIncludedInOrder: false,
        binWidth: "20cm"
    }
}
async function createStock() {
    try {
        // await axios.delete(url, head)

        for (let binIdx = 0; binIdx < 45; binIdx++) {
            const Amount = Math.floor(Math.random() * 4 + 1)
            for (i = 0; i < Amount; i++) {
                await axios.post(url, pro(binIdx, vendorList[1]), head)
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
}
createStock()
// setTimeout(() => putToLight(0, productList[0], orderList[0], 2), 100)
// setTimeout(() => putToLight(1, productList[1], orderList[0], 4), 200)
// setTimeout(() => putToLight(2, productList[2], orderList[0], 56), 300)
// setTimeout(() => putToLight(3, productList[3], orderList[0], 21), 400)
// setTimeout(() => putToLight(4, productList[4], orderList[0], 98), 500)
// setTimeout(() => putToLight(5, productList[5], orderList[0], 53), 600)
// setTimeout(() => putToLight(6, productList[6], orderList[0], 23), 700)
// setTimeout(() => putToLight(7, productList[7], orderList[0], 22), 800)
// setTimeout(() => putToLight(8, productList[8], orderList[0], 72), 900)
// setTimeout(() => putToLight(9, productList[9], orderList[0], 3), 1000)

// setTimeout(() => putToLight(0, productList[0], orderList[1], 1), 1100)
// setTimeout(() => putToLight(2, productList[0], orderList[0], 2), 1200)
// setTimeout(() => putToLight(7, productList[0], orderList[1], 3), 1300)

// setTimeout(() => putToLight(7, productList[9], orderList[0], 1), 1400)
// setTimeout(() => putToLight(4, productList[9], orderList[0], 2), 1500)

// putToLight(0, productList[0], orderList[1], 32)
// putToLight(1, productList[1], orderList[1], 5)
// putToLight(3, productList[3], orderList[1], 1)
// putToLight(5, productList[5], orderList[1], 3)
// putToLight(6, productList[6], orderList[1], 9)
// putToLight(8, productList[8], orderList[1], 5)
// putToLight(9, productList[9], orderList[1], 6)

// putToLight(1, productList[1], orderList[2], 12)
// putToLight(2, productList[2], orderList[2], 5)
// putToLight(3, productList[3], orderList[2], 2)
// putToLight(8, productList[8], orderList[2], 11)
// putToLight(9, productList[9], orderList[2], 17)


