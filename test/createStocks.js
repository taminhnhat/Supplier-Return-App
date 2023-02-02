const axios = require('axios');
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

const orderList = ['590028/20/XT/QV/ABQ', '467537/20/XT/QV/ABQ', '989722/20/XT/QV/ABQ']

function putToLight(binId, productId, orderId, productQuantity) {
    axios.post('http://192.168.1.42:3000/api/v1/putToLight/', {
        userId: "Minh_Nhat",
        productId: productId,
        orderId: orderId,
        binId: binId,
        productQuantity: productQuantity,
        binWidth: "5cm",
        lightColor: "00ff00"
    })
        .then(response => {
            // console.log(response.data)
        })
        .catch(error => {
            console.log(error.message);
        });
}

putToLight(0, productList[0], orderList[0], 2)
putToLight(1, productList[1], orderList[0], 4)
putToLight(2, productList[2], orderList[0], 56)
putToLight(3, productList[3], orderList[0], 21)
putToLight(4, productList[4], orderList[0], 98)
putToLight(5, productList[5], orderList[0], 53)
putToLight(6, productList[6], orderList[0], 23)
putToLight(0, productList[7], orderList[0], 24)
putToLight(1, productList[8], orderList[0], 2)

putToLight(7, productList[7], orderList[1], 4)
putToLight(8, productList[8], orderList[1], 34)
putToLight(0, productList[0], orderList[1], 43)
putToLight(1, productList[1], orderList[1], 11)
putToLight(3, productList[11], orderList[1], 17)
putToLight(9, productList[10], orderList[1], 54)
putToLight(10, productList[9], orderList[1], 30)

putToLight(0, productList[9], orderList[2], 3)
putToLight(1, productList[1], orderList[2], 3)
putToLight(2, productList[2], orderList[2], 3)
putToLight(4, productList[4], orderList[2], 3)
putToLight(5, productList[11], orderList[2], 3)
putToLight(9, productList[10], orderList[2], 3)
putToLight(10, productList[9], orderList[2], 3)
putToLight(11, productList[11], orderList[2], 3)