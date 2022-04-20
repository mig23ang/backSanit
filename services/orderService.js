let Order = require('../models/order');
let MixXorder = require('../models/productXorder');
const counterService = require('./counterService');
const mongoose = require('mongoose');

module.exports = {
    getOrder,
    orderList,
    orderListRaw,
    orderListFilter,
    addOrder,
    updateOrder,
    addProductToOrder,
    getOrderProducts,
    deleteProductFromOrder,
    updateOrderPhoto
}

/**
 * 
 * @param {*} data 
 * @param {*} callback 
 * @param {*} response 
 */
function addOrder(data, callback, response) {
    try {
        counterService.getDocNum("order", (err, docNum) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                data["code"] = docNum;
                Order.create(data, (err, ans) => {
                    if (err) {
                        callback({ "Error": err }, response);
                    } else {
                        callback(ans, response);
                    }
                });
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} orderId 
 * @param {*} data 
 * @param {*} callback 
 * @param {*} response 
 */
function updateOrder(orderId, data, callback, response) {
    try {
        Order.updateOne({ "_id": orderId }, data, (err, ans) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} orderId 
 * @param {*} callback 
 * @param {*} response 
 */
function getOrder(orderId, callback, response) {
    try {
        let agg = [
            {
                $match: {
                    "_id": new mongoose.Types.ObjectId(orderId)
                }
            }
        ];
        Order.aggregate(agg, (err, data) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} p 
 * @param {*} l 
 * @param {*} s 
 * @param {*} callback 
 * @param {*} response 
 */
function orderList(p, l, s, callback, response) {
    try {
        let agg = [
            {
                $match: {
                    "state": { "$ne": "Eliminado" }
                }
            }, {
                $lookup: {
                    from: "user",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "creator"
                }
            }, {
                $unwind: {
                    path: "$creator", preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "user",
                    localField: "modifiedBy",
                    foreignField: "_id",
                    as: "modificator"
                }
            }, {
                $unwind: {
                    path: "$modificator", preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "entite",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            }, {
                $unwind: {
                    path: "$customer", preserveNullAndEmptyArrays: true
                }
            }
        ];

        Order.aggregatePaginate(Order.aggregate(agg), { "page": p, "limit": l }).then((data) => {
            callback(data, response);
        }, (err) => {
            callback({ "Error": err }, response);
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}
function updateOrderPhoto(idOrder, urlPhoto, callback, response) {
    User.updateOne({ "_id": idOrder }, { "urlPhoto": urlPhoto }, function (error, data) {
        if (error) {
            //console.log("Error updating: "+error);
            callback({ "Error": error }, response);
        } else {
            //console.log("Success: " + JSON.stringify(data));
            callback({ "urlPhoto": urlPhoto }, response);
        }
    })
}

function orderListFilter(p, l, f, s, callback, response) {
    let regExp = new RegExp(f, 'i');
    try {
        let agg = [
            {
                $lookup: {
                    from: "user",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "creator"
                }
            }, {
                $unwind: {
                    path: "$creator", preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "user",
                    localField: "modifiedBy",
                    foreignField: "_id",
                    as: "modificator"
                }
            }, {
                $unwind: {
                    path: "$modificator", preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "entite",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            }, {
                $unwind: {
                    path: "$customer", preserveNullAndEmptyArrays: true
                }
            }, {
                $match: {
                    "$and": [
                        { "state": { "$ne": "Eliminado" } },
                        {
                            "$or": [
                                { "code": { "$regex": regExp } },
                                { "orderDate": { "$regex": regExp } },
                                { "customer.names": { "$regex": regExp } },
                                { "customer.lastNames": { "$regex": regExp } },
                            ]
                        }
                    ]

                }
            }
        ];

        Order.aggregatePaginate(Order.aggregate(agg), { "page": p, "limit": l }).then((data) => {
            callback(data, response);
        }, (err) => {
            callback({ "Error": err }, response);
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

function orderListRaw() {
    try {
        let agg = [
            {
                $match: {
                    "state": { "$ne": "Eliminado" }
                }
            }
        ];

        Order.aggregate(agg).then((data) => {
            callback(data, response);
        }, (err) => {
            callback({ "Error": err }, response);
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} callback 
 * @param {*} response 
 */
function addProductToOrder(data, callback, response) {
    try {
        // console.log(data);
        MixXorder.create(data, (err, data) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

function getOrderProducts(idOrder, callback, response) {
    try {
        let agg = [
            {
                $lookup: {
                    from: "refine",
                    let: { "refId": "$refId" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": {
                                    "$eq": ["$_id", "$$refId"]
                                }
                            }
                        }, {
                            $lookup: {
                                from: "unite",
                                localField: "uniteId",
                                foreignField: "_id",
                                as: "unite"
                            }
                        }, {
                            $unwind: { path: "$unite", preserveNullAndEmptyArrays: true }
                        }
                    ],
                    as: "product"
                }
            }, {
                $unwind: { path: '$product', preserveNullAndEmptyArrays: true }
            }, {
                $match: {
                    "orderId": new mongoose.Types.ObjectId(idOrder)
                }
            }
        ];
        MixXorder.aggregate(agg, (err, data) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} idRel 
 * @param {*} callback 
 * @param {*} response 
 */
function deleteProductFromOrder(idRel, callback, response) {
    try {
        MixXorder.deleteOne({ "_id": new mongoose.Types.ObjectId(idRel) }, (err, data) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}
