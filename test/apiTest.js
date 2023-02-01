const axios = require('axios');

axios.get('http://192.168.1.42:3000/api/v1/products/search?productId=7863445673400&lightOn=false')
    .then(response => {
        console.log(response.data)
    })
    .catch(error => {
        console.log(error.message);
    });
