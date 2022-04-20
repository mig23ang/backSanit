let CustomField = require('../models/CustomField');
let FieldXtransaction = require('../models/fieldXtransaction');
var mongoose = require('mongoose');
const config = require("../config/appconfig");
const strTool = require("../tools/stringTools");
const defaultStruct = require("../config/defaultSchemasStructures");

module.exports = {
    getCollectionStrcutures,    
    getFieldList,
    getFieldListFilter,
    getAllFields,
    getFieldsByFilter,
    getFieldById,
    updateField,
    addField,
    deleteField,
    isFieldInUse,
    deleteFieldxTransaction
};

/**
 * Get the strcuture of collection that can poblate fields in fields form creator
 * @param {Function} callback: function to resolve request on procedure ends
 * @param {Response} response: response reference to resolve request
 */
function getCollectionStrcutures(callback,response){
    callback(defaultStruct.defaultSchemmas,response);
}

/**
 * Get all fields created on platform with his type, relation and aggregation mongo structure
 * @param {Function} callback Callback to resolve request (function) 
 * @param {Response} response response reference to resolve request
 */
function getAllFields(callback,response){

}

/**
 * get fields in list mode with pagination
 * @param {*} p: page
 * @param {*} l: lines per page
 * @param {Function} callback Callback to resolve request (function) 
 * @param {Response} response response reference to resolve request
 */
function getFieldList(p,l,callback,response){
    try{
        let agg = CustomField.aggregate([
            /**{
                $match: {           
                    state:{$eq:"Activo"}
                }
            } **/
        ]);
        CustomField.aggregatePaginate(agg,{page:p, limit:l}).then((data)=>{
            callback(data,response);
        }).catch((error)=>{
            callback({"Error":error},response);
        });
    }catch(e){
        callback({"Error":e},response);
    }
}

/**
 * get fields in list mode with pagination
 * @param {*} p: page
 * @param {*} l: lines per page
 * @param {Function} callback Callback to resolve request (function) 
 * @param {Response} response response reference to resolve request
 */
 function getFieldListFilter(p,l, filter,callback,response){
    let regExp = new RegExp(filter,'i');
    try{
        let agg = CustomField.aggregate([
            {
                $match: {
					$and : [
						{
							"state": {
								$ne : "Depurado"
							} 
						},{
							$or : [
								{"label" : {"$regex" : regExp}},
								{"type" : {"$regex" : regExp}}
							]
						}
					]
								   
				}
            } 
        ]);
        CustomField.aggregatePaginate(agg,{page:p, limit:l}).then((data)=>{
            callback(data,response);
        }).catch((error)=>{
            callback({"Error":error},response);
        });
    }catch(e){
        callback({"Error":e},response);
    }
}

/**
 * Function to return specified field information detail
 * @param {*} idField id of field to return
 * @param {Function} callback Callback to resolve request (function) 
 * @param {Response} response response reference to resolve request
 */
function getFieldById(idField,callback,response){
    try{
        CustomField.find({"_id": idField}, (err,data)=>{
            if (err){
                callback({"Error":err},response);
            }else{
                let field = data[0];
                let used = false;
                usedField(idField,(err,ans)=>{
                    if (err){
                        used = true;                       
                    }else{
                        used = ans;                        
                    }
                    callback({"data" : field, "used": used },response);
                });
            }
        });
    }catch(e){
        callback({"Error":e},response);
    }
}

/**
 * Get fields with Aggregation filter
 * @param {Array} filter: [aggregation]
 * @param {Function} callback 
 * @param {Response} response 
 */
function getFieldsByFilter(filter,callback,response){
    try{
        //console.log(filter);
        CustomField.aggregate(filter,(err,data)=>{
            if (err){
                console.log(err);
                callback({"Error":err},response);
            }else{
                callback(data,response);
            }
        });
    }catch(e){
        //console.log("Error in try");
        callback({"Error":e},response);
    }
}

/**
 * 
 * @param {*} idField id of field to update
 * @param {*} data data to update to specified id field
 * @param {Function} callback Callback to resolve request (function) 
 * @param {Response} response response reference to resolve request
 */
function updateField(idField,data,callback,response){
    console.log(data);
    try{
        CustomField.updateOne({"_id":idField},data,(err,data)=>{
            if (err){
                callback({"Error":err},response);
            }else{
                callback(data,response);
            }
        });
    }catch(e){
        callback({"Error":e},response);
    }
}

/**
 * 
 * @param {*} fieldData data to insert field
 * @param {Function} callback Callback to resolve request (function) 
 * @param {Response} response response reference to resolve request
 */
function addField(fieldData,callback,response){
    try{
        CustomField.create(fieldData,(err,data)=>{
            if (err){
                callback({"Error":err},response);
            }else{
                callback(fieldData,response);
            }
        });
    }catch(e){
        callback({"Error":e},response);
    }
}

/**
 * Delete field if it was not used on any transaction
 * @param {*} idField 
 * @param {*} callback 
 * @param {*} response 
 */
function deleteField(idField,callback,response){
    try{
        usedField(idField, (err,ans)=>{
            if (err){
                callback({ "Error": err }, response);
            }else{
                if (!ans){
                    //console.log("Deleting field: " + idField);
                    CustomField.deleteOne({"_id": new mongoose.Types.ObjectId(idField)},(err,data)=>{
                        if (err){
                            callback({ "Error": err }, response);
                        }else{
                            callback({ "Success": data }, response);
                        }
                    });
                }else{
                    callback({ "Error": {"message":"El campo esta en uso por alguna transacción, por favor valide"} }, response);
                }
            }
        });
    }catch(e){
        callback({"Error":e},response); 
    }
}

/**
 * 
 * @param {*} idField 
 * @param {*} callback 
 */
function usedField(idField, callback){
    try{
        FieldXtransaction.find({"fieldId": new mongoose.Types.ObjectId(idField)},(err,data)=>{
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
    }catch(e){
        callback(e,null);
    }
}

/**
 * 
 * @param {*} idField 
 * @param {*} callback 
 * @param {*} response 
 */
function isFieldInUse(idField,callback,response){
    usedField(idField, (err,ans)=>{
        if (err){
            callback({ "Error": err }, response);
        }else{
            callback({ "ans": ans }, response);
        }
    });
}

/**
 * 
 * @param {*} idTransaction 
 * @param {*} callback 
 * @param {*} response 
 */
function deleteFieldxTransaction(idTransaction,callback, response){
    try{
        FieldXtransaction.remove({"transactionId": new mongoose.Types.ObjectId(idTransaction)},(err,data)=>{
            if (err) {
                //resolve the callback with the response object
                callback({ "Error": err }, response);
            } else {
                callback({ "Succes": data }, response);
            }
        });
    }catch(e){
        callback({ "Error": e }, response);
    }
}