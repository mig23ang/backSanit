const mongoose = require('mongoose');
let Product = require('../models/product');
let Supply = require('../models/supply');
const strTool = require("../tools/stringTools");

module.exports = {
    getProductTypes,
    getProductsRaw,
    getProductTypesPaginated,
    getProductTypesFilter,
    addProduct,
    updateProduct,
    getProductById,
    depureProduct
}

/**
 * 
 * @param {*} p 
 * @param {*} l 
 * @param {*} callback 
 * @param {*} response 
 */
function getProductTypes(p,l,order,callback, response) {
    let productAgg = [
        {
            $lookup: { from : "unite", localField: "uniteId", foreignField: "_id", as: "unite"}
        }, { $unwind : "$unite" },{
            $match : {
                "state" : {
                    "$nin" : ["Depurado","Inactivo"]
                }
            }
        }
    ];

    if (order){
        //console.log(order);		
        try{
            let orderObj = {};
            let params = order.split(":");
            if (params[1]=="1"){
                orderObj[params[0]] = 1;
            }else{
                orderObj[params[0]] =-1;
            }			
            productAgg.push({"$sort":orderObj});
        }catch(e){
            //console.log(e);
        }
    }

    Product.aggregatePaginate(Product.aggregate(productAgg),{page:p,limit:l}).then((data) => {
        callback(data,response);
    }).catch((error) => {
        callback({"Error":error},response);
    });
}

/**
 * 
 * @param {*} filter 
 * @param {*} p 
 * @param {*} l 
 * @param {*} callback 
 * @param {*} response 
 */
function getProductTypesFilter(filter,p,l,order,callback,response){
    let regExp = new RegExp(filter,'i');
    let productAgg = [
        {
            $lookup: { from : "unite", localField: "uniteId", foreignField: "_id", as: "unite"}
        }, { $unwind : "$unite" },{            
            $match: {
                $and : [
                    {
                        "state": {
                            $ne : "Depurado"
                        } 
                    },{
                        $or : [
                            {"name" : {"$regex" : regExp}},
                            {"code" : {"$regex" : regExp}},
                            {"clase" : {"$regex" : regExp}},
                            {"type" : {"$regex" : regExp}},
                            {"unite.name" : {"$regex" : regExp}},
                            {"description": {"$regex" : regExp}}
                        ]
                    }
                ]								   
            }			
        }
    ];

    if (order){
        //console.log(order);		
        try{
            let orderObj = {};
            let params = order.split(":");
            if (params[1]=="1"){
                orderObj[params[0]] = 1;
            }else{
                orderObj[params[0]] =-1;
            }			
            productAgg.push({"$sort":orderObj});
        }catch(e){
            //console.log(e);
        }
    }

    Product.aggregatePaginate(Product.aggregate(productAgg),{page:p,limit:l}).then((data) => {
        callback(data,response);
    }).catch((error) => {
        callback({"Error":error},response);
    });
}

/**
 * 
 * @param {*} callback 
 * @param {*} response 
 */
function getProductsRaw(callback,response){
    Product.aggregate([
        {
            $lookup : {
                from : "unite",
                localField : "uniteId",
                foreignField : "_id",
                as : "unite"
            }
        },{ $unwind : "$unite" },{
            $match : {
                "state" : {
                    "$nin" : ["Depurado","Inactivo"]
                }
            }
        }
    ],(error,data)=>{
        if (error) {
            callback({ "Error": error }, response);
        } else {
            callback(data, response);
        }
    });
}

/**
 * 
 * @param {*} p 
 * @param {*} l 
 * @param {*} callback 
 * @param {*} response 
 */
function getProductTypesPaginated(p,l,callback,response){
    let prodAggregation = Product.aggregate([
        {
            $match: {
                "state": {
                    $ne : "Depurado"
                }
            }
        },
        {
            $lookup:
            {
                from: "unite", localField: "uniteId", foreignField: "_id", as: "unite"
            }
        }, { $unwind: "$unite" }
    ]);
    Product.aggregatePaginate(prodAggregation, { page: p, limit: l }).then((data) => {
        callback(data,response);
    }).catch((error) => {
        callback({"Error":error},response);
    });
}

/**
 * 
 * @param {*} product 
 * @param {*} callback 
 * @param {*} response 
 */
function addProduct(product, callback, response) {
    let prodName = strTool.camelCaseSpaced(product.name);
    Product.find({ "name": prodName }, function (error, data) {
        //console.log("Adding user: "+data.length);
        if (error) {
            callback({ "Error": error }, response);
        } else {
            if (data.length > 0) {
                //console.log("User email is in use and must be unique " + data);
                callback({ "Error": "Existe un producto con el nombre : " + prodName }, response);
            } else {
                product.name = prodName;
                let code = product.code.replace(/ /g,"");
                product.code = product.code ? (code.toUpperCase()) : "";
                product.clase = strTool.camelCaseSpaced(product.clase);
                product.type = strTool.camelCaseSpaced(product.type);
                Product.create(product, function (error, data) {
                    if (error) {
                        //console.log("Error Adding User: " + error);
                        callback({ "Error": error }, response);
                        //return callback("Error Adding User: " + error);
                    } else {
                        //console.log("Data persisted succesfully...");
                        callback(data, response);
                    }
                });
            }
        }
    });
}

/**
 * 
 * @param {*} id 
 * @param {*} prodJson 
 * @param {*} callback 
 * @param {*} response 
 */
function updateProduct(id, prodJson, callback, response) {
    let product =  prodJson["data"];
    product.code = product.code ? product.code.toUpperCase() : "";
    product.clase = strTool.camelCaseSpaced(product.clase);
    product.type = strTool.camelCaseSpaced(product.type);
    Product.updateOne({ "_id": id }, product, function (error, data) {
        if (error) {
            console.log("Error updating: " + error);
            callback({ "Error": error }, response);
        } else {
            //console.log("Success: "+JSON.stringify(data));
            callback(product, response);
        }
    });
}

/**
 * 
 * @param {*} id 
 * @param {*} callback 
 * @param {*} response 
 */
function getProductById(id, callback, response) {
    //console.log("Searching for product Id: "+id);
    Product.find({ "_id": id }, function (error, data) {
        if (error) {
            callback({ "Error": error }, response);
        } else {
            //console.log("Products found: "+data);
            callback(data, response);
        }
    });
}

function depureProduct(id, callback, response){
    Supply.find({"productId" : new mongoose.Types.ObjectId(id)},(err,data)=>{
        if (err){
            callback({"Error":err},response); 
        }else{
            if (data.length<=0){
                Product.updateOne({"_id":new mongoose.Types.ObjectId(id)},{"state":"Depurado"},(err,data)=>{
                    if (err){
                        callback({"Error":err},response);
                    }else{
                        callback({"Success":"El producto ha sido depurado"},response);
                    }
                });
            }else{
                callback({"Error":"El producto está en uso"},response);
            }
        }
    });
}