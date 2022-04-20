var mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
let suid = require('short-uuid');
let Transaction = require('../models/transaction');
let sysMod = require('../models/sysModule');
let Trigger = require('../models/transactionTrigger');
let fieldxtransaction = require('../models/fieldXtransaction');
let Menu = require('../models/menu');
let fieldServ = require('./fieldService');
const filterTool = require("../tools/filterTools");
const db = require("../config/database");
const strTool = require("../tools/stringTools");
const defaultStruct = require("../config/defaultSchemasStructures");
const { response } = require('express');
const fileServ = require("./fileService");


module.exports = {
    getTransactionById,
    getTransactionList,
    getTransactionListFiltered,
    getTransactionsFiltered,
    addTransaction,
    deleteTransaction,
    getOptions,
    updateTransaction,
    addFieldToTransaction,
    deleteFieldTransaction,
    saveRegister,
    updateRegister,
    deleteRegister,
    registerList,
    registerListFilter,
    getRegisterTransaction,
    getTransactionTriggers,
    saveTrigger,
    deleteTrigger,
    executeTriggers,
    getDefinedCollections,
    findAllRegisters
};

/**
 * search and returns transaction with fields or nothing if not found
 * @param {Number} idTransaction 
 * @param {Function} callback 
 * @param {Response} response 
 */
function getTransactionById(idTransaction, callback, response) {
    let agg = [
        {
            $lookup: {
                from: "fieldxtransaction",
                let: { "transactionId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            "$expr": {
                                "$eq": ["$transactionId", "$$transactionId"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "customfield",
                            localField: "fieldId",
                            foreignField: "_id",
                            as: "field"
                        }
                    }, {
                        $unwind: "$field"
                    }
                ],
                as: "rel"
            }
        }, {
            $lookup: {
                from: "trigger",
                localField: "_id",
                foreignField: "transactionId",
                as: "triggerList"
            }
        }, {
            $match: {
                $and: [
                    { _id: { $eq: new mongoose.Types.ObjectId(idTransaction) } }
                ]
            }
        }
    ];
    ////console.log(agg);
    try {
        Transaction.aggregate(agg, (err, data) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                if (data.length > 0) {
                    let transactionData = data[0];
                    isTransactionConsumed(transactionData["name"], (err, consumed) => {
                        if (err) {
                            callback({ "Error": err }, response);
                        } else {
                            callback({ "data": transactionData, "consumed": consumed }, response);
                        }
                    });
                } else {
                    callback({ "Error": { "message": "No se econtraron registros" } }, response);
                }

            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * get the transaction consumed and his strcuture
 * @param {String} idRegister: Id of mongoDB object
 * @param {String} collectionTarget: String with  
 * @param {Function} callback: Function to resolver asynchronous
 * @param {Response} response: Response object 
 */
function getRegisterTransaction(idRegister, collectionTarget, callback, response) {
    ////console.log(collectionTarget);
    try {
        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            db.collection(collectionTarget).findOne({ "_id": new mongoose.Types.ObjectId(idRegister) }, (err, data) => {
                if (err) {
                    ////console.log(err);
                    callback({ "Error": err }, response);
                } else {
                    ////console.log(data);
                    callback(data, response);
                }
            });
        });
    } catch (e) {

    }
}

/**
 * 
 * @param {*} from 
 * @param {*} filter 
 * @param {*} callback 
 * @param {*} response 
 */
function getOptions(from, conditions, callback, response) {
    let filter = filterTool.getFilter(conditions["operator"], conditions["property"], conditions["condition"]);
    ////console.log(JSON.stringify(filter));
    ////console.log("Calling options process -----------------------------------");
    ////console.log(JSON.stringify(conditions));
    try {
        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            db.collection(from).aggregate(filter, (err, data) => {
                if (err) {
                    ////console.log(err);
                    callback({ "Error": err }, response);
                } else {
                    ////console.log(data);
                    callback(data, response);
                }
            });
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * Returns transactions paginated
 * @param {*} p page
 * @param {*} l lines per page
 * @param {*} callback 
 * @param {*} response 
 */
function getTransactionList(p, l, callback, response) {
    try {
        //let agg = Transaction.aggregate(filter);
        Transaction.aggregatePaginate([], { page: p, limit: l }).then((data) => {
            callback(data, response);
        }).catch((err) => {
            callback({ "Error": err }, response);
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} filter 
 * @param {*} p 
 * @param {*} l 
 * @param {*} callback 
 * @param {*} response 
 */
function getTransactionListFiltered(filter, p, l, callback, response) {
    try {
        let agg = Transaction.aggregate(filter);
        Transaction.aggregatePaginate(agg, { page: p, limit: l }).then((data) => {
            callback(data, response);
        }).catch((err) => {
            callback({ "Error": err }, response);
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * Get transactions by filter
 * @param {*} filter 
 * @param {*} callback 
 * @param {*} response 
 */
function getTransactionsFiltered(filter, callback, response) {
    try {
        Transaction.aggregate(filter, (err, data) => {
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

function addMenuTransaction(trId, label, url, callback) {
    let defaultTarget = "Actividades registradas";
    let obj = {};

    Menu.find({ "label": defaultTarget }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            if (data.length > 0) {
                let parent = data[0];
                ////console.log(parent);
                obj["idparent"] = parent["_id"];
                obj["linkTo"] = url;
                obj["level"] = 2;
                obj["label"] = label;
                obj["reference"] = trId;
                Menu.create(obj, (err, data) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, data);
                    }
                });
            } else {
                callback("No se encontró el menú raíz", null);
            }
        }
    });
}

function deleteMenuTransaction(ref, callback) {
    Menu.deleteOne({ "reference": ref }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, true);
        }
    });
}

/**
 * 
 * @param {*} data 
 * @param {*} callback 
 * @param {*} response 
 */
function addTransaction(data, callback, response) {
    let name = strTool.camelCase(data["label"]);
    data["label"] = strTool.camelCaseSpaced(data["label"]);
    data["name"] = "DEF" + name;
    try {
        Transaction.create(data, function (err, data) {
            if (err) {
                //resolve the callback with the response object
                callback({ "Error": err }, response);
            } else {
                //resolve the callback with the response object
                sysMod.create({
                    'tittle': data["label"],
                    'code': data["name"],
                    'createdBy': data["createdBy"]
                }, (err, ans) => {
                    if (err) {
                        //resolve the callback with the response object
                        callback({ "Error": { "message": "Transacción creada, sin embargo se puede producir errores al asignar privilegios, comunique a soporte" } }, response);
                    } else {
                        addMenuTransaction(data["_id"], data["label"], "/registerList/" + data["_id"], (err, ans) => {
                            if (err) {
                                callback({ "402": "Ocurrió un error al guardar el menú" }, response);
                            } else {
                                callback(data, response);
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * delete transaction checking if it was consumed
 * @param {String} idTr : id of transaction 
 * @param {String} target : name of collection
 * @param {Function} callback : a function to resolve request
 * @param {Response} response : a response object to reference subscriber request
 */
function deleteTransaction(idTr, target, callback, response) {
    isTransactionConsumed(target, (err, isConsumed) => {
        if (err || isConsumed) {
            callback({ "Error": { "message": "Existen registros de la transacción" } }, response);
        } else {
            //resolve the callback with the response object
            deleteTriggerByTransaction(idTr, (err, data) => {
                if (err) {
                    callback({ "Error": "Las acciones de la transacción no se pudieron eliminar" }, response);
                }
                deleteFieldsXtransaction(idTr, (err, data) => {
                    if (err) {
                        callback({ "Error": "Los campos de la transacción no se pudieron eliminar" }, response);
                    } else {
                        Transaction.deleteOne({ "_id": idTr }, function (err, data) {
                            if (err) {
                                //resolve the callback with the response object
                                callback({ "Error": err }, response);
                            } else {
                                sysMod.deleteOne({ "code": target }, (err, data) => {
                                    if (err) {
                                        callback({ "Error": err }, response);
                                    } else {
                                        deleteMenuTransaction(idTr, (err, data) => {
                                            if (err) {
                                                callback({ "Error": err }, response);
                                            } else {
                                                callback({ "Succes": "Transacción eliminada" }, response);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
}

/**
 * Checks if a transaction is consumed by some register
 * @param {String} target name of the collection that stores the information
 * @param {Function} callback a function to resolve request
 */
function isTransactionConsumed(target, callback) {
    let client = new MongoClient(db.strCon);
    /**client.connect(db.strCon).then((db)=>{
        db.collection(target).find({}).limit(1).toArray((err,data)=>{
            if (err){
                callback(err,null);
            }else{
                if (data.length>0){
                    callback(null,true);
                }else{
                    callback(null,false);
                }
            }
        });
    }).catch((err)=>{
        callback(err,null);
    });
    **/
    client.connect(db.strCon, (err, db) => {
        if (err) {
            callback(err, null);
        } else {
            db.collection(target).find({}).limit(1).toArray((err, data) => {
                if (err) {
                    callback(err, null);
                } else {
                    if (data.length > 0) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                }
            });
        }
    });
}

/**
 * updates transaction information if it wasn't consumed by any register
 * @param {Object} data object json transaction information
 * @param {Function} callback function callback to resolve asynchronous request
 * @param {Response} response Response object to resolve reference request
 */
function updateTransaction(idTransaction, target, data, callback, response) {
    try {
        isTransactionConsumed(target, (err, ans) => {
            if (err) {
                callback({ "Error": { "message": "Existen registros de la transacción" } }, response);
            } else {
                Transaction.updateOne(data, { "_id": idTransaction }, function (err, ans) {
                    if (err) {
                        //resolve the callback with the response object
                        callback({ "Error": err }, response);
                    } else {
                        //resolve the callback with the response object
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
 * @param {String} target 
 * @param {Object} data 
 * @param {Function} callback 
 * @param {Response} response 
 */
function addFieldToTransaction(target, data, callback, response) {
    //////console.log(target);
    try {
        isTransactionConsumed(target, (err, ans) => {
            //////console.log(err);
            if (err) {
                callback({ "Error": { "message": "Existen registros de la transacción" } }, response);
            } else {
                fieldxtransaction.create(data, (err, data) => {
                    if (err) {
                        //resolve the callback with the response object
                        callback({ "Error": err }, response);
                    } else {
                        //resolve the callback with the response object
                        callback(data, response);
                    }
                });
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * function to delete field from transaction
 * @param {String} idFieldXtr if of field in mongodb object register
 * @param {String} target the collection target that consumes the activity
 * @param {Function} callback function to resolve the request
 * @param {Response} response a Response object to resolve the request
 */
function deleteFieldTransaction(idFieldXtr, target, callback, response) {
    isTransactionConsumed(target, (err, ans) => {
        if (err) {
            callback({ "Error": { "message": "Existen registros de la transacción" } }, response);
        } else {
            fieldxtransaction.deleteOne({ "_id": idFieldXtr }, (err, data) => {
                if (err) {
                    callback({ "Error": err }, response);
                } else {
                    callback({ "Succes": data }, response);
                }
            });
        }
    });
}

/**
 * GEt all registers, with or without filter, sort or some condition with follow parameters
 * @param {String} target : name of collection where are allocated the information of activities
 * @param {Array} fields : list of fields that compounds the activitie
 * @param {String} filter : value of string to compare the value on each field of activities 
 * @param {String} sort : sorting condition field:mode
 * @param {Function} callback : function to resolve asynchronous procedure
 * @param {Response} response : response object to resolve request
 */
function findAllRegisters(target, fields, filter, sort, callback, response) {
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
                $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
            }, {
                $lookup: {
                    from: "user",
                    localField: "modifiedBy",
                    foreignField: "_id",
                    as: "modificator"
                }
            }, { "$unwind": { path: "$modificator", preserveNullAndEmptyArrays: true } }
        ];


        let sorArr = [];
        let sUnwind = [];

        let headers = {};
        let projObj = {
            "_id": 0
        };

        let targField = {};

        for (i = 0; i < fields.length; i++) {
            let relField = fields[i];
            if (relField) {
                if (relField["field"]["type"] == "select" && relField["field"]["relation"] != "defined" && relField["field"]["relation"]) {
                    targField = relField["field"]["_id"] + "." + relField["field"]["property"];
                    projObj[relField["field"]["label"]] = "$" + relField["field"]["_id"] + "." + relField["field"]["property"];
                    if (relField["field"]["relation"] == "lot") {
                        projObj[relField["field"]["label"] + " Peso registro"] = "$" + relField["field"]["_id"] + ".initialW";
                        projObj[relField["field"]["label"] + " Peso Actual"] = "$" + relField["field"]["_id"] + ".actualW";
                        projObj[relField["field"]["label"] + " Peso final"] = "$" + relField["field"]["_id"] + ".finalW";
                    }
                } else {
                    targField = relField["field"]["_id"];
                    projObj[relField["field"]["label"]] = "$" + relField["field"]["_id"];
                }

                if (relField["field"]["type"] == "checkbox" || relField["field"]["type"] == "multiselect") {
                    sUnwind.push(relField["field"]["label"]);
                    //sUnwind.push({"$unwind" : {"path" : "$" + relField["field"]["label"], "preserveNullAndEmptyArrays" : true}});
                }

                if (filter != "-") {
                    let regExp = new RegExp(filter, 'i');
                    let cond = {};

                    cond[targField] = { "$regex": regExp };
                    sorArr.push(cond);
                }
            }
        }

        if (sorArr.length > 0) {
            let mtch = {
                $match: {
                    "$or": sorArr
                }
            };
            //////console.log(JSON.stringify(mtch));
            agg.push(mtch);
        }


        projObj["Registrado por"] = "$creator.names";
        projObj["Fecha Registro"] = "$createdAt";
        projObj["Modificado por"] = "$modificator.names";
        projObj["Fecha Modificado"] = "$modifiedAt";
        headers["$project"] = projObj;
        agg.push(headers);
        //agg = agg.concat(sUnwind);
        //////console.log(JSON.stringify(sorArr));


        /**
         if (filter!=""){
             let regExp = new RegExp(filter,'i');
             let sorArr = [];
             for (i=0;i<fields.length;i++){
                 let rel = fields[i];
                 let cond = {};
                 let targField = {};
                 if (rel["field"]["type"]=="select" && rel["field"]["relation"]!="defined" && rel["field"]["relation"]!=""){
                     targField = rel["field"]["_id"] + "." +rel["field"]["property"];                            
                 }else{
                     targField = rel["field"]["_id"];
                 }
                 cond[targField] = {"$regex":regExp};
                 sorArr.push(cond);
             }
             let mtch = {
                 $match : {
                     "$or" : sorArr
                 }
             };
             //////console.log(JSON.stringify(mtch));
             agg.push(mtch);
         }  
         **/

        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            db.collection(target).aggregate(agg).toArray((err, data) => {
                //////console.log(data);
                if (err) {
                    callback({ "Error": err }, response);
                } else {
                    //////console.log(JSON.stringify(agg));
                    callback({ "docs": data, "fields": sUnwind }, response);
                }
            });
        }).catch((err) => {
            callback({ "Error": err }, response);
        });
    } catch (e) {
        //console.log(e);
        callback({ "Error": e }, response);
    }
}

/**
 * Function to delete field from transaction
 * @param {String} idTr 
 * @param {Function} callback 
 */
function deleteFieldsXtransaction(idTr, callback) {
    fieldxtransaction.deleteMany({ "transactionId": new mongoose.Types.ObjectId(idTr) }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { "Succes": data });
        }
    });
}

/**
 * 
 * @param {Number} p actual page
 * @param {Number} l lines per page
 * @param {String} collTarget transaction target
 * @param {Function} callback function to resolve request
 * @param {Response} response objecto to resolve
 */
function registerList(p, l, collTarget, callback, response) {
    ////console.log("Calling get Data..." + mongoose.now());
    let start = 0;
    let end = 0;
    try {
        start = parseInt(p);
        end = parseInt(l);
    } catch (e) {

    }

    ////console.log("Register without filter Data from " + start + " to " + end);

    try {

        let agg = [
            {
                $lookup: {
                    from: 'user',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creator'
                }
            }, {
                $unwind: {
                    path: '$creator', preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'user',
                    localField: 'modifiedBy',
                    foreignField: '_id',
                    as: 'modifier'
                }
            }, {
                $unwind: {
                    path: '$modifier', preserveNullAndEmptyArrays: true
                }
            }, {
                "$skip": start
            }, {
                "$limit": end
            }
        ];
        ////console.log(JSON.stringify(agg));
        getTotalRegs(collTarget, (err, count) => {
            ////console.log("Calling connection..." + mongoose.now());
            if (err) {
            } else {
                let client = new MongoClient(db.strCon);
                ////console.log("Calling conecttion st..." + mongoose.now());
                client.connect(db.strCon).then((db) => {
                    ////console.log("Connection stablished..." + mongoose.now());
                    db.collection(collTarget).aggregate(agg).toArray((err, data) => {
                        ////console.log("Data recollected..." + mongoose.now());
                        if (err) {
                            callback({ "Error": err }, response);
                        } else {
                            callback({ "docs": data, "totalRegs": count }, response);
                        }
                    });
                }).catch((err) => {
                    callback({ "Error": err }, response);
                });
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
 * @param {*} collTarget 
 * @param {*} fields 
 * @param {*} filter 
 * @param {*} callback 
 * @param {*} response 
 */
function registerListFilter(p, l, collTarget, fields, filter, callback, response) {
    let start = 0;
    let end = 0;
    try {
        start = parseInt(p);
        end = parseInt(l);
    } catch (e) {

    }
    ////console.log(fields);
    try {

        let agg = [
            {
                $lookup: {
                    from: 'user',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creator'
                }
            }, {
                $unwind: {
                    path: '$creator', preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'user',
                    localField: 'modifiedBy',
                    foreignField: '_id',
                    as: 'modifier'
                }
            }, {
                $unwind: {
                    path: '$modifier', preserveNullAndEmptyArrays: true
                }
            }
        ];

        ////console.log(JSON.stringify(agg));
        ////console.log("Calling conecttion st..." + mongoose.now());

        ////console.log("Connection stablished..." + mongoose.now());

        if (filter != "") {
            let regExp = new RegExp(filter, 'i');
            let sorArr = [];
            for (i = 0; i < fields.length; i++) {
                let rel = fields[i];
                let cond = {};
                let targField = {};
                if (rel["field"]["type"] == "select" && rel["field"]["relation"] != "defined" && rel["field"]["relation"] != "") {
                    targField = rel["field"]["_id"] + "." + rel["field"]["property"];
                } else {
                    targField = rel["field"]["_id"];
                }
                cond[targField] = { "$regex": regExp };
                sorArr.push(cond);
            }
            let mtch = {
                $match: {
                    "$or": sorArr
                }
            };
            ////console.log(JSON.stringify(mtch));
            agg.push(mtch);
        }

        ////console.log(JSON.stringify(agg));

        getTotalRegsFiltered(collTarget, agg, (err, count) => {
            ////console.log(count);
            if (err) {
                callback({ "Error": err }, response);
            } else {
                agg.push({ "$skip": start });
                agg.push({ "$limit": end });
                let client = new MongoClient(db.strCon);
                client.connect(db.strCon).then((db) => {
                    db.collection(collTarget).aggregate(agg).toArray((err, resultSet) => {
                        ////console.log(resultSet);
                        ////console.log(count);
                        if (err) {
                            callback({ "Error": err }, response);
                        } else {
                            callback({ "docs": resultSet, "totalRegs": count["totalRegs"] }, response);
                        }
                    });
                }).catch((err) => {
                    callback({ "Error": err }, response);
                });
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * get all registers
 * @param {String} target 
 * @param {Array} filter 
 * @param {Function} callback 
 */
function getTotalRegsFiltered(target, filter, callback) {
    try {
        let newFilt = [].concat(filter);
        newFilt.push({ $group: { _id: null, totalRegs: { $sum: 1 } } });
        newFilt.push({ $project: { _id: 0 } });
        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            db.collection(target).aggregate(newFilt).toArray((err, data) => {
                ////console.log(data);
                if (err) {
                    callback(err, null);
                } else {
                    let ans = {};
                    if (data.length > 0) {
                        ans = data[0];
                    } else {
                        ans = { "totalRegs": 0 }
                    }
                    callback(null, ans);
                }
            });
        }).catch((err) => {
            callback(err, null);
        });
    } catch (e) {
        callback(err, null);
    }
}

/**
 * 
 * @param {*} target 
 * @param {*} callback 
 */
function getTotalRegs(target, callback) {
    try {
        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            db.collection(target).count({}, {}, (err, data) => {
                ////console.log(data);
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data);
                }
            });
        }).catch((err) => {
            callback(err, null);
        });
    } catch (e) {
        callback(err, null);
    }
    //callback(null,0);
}

/**
 * 
 * @param {*} data 
 * @param {*} target 
 * @param {*} mode 
 * @param {*} triggerList 
 * @param {*} callback 
 * @param {*} response 
 */
function executeTriggers(data, target, mode, triggerList, callback, response) {
    ////console.log("Executing triggers");
    try {
        let relResult = [];
        let noExecuted = 0;
        let executed = 0;
        if (triggerList.length > 0) {
            for (i = 0; i < triggerList.length; i++) {
                let obj = triggerList[i];
                let minimal = obj["action"] != "";
                minimal = minimal && obj["target"] != "" && obj["fieldTarget"] != "" && obj["value"] != "" && obj["fieldId"] != "";

                let dinamicVal = obj["value"];
                try {
                    if (dinamicVal) {
                        if (dinamicVal.includes("@")) {
                            let val = dinamicVal.split("@");
                            val = val[1].split(";");
                            val = val[1];
                            dinamicVal = data[val];
                            if (!dinamicVal) {
                                dinamicVal = "";
                            }
                        }
                    }
                } catch (e) {
                    //console.log(e);
                }

                if (mode == "C" && obj["trigger"] == "create" && minimal) {
                    ////console.log(data[obj["fieldId"]]["_id"]);                
                    updateFromTrigger(target,
                        obj["target"],
                        data[obj["fieldId"]] ? data[obj["fieldId"]] : { "_id": data["_id"] },
                        obj["fieldTarget"],
                        dinamicVal,
                        (err, result) => {
                            if (err) {
                                relResult.push(err);
                                noExecuted += 1;
                            } else {
                                relResult.push("Ok");
                                executed += 1;
                            }
                            if ((executed + noExecuted) >= triggerList.length) {
                                callback({ "data": data, "Executed": executed, "noExecuted": noExecuted, "result": relResult }, response);
                            }
                        }
                    );
                } else if (mode == "M" && obj["trigger"] == "update" && minimal) {
                    updateFromTrigger(
                        target,
                        obj["target"],
                        data[obj["fieldId"]] ? data[obj["fieldId"]] : { "_id": data["_id"] },
                        obj["fieldTarget"],
                        dinamicVal,
                        (err, result) => {
                            if (err) {
                                relResult.push(err);
                                noExecuted += 1;
                            } else {
                                relResult.push("Ok");
                                executed += 1;
                            }
                            if ((executed + noExecuted) >= triggerList.length) {
                                callback({ "data": data, "Executed": executed, "noExecuted": noExecuted, "result": relResult }, response);
                            }
                        }
                    );
                } else {
                    noExecuted += 1;
                }
            }
        } else {
            callback({ "data": data, "Executed": 0, "noExecuted": 0, "result": "" }, response);
        }
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} initial 
 * @param {*} target 
 * @param {*} targetObj 
 * @param {*} property 
 * @param {*} value 
 * @param {*} callback 
 */
function updateFromTrigger(initial, target, targetObj, property, value, callback) {
    ////console.log(target + " eXECUTING" +targetId );
    try {
        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            let obj = {
                $set: {}
            };
            obj["$set"][property] = value;
            let objId = targetObj["_id"];
            ////console.log(obj);
            db.collection(target).updateOne({ "_id": new mongoose.Types.ObjectId(objId) }, obj, (err, data) => {
                if (err) {
                    ////console.log(err);
                    callback({ "Error": err }, null);
                } else {
                    ////console.log(data);
                    ////console.log(target + " Executed " + targetId );
                    callback(null, data);
                    /**if (initial!=target){

                    }**/
                }
            });
        });
    } catch (e) {
        ////console.log(target + " NOT Executed" );
        callback({ "Error": e }, null);
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} target 
 * @param {*} callback 
 * @param {*} response 
 */
function saveRegister(trData, target, callback, response) {
    ////console.log("Saving register");
    try {
        trData["createdBy"] = new mongoose.Types.ObjectId(trData["createdBy"]);
        trData["modifiedBy"] = new mongoose.Types.ObjectId(trData["modifiedBy"]);
        let client = new MongoClient(db.strCon);
        client.connect(db.strCon).then((db) => {
            db.collection(target).insertOne(trData, (err, data) => {
                if (err) {
                    ////console.log(err);
                    callback({ "Error": err }, response);
                } else {
                    ////console.log(data);
                    executeTriggers(trData, target, "C", trData["triggers"], callback, response);
                }
            });
        });
    } catch (e) {
        ////console.log(e);
        callback({ "Error": e }, response);
    }
}

/**
 * Update transaction register
 * @param {*} data : object with data
 * @param {*} idRegister : id of register
 * @param {*} collection : collection name of register transaction
 * @param {*} callback : function ro resolve request
 * @param {*} response : reference response to send result
 */
function updateRegister(data, idRegister, collection, callback, response) {
    try {
        let client = new MongoClient(db.strCon);
        data["createdBy"] = new mongoose.Types.ObjectId(data["createdBy"]);
        data["modifiedBy"] = new mongoose.Types.ObjectId(data["modifiedBy"]);
        client.connect(db.strCon).then((db) => {
            db.collection(collection).updateOne({ "_id": new mongoose.Types.ObjectId(idRegister) }, data, (err, data) => {
                if (err) {
                    ////console.log(err);
                    callback({ "Error": err }, response);
                } else {
                    ////console.log(data);
                    callback(data, response);
                }
            });
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

function deleteRegister(target, id, callback, response) {
    try {
        let agg = [
            {
                $lookup: {
                    from: "fieldxtransaction",
                    let: { "trId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": {
                                    "$eq": ["$transactionId", "$$trId"]
                                }
                            }
                        }, {
                            $lookup: {
                                from: "customfield",
                                localField: "fieldId",
                                foreignField: "_id",
                                as: "field"
                            }
                        }, {
                            $unwind: {
                                path: "$field", preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: "rel"
                }
            }, {
                $match: {
                    "name": target
                }
            }
        ];
        ////console.log(JSON.stringify(agg));
        Transaction.aggregate(agg, (err, data) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                ////console.log(data);
                if (data.length > 0) {
                    let tr = data[0];
                    let fields = [];
                    let toDelete = [];
                    ////console.log(fields);
                    for (i = 0; i < fields.length; i++) {
                        ////console.log(fields[i]);
                        if (fields[i]["field"]["type"] == "file") {
                            ////console.log(fields[i]["field"]["_id"]);
                            toDelete.push(fields[i]["field"]["_id"]);
                        }
                    }
                    let client = new MongoClient(db.strCon);
                    client.connect(db.strCon).then((db) => {
                        if (toDelete.length > 0) {
                            db.collection(target).find({ "_id": new mongoose.Types.ObjectId(id) }).toArray(data, (err, data) => {
                                if (err) {
                                    ////console.log(err);
                                    callback({ "Error": err }, response);
                                } else {
                                    /**
                                    for (j=0; j<toDelete.length; j++){
                                        let path = data[toDelete[j]];
                                        ////console.log(path);
                                        fileServ.deteleFile(path,(err,ans)=>{  
                                            //console.log("file removed: " + path);                                         
                                        });
                                    }**/
                                    db.collection(target).deleteOne({ "_id": new mongoose.Types.ObjectId(id) }, data, (err, data) => {
                                        if (err) {
                                            ////console.log(err);
                                            callback({ "Error": err }, response);
                                        } else {
                                            ////console.log(data);
                                            callback(data, response);
                                        }
                                    });
                                }
                            });
                        } else {
                            db.collection(target).deleteOne({ "_id": new mongoose.Types.ObjectId(id) }, data, (err, data) => {
                                if (err) {
                                    ////console.log(err);
                                    callback({ "Error": err }, response);
                                } else {
                                    ////console.log(data);
                                    callback(data, response);
                                }
                            });
                        }

                    });
                } else {
                    callback({ "Error": "No se encontro la definición de la transacción" }, response);
                }
            }
        });

    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * Get All transaction triggers
 * @param {String} transactionId 
 * @param {Function} callback 
 * @param {Response} response 
 */
function getTransactionTriggers(transactionId, callback, response) {
    try {
        Trigger.find({ "transactionId": transactionId }, (err, data) => {
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
 * Save trigger
 * @param {*} data 
 * @param {Function} callback 
 * @param {Response} response  
 */
function saveTrigger(data, callback, response) {
    try {
        Trigger.create(data, (err, result) => {
            if (err) {
                callback({ "Error": err }, response);
            } else {
                callback(result, response);
            }
        });
    } catch (e) {
        callback({ "Error": e }, response);
    }
}

/**
 * delete trigger
 * @param {String} triggerId 
 * @param {Function} callback 
 * @param {Response} response 
 */
function deleteTrigger(triggerId, callback, response) {
    try {
        Trigger.deleteOne({ "_id": triggerId }, (err, data) => {
            if (err) {
                ////console.log(err);
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e) {
        ////console.log(e);
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} triggerId 
 * @param {*} callback 
 */
function deleteTriggerByTransaction(triggerId, callback) {
    try {
        Trigger.deleteMany({ "transactionId": triggerId }, (err, data) => {
            if (err) {
                ////console.log(err);
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    } catch (e) {
        ////console.log(e);
        callback(e, null);
    }
}

/**
 * 
 * @param {*} transactionId 
 * @param {*} callback 
 * @param {*} response 
 */
function getDefinedCollections(callback, response) {

    let agg = [{
        $lookup: {
            from: 'fieldxtransaction',
            let: { 'transaction': '$_id' },
            pipeline: [
                {
                    $match: {
                        "$expr": {
                            "$eq": ["$transactionId", "$$transaction"]
                        }
                    }
                }, {
                    $lookup: {
                        from: "customfield",
                        localField: "fieldId",
                        foreignField: "_id",
                        as: "field"
                    }
                }, {
                    $unwind: "$field"
                }
            ],
            as: 'fields'
        }
    }];

    Transaction.aggregate(agg, (err, data) => {
        if (err) {
            callback({ "Error": err }, response);
        } else {
            callback(data, response);
        }
    });

}

/**
 * Get data to export to CSV o XSLX
 * @param {*} fields : array with field name and label to header
 * @param {*} collection : collection from data be exported
 * @param {*} filter : filter condition
 * @param {*} sort : sort condition
 * @param {*} callback : callback to resolve request
 * @param {*} response : response object to resolve 
 */
function getReport(fields, collection, filter, sort, callback, response) {
    try {

    } catch (e) {

    }
}