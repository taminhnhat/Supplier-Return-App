const axios = require('axios');
const productList = ['3652876534276',
    '4713710478546',
    '1016896356368',
    '4147775101058',
    '5436343625172',
    '1019610513865',
    '7104110382456',
    '1210721061103',
    '3749483065287',
    '1347869093563',
    '7863445673400',
    '1342760987632']
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
putToLight(0, productList[7], orderList[0], 23)
putToLight(1, productList[8], orderList[0], 23)

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
