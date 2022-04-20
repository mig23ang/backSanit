let Supply = require('../models/supply');
var mongoose = require('mongoose');
let suid = require('short-uuid');

module.exports = {
    getRemisionSupplies,
    getAllSupply,
    getSupplyById,
    getSupplyPaginated,
    getSupplyPaginatedFiltered,
    getSuppliesFiltered,
    addSupply,
    updateSupply,
    deleteSupply,
    deleteSupplyByRem
}

/**
 * Function to collect supplies registered in a specified remision
 * @param {*} p : the actual page to search
 * @param {*} l : the lines per page to limit the search
 * @param {*} idRem : id of remision object in mongo db
 * @param {*} callback : a function that be executed when asynchronous process ends
 * @param {*} response : a response reference to return the answer
 */
function getRemisionSupplies(p, l, idRem, callback, response) {
    //console.log("Getting supplies of : " + idRem);
    let supplyAggregation = Supply.aggregate([
        {
            $lookup: { 
                from: "product", 
                let: {"productId": "$productId"}, 
                pipeline : [
                    {
                        $match: {
                            "$expr": {
                                "$eq": ["$_id", "$$productId"]
                            }
                        }
                    },{
                        $lookup : {
                            from : "unite",
                            localField : "uniteId",
                            foreignField : "_id",
                            as: "unite" 
                        }
                    },{
                        $unwind : "$unite"
                    }
                ],
                as: "product"
            }
        }, { $unwind : "$product"},        
        {
            $match: {
                $and: [
                    { "remisionId": { $eq: new mongoose.Types.ObjectId(idRem) } }
                ]
            }
        }
    ]);
    Supply.aggregatePaginate(supplyAggregation, { page: p, limit: l }).then((data) => {
        callback(data, response);
    }, (err) => {
        callback({ "Error": err }, response);
    });
}

function getAllSupply(callback, response) {
    Supply.aggregate([
        {
            $lookup: {
                from: "product", localField: "productId", foreignField: "_id", as: "product"
            }
        }, { $unwind: "$product" },
        {
            $lookup: {
                from: "place", localField: "placeId", foreignField: "_id", as: "place"
            }
        }, { $unwind: "$place" },
        {
            $lookup: {
                from: "remision", localField: "remisionId", foreignField: "_id", as: "remision"
            }
        }, { $unwind: "$remision" }
    ], function (err, data) {
        if (err) {
            callback({ "Error": err }, response);
        } else {
            callback(data, response);
        }
    });
}

/**
 * Get all Supply without pagination and a filter predefined
 * @param {any} filter
 * @param {any} callback
 * @param {any} response
 */
function getSuppliesFiltered(filter, callback, response) {
    //console.log(JSON.stringify(filter));
    try {
        Supply.aggregate(filter, function (err, data) {
            if (err) {                
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (err) {
        callback({ "Error": err }, response);
    }
    
}

/**
 * 
 * @param {any} p
 * @param {any} l
 * @param {any} response
 */
function getSupplyPaginated(p, l, callback, response) {
    let supplyAggregation = Supply.aggregate([
        {
            $lookup: {
                from: "product", localField: "productId", foreignField: "_id", as: "product"
            }
        }, { $unwind: "$product" },
        {
            $lookup: {
                from: "place", localField: "placeId", foreignField: "_id", as: "place"
            }
        }, { $unwind: "$place" },
        {
            $lookup: {
                from: "remision", localField: "remisionId", foreignField: "_id", as: "remision"
            }
        }, { $unwind: "$remision" }
    ]);

    Supply.aggregatePaginate(supplyAggregation, { page: p, limit: l }).then((data) => {
        callback(data, response);
    }).catch((error) => {
        callback({ "Error": error }, response);
    });
}

/**
 * 
 * @param {any} idSupply
 * @param {any} callback
 * @param {any} response
 */
function getSupplyPaginatedFiltered(p, l, filter, callback, response) {
    let supplyAggregation = Supply.aggregate(filter);
    Supply.aggregatePaginate(supplyAggregation, { page: p, limit: l }).then((data) => {
        if (data.length > 0) {
            callback({"Error":"No supplies registers was found!"},response);
        } else {
            callback(data,response);
        }
    }, (err) => {
            callback({ "Error": err }, response);
    });
}

function getSupplyById(idSupply, callback, response) {
    Supply.findById(idSupply, function (err, data) {
        if (err) {
            //console.log(err);
            callback({ "Error": err }, response);
        } else {
            callback(data, response);
        }
    });
}

/**
 * 
 * @param {any} data
 * @param {any} response
 */
function addSupply(data, callback, response) { 
    //generate and a code to supply
    data["code"] = suid.generate();
    //console.log(data);
    try {
        Supply.create(data, function (err, data) {
            if (err) {
                //resolve the callback with the response object
                callback({ "Error": err }, response);
            } else {
                //resolve the callback with the response object
                callback(data, response);
            }
        });
    } catch (e) {
        //resolve the callback with the response object
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {any} idRemision
 * @param {any} data
 * @param {any} response
 */
function updateSupply(idSupply, data, callback, response) {
    //console.log("updating supply: " + JSON.stringify(data));
    Supply.updateOne({ "_id": idSupply }, data["data"], function (err, data) {
        
        if (err) {
            //resolve the callback with the response object
            callback({ "Error": err }, response);
        } else {
            //resolve the callback with the response object
            callback(data, response);
        }
    });
}

/**
 * depure supply passing the id
 * @param {any} idSupply : id of supply object in mongo db
 * @param {callback} callback : function to execute when mongoose .deleteOne ends 
 * @param {any} response : reference to resolve request
 */
function deleteSupply(idSupply, callback, response) {
    Supply.deleteOne({ "_id": idSupply }, function (err, data) {
        if (err) {
            //resolve the callback with the response object
            callback({ "Error": err }, response);
        } else {
            //resolve the callback with the response object
            callback(data, response);
        }
    });
}


function deleteSupplyByRem(idRemision, callback, response){
    try{
        Supply.remove({"remisionId": new mongoose.Types.ObjectId(idRemision)},(err,data)=>{
            if (err){
                callback({ "Error": {"message" : "No se pudieron eliminar los productos registrados, por favor informar a soporte: " + idRemision} }, response); 
            }else{
                callback({ "Success": "Remisión y productos eliminados satisfactoriamente" }, response);
            }
        });
    }catch(e){
        callback({ "Error": e }, response);
    }
}