// Get the user data template and structure
let Entite = require('../models/entite');
let fieldXtra = require('../models/fieldXtransaction');
var mongoose = require('mongoose');
const config = require("../config/appconfig");
const strTool = require("../tools/stringTools");

module.exports = {
    getAllEntites,
    getEntitesFiltered,
    getEntiteFilter,
    getOwnerContact,
	addEntite,
    updateEntite,
    getEntiteById,   
    depureEntite    
};
/**
 * Get all entites with page limit, not including entites that have state equal to Eliminado
 * @param {Number} p: page of list
 * @param {Number} l: lines per page
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getAllEntites(p,l,order,callback){
	let entiteAggregation = [        
        {
            $match: {
                $and : [
                    {
                        "state": {
                            $ne : "Eliminado"
                        } 
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
            entiteAggregation.push({"$sort":orderObj});
        }catch(e){
            //console.log(e);
        }
    }

	Entite.aggregatePaginate(Entite.aggregate(entiteAggregation),{page:p,limit:l}).then((data) => {
        //console.log("data recolected succesfully");
        callback(null,data);
    }).catch((error) => {
        //console.log("Error ocurred during the recollection... " + error);
        callback({"Error":error},null);
    });
}

/**
 * Get list of entites with filter condition
 * @param {String} filter : filter that is only a string that will be converted into Regular Expression
 * @param {Number} p : actual page of the list
 * @param {Number} l : actual lines per page
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getEntitesFiltered(filter,p,l, order,callback){
    //console.log("filtering entites");
    try{
        let regExp = new RegExp(filter,'i');
        let agg = [
            {
				$match: {
					$and : [
						{
							"state": {
								$ne : "Eliminado"
							} 
						},{
							$or : [
								{"names" : {"$regex" : regExp}},
								{"idnumber" : {"$regex" : regExp}},
                                {"address" : {"$regex" : regExp}},
                                {"city" : {"$regex" : regExp}},
                                {"phone" : {"$regex" : regExp}},
                                {"email" : {"$regex" : regExp}},
                                {"entType" : {"$regex" : regExp}},
                                {"state" : {"$regex" : regExp}}
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
                agg.push({"$sort":orderObj});
            }catch(e){
                //console.log(e);
            }
        }
        let entiteAgg = Entite.aggregate(agg);
        Entite.aggregatePaginate(entiteAgg,{page:p,limit:l}).then((data) => {
            callback(null,data);
        }).catch((error) => {
            callback({"Error":error},null);
        });
    }catch(e){
        callback({"Error":e},null);
    }
    
}

/**
 * 
 * @param {*} filterAggregation 
 * @param {*} callback 
 * @param {*} response 
 */
function getEntiteFilter(filterAggregation, callback) {
    try {
        Entite.aggregate(filterAggregation, function (err, data) {
            if (err) {
                callback({ "Error": err }, null);
            } else {
                callback(null, data);
            }
        });
    } catch (err) {
        callback({"Error":err},null);
    }
}

/**
 * 
 * @param {*} callback 
 * @param {*} response 
 */
async function getOwnerContact(callback, response) {
    const [owners, contacts] = await Promise.all([
        Entite.find({"entType":"Proveedor"}),
        Entite.find({"entType": "Contacto" })
    ]);
    callback(null,{ "owners": owners, "contacts" : contacts });

}

/**
 * Add entite
 * @param {Entite} entData 
 * @param {Function} callback  
 */
  function addEntite (entData,callback){
	let idNum =entData.idnumber.toUpperCase();
    let type = entData.entType;
    //console.log(entData);
    let agg = [
        {$match : {
                $and : [
                    {"idnumber" : {"$eq":idNum}},
                    {"entType" : {"$eq":type}}
                ]
            }
        }
    ];
    //console.log(JSON.stringify(agg));
	Entite.aggregate(agg,function(error,data){
		if (error){
			callback({"Error":error},response);
		} else {
			if (data.length>0){
				//console.log("User email is in use and must be unique " + data);
				callback ({"Error":"Ya existen (" + data.length + ") terceros con el documento de identidad indicado!"},response);
			}else{
                entData["names"] = strTool.camelCaseSpaced(entData["names"]);
                entData["idnumber"] = entData["idnumber"].toUpperCase();
                entData["address"] = strTool.camelCaseSpaced(entData["address"]);
                entData["city"] = strTool.camelCaseSpaced(entData["city"]);
                if (entData["email"]){
                    entData["email"] = entData["email"] ? entData["email"].toLowerCase() : "";
                }
                 
				Entite.create(entData, function (error, data) {
					if (error) {
						//console.log("Error Adding User: " + error);
						callback ({"Error":error},null);
						//return callback("Error Adding User: " + error);
					} else {
						//console.log("Data persisted succesfully...");
						callback (null,data);
					}
				});
			}
		}		
	});
}

/**
 * update entite brinding id of mongoobj
 * @param {String} idEnt 
 * @param {Entite} entJson 
 * @param {Function} callback 
 */
function updateEntite(idEnt,entJson,callback){
    let entData = entJson["data"];
    entData["email"] = entData["email"] ? entData["email"].toLowerCase() : " ";
    Entite.updateOne({ "_id": idEnt }, entData, function (error, data) {
        if (error) {
            console.log("Error updating: " + error);
            callback({ "Error": error }, null);
        } else {
            //console.log("Success: "+JSON.stringify(data));
            callback(null,entData);
        }
    });
}

/**
 * 
 * @param {*} idEnt 
 * @param {*} callback 
 * @param {*} response 
 */
function getEntiteById(idEnt, callback) {
    Entite.find({ "_id": idEnt }, function (error, data) {
        if (error) {
            callback({ "Error": error },null);
        } else {
            callback(null, data);
        }
    });
}

/**
 * Depure entite if it was not consumed in any transaction
 * @param {String} idEnt : Id of mongodb Object entite 
 * @param {Function} callback : function to resolve as a callback 
 */
function depureEntite(idEnt, callback){
    //Check if entite was registered as a field    
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
                "field.relation" : "entite"
            }
        }
    ], (err,data)=>{
        if (err){
            callback(err,null);
        }else{
            let aggregation = [
                {
                    $lookup : {
                        from : "place",
                        localField : "_id",
                        foreignField : "ownerId",
                        as : "owner"
                    }
                },{
                    $lookup : {
                        from : "place",
                        localField : "_id",
                        foreignField : "contactId",
                        as : "contact"
                    }
                },{
                    $lookup : {
                        from : "remision",
                        localField : "_id",
                        foreignField : "providerId",
                        as : "provider"
                    }
                },{
                    $lookup : {
                        from : "order",
                        localField : "_id",
                        foreignField : "customerId",
                        as : "customer"
                    }
                }
            ];
            //console.log(data);
            /**
             let : {"entId" : "_id"},
                        pipeline: [
                            {
                                $match: {
                                    "$expr": {
                                        "$eq": ["$"+data[j]["fieldId"]+"."+idEnt, "$$entId"]
                                    }
                                }
                            }
                        ],
             */
            let fields = [];
            for (j=0; j<data.length; j++){
                let matchVar = {};
                matchVar[data[j]["fieldId"] + "._id"] = idEnt;
                let agg = {
                    $lookup : {
                        from : data[j]["transaction"]["name"],
                        let : {"entId" : "_id"},
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
                    "_id" : new mongoose.Types.ObjectId(idEnt)
                }
            });
            //console.log(JSON.stringify(aggregation));
            Entite.aggregate(aggregation,(err,data)=>{
                if (err){
                    //console.log(err);
                    callback(err,null);
                }else{
                    //callback(null,data);
                    if (data.length<0){
                        callback("No se encontro registro del tercero, Informe a soporte técnico",null);
                    }else{
                        let entite = data[0];
                        //console.log(entite);
                        let msg = "";
                        if (entite["owner"].length>0){
                            msg += "El tercero esta registrado como un propietario en un lugar; " + "\n";
                        }if (entite["contact"].length>0){
                            msg += "El tercero esta registrado como un contacto en un lugar; " + "\n";
                        }if (entite["provider"].length>0){
                            msg += "El tercero esta registrado como un proveedor en una remision; " + "\n";
                        }if (entite["customer"].length>0){
                            msg += "El tercero esta registrado como un cliente en un pedido; " + "\n";
                        }
                        //console.log(fields);
                        for (k=0 ; k<fields.length; k++){
                            //console.log(fields[k]);
                            //console.log(entite[fields[k]]);
                            if (entite[fields[k]].length>0){
                                msg += "El tercero esta registrado en la transaccion " + fields[k]+"; " + "\n";
                            }
                        }

                        if (msg!=""){
                            callback(msg,null);
                        }else{
                            //callback("Prueba",null);
                            
                            Entite.updateOne({ "_id": idEnt }, {"state":"Eliminado"}, function (error, data) {
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