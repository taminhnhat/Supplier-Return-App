# DESCRIPTION
# REQUIREMENT
# INSTALLATION
# API
## 1. Add books to stock
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