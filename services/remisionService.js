let Remision = require('../models/remision');
let supplyServ = require('./supplyService');
var mongoose = require('mongoose');
let suid = require('short-uuid');

module.exports = {
    getAllRemision,
    getRemisionPaginated,
    getRemisionsFilter,
    getRemisionById,
    addRemision,
    updateRemision,
    deleteRemision
};

//Remision===========================================================================================================================================
/**
 * Get all remisions without pagination
 * @param {Response} response Response to resolve request
 */
function getAllRemision(response) {
    Remision.find({}, function (err, data) {
        if (err) {
            response.json({ "Error": err });
        } else {
            response.json(data);
        }
    });
}

/**
 * Get remision's list paginated
 * @param {number} p Actual page
 * @param {number} l Lines per page
 * @param {Response} response Response to resolve
 */
function getRemisionPaginated(p, l, order, callback, response) {
    let remAggregation =[
        {
            $lookup:
            {
                from: "entite", localField: "providerId", foreignField: "_id", as: "provider"
            }
        }, { $unwind: "$provider" },{
            $lookup:
            {
                from: "user", localField: "createdBy", foreignField: "_id", as: "creator"
            }
        },{ 
            $unwind: {
                path: "$creator", preserveNullAndEmptyArrays: true
            } 
        },{
            $lookup:
            {
                from: "user", localField: "modifiedBy", foreignField: "_id", as: "modificator"
            }
        },{ 
            $unwind: {
                path: "$modificator", preserveNullAndEmptyArrays: true
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
            remAggregation.push({"$sort":orderObj});
        }catch(e){
            //console.log(e);
        }
    }

    let agg =  Remision.aggregate(remAggregation);

    Remision.aggregatePaginate(agg, { page: p, limit: l }).then((data) => {
        callback(data, response);
    }).catch((err) => {
        callback({ "Error": err }, response);
    });
}

/**
 * Get remision's list paginated filtered
 * @param {string} filter
 * @param {number} p Actual page
 * @param {number} l Lines per page
 * @param {Response} response Response to resolve
 */
 function getRemisionsFilter(filter,p, l, order, callback, response) {
     //console.log(filter);
    try{
        let regExp = new RegExp(filter,'i');
        let remAggregation = [
            {
                $lookup:
                {
                    from: "entite", localField: "providerId", foreignField: "_id", as: "provider"
                }
            }, { 
                $unwind: "$provider" 
            },{
                $lookup:
                {
                    from: "user", localField: "createdBy", foreignField: "_id", as: "creator"
                }
            },{ 
                $unwind: {
                    path: "$creator", preserveNullAndEmptyArrays: true
                } 
            },{
                $lookup:
                {
                    from: "user", localField: "modifiedBy", foreignField: "_id", as: "modificator"
                }
            },{ 
                $unwind: {
                    path: "$modificator", preserveNullAndEmptyArrays: true
                } 
            },{
				$match: {
					$and : [
						{
							"state": {
								$ne : "Depurado"
							} 
						},{
							$or : [
								{"code" : {"$regex" : regExp}},
								{"receivedAt" : {"$regex" : regExp}},
								{"description" : {"$regex" : regExp}},
                                {"state" : {"$regex" : regExp}},
                                {"creator.names" : {"$regex" : regExp}},
                                {"creator.lastNames" : {"$regex" : regExp}}
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
                remAggregation.push({"$sort":orderObj});
            }catch(e){
                //console.log(e);
            }
        }

        let agg =  Remision.aggregate(remAggregation);

        Remision.aggregatePaginate(agg,{page:p,limit:l}).then((data) => {
            callback(data,response);
        }).catch((error) => {
            callback({"Error":error},response);
        });
     }catch(e){
        callback({"Error":e},response);
     }
}

function getRemisionById(idRemision, callback, response) {
    try {
        Remision.aggregate([
            /**{
                $lookup: {
                    from: "supplies", localField: "_id", foreignField: "remisionId", as: "supplies"
                }
            },**/
            {
                $match: {
                    $and: [
                        { _id: { $eq: new mongoose.Types.ObjectId(idRemision) } }
                    ]
                }
            }
        ], function (err, data) {
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
 * Add a remision
 * @param {any} data Json Object containing the format of remision {receivedAt:date,code:string,providerId: entite}
 * @param {any} callback callback to retunr the result
 * @param {any} response Response to resolve
 */
function addRemision(data, callback, response) {    
    try {
        //let code = data["code"].toUpperCase();
        Remision.create(data, function (err, data) {
            if (err) {
                //console.log("Error saving remision: ");
                //console.log(err);
                callback({ "Error": err }, response);
            } else {
                callback(data, response);
            }
        });
    } catch (e){
        //console.log("Error trying to save remision: ");
        //console.log(e);
        callback({ "Error": e }, response);
    }
}
/**
 * 
 * @param {string} idRemision id of remision to be updated
 * @param {any} data Json Object containing the format of remision {_id:string,receivedAt:date,code:string,providerId: entite, state: string, createdAt: date, modifiedAt: date...}
 * @param {any} response Response to resolve
 */
function updateRemision(idRemision, data, callback, response) {
    Remision.updateOne({ "_id": idRemision }, data, function (err, respData) {
        if (err) {
            callback({ "Error": err }, response);
        } else {
           // console.log(data);
            data["_id"] = idRemision;
            //console.log(data);
            callback(data, response);
        }
    });
}

/**
 * 
 * @param {string} idRemision id of remision to be updated
 * @param {any} response Response to resolve
 */
function deleteRemision(idRemision, callback, response){
    try{
        Remision.find({"_id": new mongoose.Types.ObjectId(idRemision)},(err,data)=>{
            if (err){

            }else{
                let rem = data[0];
                if (rem){
                    if (rem["state"]=="Aprobada"){
                        callback({ "Error": {"message":"La remisión está aprobada"} }, response); 
                    }else{
                        Remision.deleteOne({"_id":idRemision},function (err, data) {
                            if (err) {
                                //resolve the callback with the response object
                                callback({ "Error": err }, response);
                            } else {
                                //resolve the callback with the response object
                                supplyServ.deleteSupplyByRem(idRemision,callback,response);
                            }
                        });
                    }
                }else{
                    callback({ "Error": {"message":"No se encontró el registro"} }, response);
                }
            }
        });
    }catch(e){
        callback({ "Error": e }, response);
    }
}