let Place = require('../models/place');
let fieldXtra = require('../models/fieldXtransaction');
const mongoose = require('mongoose');
const strTool = require("../tools/stringTools");

module.exports = {
    getPlaces,
    getPlacesRaw,
    getPlacesFilter,
    getPlacesFiltered,
    addPlace,
    updatePlace,
    depurePlace,
    getPlaceById,
    getOwnersPlaces
}

/**
 * get places
 * @param {*} p 
 * @param {*} l 
 * @param {*} callback 
 * @param {*} response 
 */
function getPlaces(p,l, order,callback, response) {
    let placeAgg = [
        {
            $lookup: {
                from: "entite", localField: "ownerId", foreignField: "_id", as: "owner"
            }
        }, { $unwind: "$owner" },
        {
            $lookup: {
                from: "entite", localField: "contactId", foreignField: "_id", as: "contact"
            }
        }, { $unwind: "$contact" },{
            $match : {
                "state" : {
                    $ne : "Eliminado"
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
            placeAgg.push({"$sort":orderObj});
        }catch(e){
            //console.log(e);
        }
    }

    Place.aggregatePaginate(Place.aggregate(placeAgg),{page:p,limit:l}).then((data) => {
        callback(data,response);
    }).catch((error) => {
        callback({"Error":error},response);
    });
}

function getPlacesRaw(callback,response){
    Place.find({"state":{$ne:"Eliminado"}},(error,data)=>{
        if (error) {
            callback({ "Error": error }, response);
        } else {
            callback(data, response);
        }
    });
}


/**
 * get places
 * @param {*} p 
 * @param {*} l 
 * @param {*} callback 
 * @param {*} response 
 */
 function getPlacesFilter(filter,p,l, order,callback, response) {
    let regExp = new RegExp(filter,'i');
    let placeAgg = [
        {
            $lookup: {
                from: "entite", localField: "ownerId", foreignField: "_id", as: "owner"
            }
        }, { $unwind: "$owner" },
        {
            $lookup: {
                from: "entite", localField: "contactId", foreignField: "_id", as: "contact"
            }
        }, { $unwind: "$contact" },{            
            $match: {
                $and : [
                    {
                        "state": {
                            $ne : "Eliminado"
                        } 
                    },{
                        $or : [
                            {"name" : {"$regex" : regExp}},
                            {"owner.names" : {"$regex" : regExp}},
                            {"owner.idnumber" : {"$regex" : regExp}},
                            {"contact.names" : {"$regex" : regExp}},
                            {"phone" : {"$regex" : regExp}},
                            {"city" : {"$regex" : regExp}},
                            {"address" : {"$regex" : regExp}},
                            {"state": {"$regex" : regExp}}
                        ]
                    }
                ]								   
            }			
        }
    ];

    if (order){
        console.log(order);		
        try{
            let orderObj = {};
            let params = order.split(":");
            if (params[1]=="1"){
                orderObj[params[0]] = 1;
            }else{
                orderObj[params[0]] =-1;
            }			
            placeAgg.push({"$sort":orderObj});
        }catch(e){
            //console.log(e);
        }
    }
    
    Place.aggregatePaginate(Place.aggregate(placeAgg),{page:p,limit:l}).then((data) => {
        callback(data,response);
    }).catch((error) => {
        callback({"Error":error},response);
    });
}

/**
 * 
 * @param {*} filter 
 * @param {*} callback 
 * @param {*} response 
 */
function getPlacesFiltered(filter,callback,response){
    //console.log("Filter: "+JSON.stringify(filter));
    try{
        Place.aggregate(filter, function (error, data) {
            if (error) {
                callback({ "Error": error }, response);
            } else {
                callback(data, response);
            }
        });
    }catch(e){
        callback({ "Error": e }, response);
    }
}

/**
 * 
 * @param {*} place 
 * @param {*} callback 
 * @param {*} response 
 */
function addPlace(place, callback, response) {
    let name = strTool.camelCaseSpaced(place.name);
    Place.find({ "name": name }, function (error, data) {
        //console.log("Adding user: "+data.length);
        if (error) {
            callback({ "Error": error }, response);
        } else {
            if (data.length > 0) {
                //console.log("User email is in use and must be unique " + data);
                callback({ "Error": "Ya existe un lugar con el nombre registrado" }, response);
            } else {
                place.name = name;
                Place.create(place, function (error, data) {
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
 * @param {*} placeJson 
 * @param {*} callback 
 * @param {*} response 
 */
function updatePlace(id, placeJson, callback, response) {
    let place = placeJson["data"];
    place.name = strTool.camelCaseSpaced(place.name);
    Place.updateOne({ "_id": id }, place, function (error, data) {
        if (error) {
            console.log("Error updating: " + error);
            callback({ "Error": error }, response);
        } else {
            //console.log("Success: "+JSON.stringify(data));
            callback(place, response);
        }
    });
}

/**
 * depure a place
 * @param {String} id 
 * @param {Function} callback 
 */
function depurePlace(id,callback){
    fieldXtra.aggregate([
        {
            $lookup : {
                from : "customfield",
                localField: "fieldId",
                foreignField : "_id",
                as : "field" 
            }
        },{
            $unwind : "$field"
        },{
            $lookup : {
                from : "transaction",
                localField: "transactionId",
                foreignField : "_id",
                as : "transaction" 
            }
        },{
            $unwind : "$transaction"
        },{
            $match : {
                "field.relation" : "place"
            }
        }
    ], (err,data)=>{
        if (err){
            callback(err,null);
        }else{
            let aggregation = [
                {
                    $lookup : {
                        from : "remision",
                        localField : "_id",
                        foreignField : "placeId",
                        as : "remision"
                    }
                },{
                    $lookup : {
                        from : "supply",
                        localField : "_id",
                        foreignField : "placeId",
                        as : "supply"
                    }
                },{
                    $lookup : {
                        from : "order",
                        localField : "_id",
                        foreignField : "placeId",
                        as : "order"
                    }
                }
            ];
            //console.log(data);
            let fields = [];
            for (j=0; j<data.length; j++){
                let matchVar = {};
                matchVar[data[j]["fieldId"] + "._id"] = id;
                let agg = {
                    $lookup : {
                        from : data[j]["transaction"]["name"],
                        let : {"placeId" : "_id"},
                        pipeline: [
                            {
                                $match: matchVar
                            }
                        ],
                        as : data[j]["transaction"]["name"]+""
                    }
                }
                fields.push(data[j]["transaction"]["name"]);
                aggregation.push(agg);
            }
            aggregation.push({
                $match : {
                    "_id" : new mongoose.Types.ObjectId(id)
                }
            });
            Place.aggregate(aggregation,(err,data)=>{
                if (err){
                    //console.log(err);
                    callback(err,null);
                }else{
                    //callback(null,data);
                    if (data.length<0){
                        callback("No se encontro registro del tercero, Informe a soporte técnico",null);
                    }else{
                        let place = data[0];
                        let msg = "";
                        if (place["remision"].length>0){
                            msg += "El lugar esta registrado como un lugar de recepcion en remisiones; " + "\n";
                        }if (place["supply"].length>0){
                            msg += "El lugar esta registrado como un lugar de envío; " + "\n";
                        }if (place["order"].length>0){
                            msg += "El lugar esta registrado como un lugar de destino en ordenes; " + "\n";
                        }
                        for (k=0 ; k<fields.length; k++){
                            if (place[fields[k]].length>0){
                                msg += "El lugar esta registrado en la transaccion " + fields[k]+"; " + "\n";
                            }
                        }

                        if (msg!=""){
                            callback(msg,null);
                        }else{
                            Place.updateOne({ "_id": id }, {"state":"Eliminado"}, function (error, data) {
                                if (error){
                                    callback(error,null);
                                }else{
                                    callback(null,data);
                                }
                            });
                        }
                    }
                }
            });

        }
    });
}

/**
 * 
 * @param {*} id 
 * @param {*} callback 
 * @param {*} response 
 */
function getPlaceById(id, callback, response) {
    Place.find({ "_id": id }, function (error, data) {
        if (error) {
            callback({ "Error": error }, response);
        } else {
            callback(data, response);
        }
    });
}

function getOwnersPlaces(idOwner,callback,response){
    let agg = [
        {
            $match : {
                $and : [
                    {
                        "ownerId" : {"$eq":new mongoose.Types.ObjectId(idOwner)}
                    },{
                        "state" : {"$ne" : "Eliminado"}
                    }
                ]
                
            }
        }
    ];
    Place.aggregate(agg,(err,data)=>{
        if (err) {
            callback({ "Error": err }, response);
        } else {
            callback(data, response);
        }
    });
}