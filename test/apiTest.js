const axios = require('axios');
data = {
    userId: 'Minh_Nhat',
    productId: '4567',
    orderId: '590028/20/XT/QV/ABQ',
    arrangeMode: 'merge',
    binWidth: '20cm',
    mergeId: '1234'
}
axios.post('http://192.168.1.43:3000/api/v1/products',
    data,
    {
        headers: {
            api_key: 'mgw_cEfRlzOgO2EwRe9ha7Ho'
        }
    })
    .then(response => {
        console.log(response.data)
    })
    .catch(error => {
        console.log(error.response.data);
    });
