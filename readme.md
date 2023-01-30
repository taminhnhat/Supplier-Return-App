# Table of contents
# DESCRIPTION
# REQUIREMENT
- Platform: raspberry pi 3 B+/4  
- Os: ubuntu server 20.04 LTS (without desktop)  
- Mongodb server for raspberry pi using this [guide](https://developer.mongodb.com/how-to/mongodb-on-raspberry-pi/)
- [Node.js](https://github.com/nodesource/distributions/blob/master/README.md) 14.x
# SETUP
- Install all [requirements](#requirements)
- Set static dhcp
- Set static serial port path
- Test
- Create and start service
# Run
- Create .env file in .../Suplier-Return-App/.env
```
NODE_ENV=development
HTTP_PORT=3000
DATABASE_URL=mongodb://localhost:27017/merge-order-shelf
RGB_HUB_PATH=COM7
RGB_DEBUG_MODE=true
NUM_OF_LED_PER_STRIP=80
BIN_WIDTH_VALUE_ARRAY_IN_CM={"binWidth":["15cm","20cm","25cm","30cm","35cm","40cm"]}
FINDING_MODE_LIGHT_COLOR=ffff00
PUTTING_MODE_LIGHT_COLOR=00ff00
NUM_OF_STRIP=4
LEDS_PER_METTER=60
```
|Property|Type|Description|  
|---|---|---|
|NODE_ENV|development/production||
|RGB_HUB_PATH|serial port path||
|RGB_DEBUG_MODE|true/false||
|NUM_OF_LED_PER_STRIP|Number||
|BIN_WIDTH_VALUE_ARRAY_IN_CM|||
|FINDING_MODE_LIGHT_COLOR|color code in hexa||
|PUTTING_MODE_LIGHT_COLOR|color code in hexa||
# API
## 1. Retrieve all products
### Request
GET /api/v1/products

### Respond
```json
[
    {
        "_id": "639306f5d786cee674e711af",
        "startPoint": 0,
        "endPoint": 11,
        "binId": 0,
        "XCoordinate": 0,
        "YCoordinate": 0,
        "stocks": [
            "67435928347652837"
        ],
        "dateCreated": "2022-12-09T09:59:17.097Z",
        "__v": 0
    },
    {
        "_id": "639306f5d786cee674e711b1",
        "startPoint": 12,
        "endPoint": 23,
        "binId": 1,
        "XCoordinate": 1,
        "YCoordinate": 0,
        "stocks": [
            "2345734378621376"
        ],
        "dateCreated": "2022-12-09T09:59:17.935Z",
        "__v": 0
    },
    {...}
]
```
|Property|Type|Description|  
|---|---|---|
||||
## 2. Request bin to add products
### Request
|Property|Type|Description|
|---|---|---|
|barcode|String||
|extendVolume|bool||
|mergeVolume|bool||
|size|String||
|lightColor|String||
|mergeBarcode|String||
```
POST url/api/v1/stocks
content-type: application/json

{
    "barcode": "34t2345623467",
    "extendVolume": false,
    "mergeVolume": false,
    "size": "10cm",
    "lightColor": "00ff00",
    "mergeBarcode": "34t2345623467"
}
```
### Respond
```
{
    "status": "success",
    "object": "add_result",
    "url": "/api/v1/stocks",
    "data":{
        "startPoint": 48,
        "endPoint": 59,
        "index": 7,
        "lightColor": "00ff00",
        "stocks": [
            "98732645865",
            "34523t8ouiy"
        ],
        "_id": "6371be1456a2294204bf8ec4",
        "dateCreated": "2022-11-14T04:03:32.884Z",
        "__v": 0
    }
}
```
## 3. Delete 
## 2. Pick books from stock
### Delete stocks by barcode
```
DELETE url/api/v1/stocks/books/:barcode
```
### Respond
```
{
    "status": "success",
    "object": "delete_result",
    "url": "/api/v1/stocks/books",
    "results": 4,
    "data": [
        {
            "_id": "633bf71fbdafab0fb7c336f6",
            "startPoint": 12,
            "endPoint": 17,
            "index": 2,
            "lightColor": "00ff00",
            "stocks": [],
            "dateCreated": "2022-10-04T09:04:31.802Z",
            "__v": 3
        },
        {...},
        {...}
    ]
}
```
### Delete all stocks
```
DELETE url/api/v1/stocks/
```
### Respond
```
{
    "status": "success",
    "object": "delete_result",
    "url": "/api/v1/stocks/books"
}
```
## 3. Find books in stock
### Getting all stock
```
GET http://localhost:3000/api/v1/stocks
```
### Respond
```
{
    "status": "success",
    "object": "search_result",
    "url": "/api/v1/stocks",
    "data":[
        {
            "_id": "633bf712bdafab0fb7c336ef",
            "startPoint": 0,
            "endPoint": 5,
            "index": 0,
            "lightColor": "00ff00",
            "stocks": [
                "34519736549",
                "265827364"
            ],
            "dateCreated": "2022-10-04T09:04:18.929Z",
            "__v": 1
        },
        {...},
        {...}
    ]
}
```
### Getting stock by barcode
```
GET http://localhost:3000/api/v1/stocks/books/:barcode
```
### Respond
```
{
    "status": "success",
    "object": "search_result",
    "url": "/api/v1/stocks/books",
    "results": 3,
    "data": [
        {
            "_id": "633bf71fbdafab0fb7c336f6",
            "startPoint": 12,
            "endPoint": 17,
            "index": 2,
            "lightColor": "00ff00",
            "stocks": [],
            "dateCreated": "2022-10-04T09:04:31.802Z",
            "__v": 3
        },
        {...},
        {...}
    ]
}
```
