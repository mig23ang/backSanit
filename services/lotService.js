let Lot = require('../models/lot');
let Supplyxlot = require('../models/supplyxlot');
let Unite = require('../models/unite');
const counterService = require('./counterService');
var mongoose = require('mongoose');
const { response } = require('express');

module.exports = {
    getLotsFiltered,
    getAvailableSupplies,
    getAllLots,
    getLotPaginated,
    getLotPaginatedFiltered,
    getLotListFilter,
    getLotById,
    addLot,
    updateLot,
    addSupplyXlot,
    updateSupplyXlot,
    getSupplyByLot,
    removeSupplyFromLot,
    getUnites,
    getUnitesFiltered
}

/**
 * Get all lots brinding mondogb aggregation filter
 * @param {Array} filter: Filter mongodb format 
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getLotsFiltered(filter, callback) {
    try {
        Lot.aggregate(filter, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    } catch (e) {
        callback(e, null);
    }
}

/**
 * Get all lots without filter
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getAllLots(callback) {

    Lot.aggregate([
        {
            $lookup: {
                from: "unite", localField: "uniteId", foreignField: "_id", as: "unite"
            }
        }, {
            $unwind: "$unite"
        }
    ], (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}

/**
 * get list of lots with page limit a order
 * @param {Number} p : page of the list
 * @param {Number} l : lines per page of list
 * @param {String} order : field:(1 for Asc, -1 for DSC)
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getLotPaginated(p, l, order, callback) {
    //console.log("Getting all lots");
    let lotAggregation = [
        {
            $lookup: {
                from: "unite", localField: "uniteId", foreignField: "_id", as: "unite"
            }
        }, {
            $unwind: "$unite"
        }, {
            $lookup: {
                from: "user", localField: "createdBy", foreignField: "_id", as: "creator"
            }
        }, {
            $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
        }, {
            $lookup: {
                from: "user", localField: "modifiedBy", foreignField: "_id", as: "modifier"
            }
        }, {
            $unwind: { path: "$modifier", preserveNullAndEmptyArrays: true }
        }, {
            $lookup: {
                from: "lotxmix",
                localField: "_id",
                foreignField: "lotId",
                as: "control"
            }
        }, {
            $unwind: { path: "$control", preserveNullAndEmptyArrays: true }
        }, {
            $group: {
                "descripcion": { "$first": "$descripcion" },
                "_id": "$_id",
                "lotCode": { "$first": "$lotCode" },
                "initialW": { "$first": "$initialW" },
                "actualW": { "$first": "$actualW" },
                "finalW": { "$first": "$finalW" },
                "consumed": { "$sum": "$control.factor" },
                "creator": { "$first": "$creator" },
                "state": { "$first": "$state" },
                "unite": { "$first": "$unite" },
                "modifier": { "$first": "$modifier" },
                "createdAt": { "$first": "$createdAt" }
            }
        }
    ];

    if (order) {
        //console.log(order);		
        try {
            let orderObj = {};
            let params = order.split(":");
            if (params[1] == "1") {
                orderObj[params[0]] = 1;
            } else {
                orderObj[params[0]] = -1;
            }
            lotAggregation.push({ "$sort": orderObj });
        } catch (e) {
            //console.log(e);
        }
    }

    Lot.aggregatePaginate(Lot.aggregate(lotAggregation), { page: p, limit: l }).then((data) => {
        callback(null, data);
    }).catch((err) => {
        //console.log(error);
        callback(err, null);
    });
}

/**
 * Get lot list with filter
 * @param {Number} p : page of list
 * @param {Number} l : lines ´per page
 * @param {String} param : expression that will be converted into regular expression
 * @param {String} order : field:(1 ASC, -1 DSC)
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getLotListFilter(p, l, param, order, callback) {
    let regExp = new RegExp(param, 'i');
    let lotAggregation = [
        {
            $lookup: {
                from: "unite", localField: "uniteId", foreignField: "_id", as: "unite"
            }
        }, {
            $unwind: "$unite"
        }, {
            $lookup: {
                from: "user", localField: "createdBy", foreignField: "_id", as: "creator"
            }
        }, {
            $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
        }, {
            $lookup: {
                from: "user", localField: "modifiedBy", foreignField: "_id", as: "modifier"
            }
        }, {
            $unwind: { path: "$modifier", preserveNullAndEmptyArrays: true }
        }, {
            $lookup: {
                from: "lotxmix",
                localField: "_id",
                foreignField: "lotId",
                as: "control"
            }
        }, {
            $unwind: { path: "$control", preserveNullAndEmptyArrays: true }
        }, {
            $match: {
                $and: [
                    {
                        "state": {
                            $ne: "Depurado"
                        }
                    }, {
                        $or: [
                            { "descripcion": { "$first": "$descripcion" }},
                            { "lotCode": { "$regex": regExp } },
                            { "state": { "$regex": regExp } },
                            { "creator.names": { "$regex": regExp } },
                            { "creator.lastNames": { "$regex": regExp } }
                        ]
                    }
                ]

            }
        }, {
            $group: {
                "descripcion": { "$first": "$descripcion" },
                "_id": "$_id",
                "lotCode": { "$first": "$lotCode" },                
                "initialW": { "$first": "$initialW" },
                "actualW": { "$first": "$actualW" },
                "finalW": { "$first": "$finalW" },
                "consumed": { "$sum": "$control.factor" },
                "creator": { "$first": "$creator" },
                "modifier": { "$first": "$modifier" },
                "unite": { "$first": "$unite" },
                "state": { "$first": "$state" },
                "createdAt": { "$first": "$createdAt" }
            }
        }
    ];

    if (order) {
        //console.log(order);		
        try {
            let orderObj = {};
            let params = order.split(":");
            if (params[1] == "1") {
                orderObj[params[0]] = 1;
            } else {
                orderObj[params[0]] = -1;
            }
            lotAggregation.push({ "$sort": orderObj });
        } catch (e) {
            //console.log(e);
        }
    }

    Lot.aggregatePaginate(Lot.aggregate(lotAggregation), { page: p, limit: l }).then((data) => {
        callback(null, data);
    }).catch((error) => {
        //console.log(error);
        callback(error, null);
    });
}

/**
 * Get lot list with filter aggregation object
 * @param {Number} p : page of list
 * @param {Number} l : lines ´per page
 * @param {String} filter : aggregation filter object
 * @param {String} order : field:(1 ASC, -1 DSC)
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getLotPaginatedFiltered(p, l, filter, callback) {
    let lotAggregation = Lot.aggregate(filter);
    Lot.aggregatePaginate(lotAggregation, { page: p, limit: l }).then((data) => {
        if (data.length < 0) {
            callback({ "message": "No lot registers was found!" }, null);
        } else {
            callback(null, data);
        }
    }, (err) => {
        callback(err, null);
    });
}

/**
 * Get lott brinding the id of lot mongodb object
 * @param {String} idLot 
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getLotById(idLot, callback) {
    Lot.aggregate([
        {
            $lookup: {
                from: "unite",
                localField: "uniteId",
                foreignField: "_id",
                as: "unite"
            }
        }, {
            "$unwind": "$unite"
        }, {
            $lookup: {
                from: "user",
                localField: "createdBy",
                foreignField: "_id",
                as: "user"
            }
        }, {
            "$unwind": { path: "$user", preserveNullAndEmptyArrays: true }
        }, {
            "$match": {
                "_id": new mongoose.Types.ObjectId(idLot)
            }
        }
    ], function (err, data) {
        if (err) {
            //console.log(err);
            callback(err, null);
        } else {
            callback(err, data[0]);
        }
    });
}

/**
 * Add lot
 * @param {Lot} lotObj : lot.js model
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function addLot(lotObj, callback) {
    //console.log(data);
    try {
        counterService.getDocNum("lot", (err, data) => {
            if (err) {
                //console.log(err);
                callback(err, null);
            } else {
                //console.log(data);
                lotObj["lotCode"] = data;
                //console.log(lotObj);
                Lot.create(lotObj, (err, data) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, data);
                    }
                });
            }
        });

    } catch (e) {
        //console.log(e); 
        callback(e, null);
    }
}


function updateLot(idLot, lotObj, callback, response) {
    Lot.updateOne({ "_id": idLot }, lotObj, function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, lotObj);
        }
    });
}

//suppliesxlots ------------------------------------------------------------------------------------------------------------------------------
function addSupplyXlot(data, callback) {
    try {
        Supplyxlot.create(data, function (err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    } catch (e) {
        callback(e, null);
    }

}

function updateSupplyXlot(data, idsXl, callback) {
    try {
        Supplyxlot.updateOne({ "_id": idsXl }, data["data"], function (err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        })
    } catch (e) {
        callback(e, null);
    }
}

/**
 * Get supplies that was not 
 */
function getAvailableSupplies(noIncludeArray, callback, response) {

}

function getSupplyByLot(idLot, pagObj, callback) {
    //console.log(idLot);
    let agg = [
        {
            $match: {
                "lotId": {
                    $eq: new mongoose.Types.ObjectId(idLot)
                }
            }
        },
        {
            $lookup: {
                from: "supply",
                let: { "supplyRel": "$supplyId" },
                pipeline: [
                    {
                        $match: {
                            "$expr": {
                                "$eq": ["$_id", "$$supplyRel"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "supplyxlot",
                            let: { "supplyXrel": "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        "$expr": {
                                            "$eq": ["$supplyId", "$$supplyXrel"]
                                        }
                                    }
                                }, {
                                    $group: {
                                        "_id": "$$supplyXrel",
                                        "consumed": { "$sum": "$factor" }
                                    }
                                }
                            ],
                            as: "consumed"
                        }
                    }, {
                        $unwind: "$consumed"
                    }, {
                        $lookup: {
                            from: "remision",
                            let: { "remId": "$remisionId" },
                            pipeline: [
                                {
                                    $match: {
                                        "$expr": {
                                            "$eq": ["$_id", "$$remId"]
                                        }
                                    }
                                }
                            ],
                            as: "remision"
                        }
                    }, {
                        $unwind: {
                            path: "$remision",
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $lookup: {
                            from: "product",
                            let: { "productId": "$productId" },
                            pipeline: [
                                {
                                    $match: {
                                        "$expr": {
                                            "$eq": ["$_id", "$$productId"]
                                        }
                                    }
                                }, {
                                    $lookup: {
                                        from: "unite",
                                        let: { "uniteId": "$uniteId" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$uniteId"]
                                                    }
                                                }
                                            }
                                        ],
                                        as: "unite"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$unite",
                                        preserveNullAndEmptyArrays: true
                                    }
                                }
                            ],
                            as: "product"
                        }
                    }, {
                        $unwind: {
                            path: "$product",
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $lookup: {
                            from: "place",
                            let: { "placeId": "$placeId" },
                            pipeline: [
                                {
                                    $match: {
                                        "$expr": {
                                            "$eq": ["$_id", "$$placeId"]
                                        }
                                    }
                                }
                            ],
                            as: "place"
                        }
                    }, {
                        $unwind: {
                            path: "$place",
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ],
                as: "supply"
            }
        }, {
            $unwind: {
                path: "$supply",
                preserveNullAndEmptyArrays: true
            }
        }
    ];
    //console.log(agg[0]["$match"]);
    try {
        if (pagObj) {
            //console.log("With pagObj search");
            let sxlAggregation = Supplyxlot.aggregate(agg);
            Supplyxlot.aggregatePaginate(sxlAggregation, pagObj).then((data) => {
                if (data.length < 0) {
                    callback({ "message": "No lot registers was found!" }, null);
                } else {
                    callback(null, data);
                }
            }, (err) => {
                //console.log(err);
                callback(err, null);
            });
        } else {
            //console.log("Without pagObj search");
            Supplyxlot.aggregate(agg, (err, data) => {
                if (err) {
                    //console.log("Error getting the supplies");
                    callback(err, null);
                } else if (data.length < 0) {
                    //console.log("no supplies found");
                    callback({ "message": "No lot registers was found!" }, null);
                } else {
                    //console.log("Success recolecting supplies");
                    callback(null, data);
                }
            })
        }

    } catch (e) {
        //console.log(e);
        callback(e, null);
    }
}

function removeSupplyFromLot(idSupplyXlot, callback) {
    try {
        Supplyxlot.findByIdAndRemove({ "_id": idSupplyXlot }, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    } catch (e) {
        callback(e, null);
    }

}

// Unites ================================================================================================
function getUnites(callback) {
    Unite.find({}, function (error, data) {
        if (error) {
            //console.log(error);
            callback({ "Error": error }, null);
        } else {
            callback(null, data);
        }
    });
}

function getUnitesFiltered(filter, callback) {
    try {
        Unite.aggregate(filter, function (error, data) {
            if (error) {
                callback({ "Error": error }, response);
            } else {
                callback(null, data);
            }
        });
    } catch (e) {
        callback({ "Error": e }, null);
    }
}