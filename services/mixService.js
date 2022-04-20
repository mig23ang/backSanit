let Mix = require('../models/mix');
let SupplyXmix = require('../models/supplyxmix');
let LotXmix = require('../models/lotxmix');
const counterService = require('./counterService');
const mongoose = require('mongoose');

module.exports = {
    getMixesFiltered,
    getMix,
	mixList,
	mixListFiltered,
    addMix,
    updateMix,
    deleteMix,
    addSupplyToMix,
    getMixSupplies,
    deleteSupplyFromMix,
    addLotToMix,
    getMixLots,
    deleteLotToMix
}

/**
 * Get all mixes passing aggregation filter mongodb format
 * @param {Array} filter : [{...}] aggregation format filter
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getMixesFiltered(filter,callback){
    try{
        Mix.aggregate(filter,(err,data)=>{
            callback(err,data);

        });
    }catch(e){
        callback(e,null);
    }
}

/**
 * Get list of mixes with pagination, limit, sort condition
 * @param {Number} p : actual page of the list that will be returned
 * @param {Number} l : lines per page of the required list
 * @param {String} s : sort condition, it will be in format -> field:sort
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function mixList(p,l,s,callback){
    let agg = [
        {
            $lookup : {
                from : "mixxref",
                localField : "_id",
                foreignField : "mixId",
                as : "control"
            }
        },{
            "$unwind" : {path : "$control", preserveNullAndEmptyArrays: true}
        },{
            $lookup : {
                from : "unite",
                localField : "uniteId",
                foreignField : "_id",
                as: "unite"
            }
        },{
            $unwind : {path: "$unite", preserveNullAndEmptyArrays: true}
        },{
            $lookup : {
                from : "supplyxmix",
                let: { "mixId" : "$mixId"},
                pipeline: [
                    {
                        $match : {
                            $expr : {
                                $eq : ["$mixId", "$$mixId"]
                            }
                        }
                    },{
                        $lookup : {
                            from : "supply",
                            let: { "supplyId" : "$supplyId"},
                            pipeline: [
                                {
                                    $match : {
                                        $expr : {
                                            $eq : ["$_id", "$$supplyId"]
                                        }
                                    }
                                }
                            ],
                            as: "supply"
                        }
                    },{
                        $unwind : "$supply"
                    }
                ],
                as: "supplies"
            }
        },{
            $lookup : {
                from : "lotxmix",
                let: { "mixId" : "$mixId"},
                pipeline: [
                    {
                        $match : {
                            $expr : {
                                $eq : ["$mixId", "$$mixId"]
                            }
                        }
                    },{
                        $lookup : {
                            from : "lot",
                            let: { "lotId" : "$lotId"},
                            pipeline: [
                                {
                                    $match : {
                                        $expr : {
                                            $eq : ["$_id", "$$lotId"]
                                        }
                                    }
                                }
                            ],
                            as: "lot"
                        }
                    },{
                        $unwind : "$lot"
                    }
                ],
                as: "lots"
            }
        },{
            $lookup : {
                from : "user",
                localField: "createdBy",
                foreignField : "_id",
                as: "creator"
            }
        },{
            $unwind : {path : "$creator", preserveNullAndEmptyArrays : true}
        },{
            $lookup : {
                from : "user",
                localField: "modifiedBy",
                foreignField : "_id",
                as: "modificator"
            }
        },{
            $unwind : {path : "$modificator", preserveNullAndEmptyArrays : true}
        },{
            '$group': {
                "_id": "$_id",
                "code" : {"$first" : "$code"},
                "initialW" : {"$first" : "$initialW"},
                "netW": { "$first" : "$netW"},
                "grossW": { "$first" : "$grossW"},
                "state": { "$first" : "$state"},
                "description": { "$first" : "$description"},
                "creator": { "$first" : "$creator"},
                "createdAt": { "$first" : "$createdAt"},
                "modificator": { "$first" : "$modificator"},
                "modifiedAt": { "$first" : "$modifiedAt"},
                "unite": {"$first" : "$unite"},
                "consumed" : { "$sum" : "$control.factor"},
            }
        }
    ];

    if (s){
        //console.log(order);		
        try{
            let orderObj = {};
            let params = s.split(":");
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

    let mixAgg = Mix.aggregate(agg);
    Mix.aggregatePaginate(mixAgg,{"page":p,"limit":l}).then((data)=>{
        callback(null,data);        
    },(err)=>{
        callback(err, null);
    });
}

/**
 * 
 * Get list of mixes with pagination, limit, sort condition
 * @param {Number} p : actual page of the list that will be returned
 * @param {Number} l : lines per page of the required list
 * @param {String} s : sort condition, it will be in format -> field:sort
 * @param {String} f : condition to filter in list fields (is strgin that will be converted on regular Expression)
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function mixListFiltered(p,l,s,f,callback){
    let regExp = new RegExp(f,'i'); 
    let agg = [
        {
            $lookup : {
                from : "mixxref",
                localField : "_id",
                foreignField : "mixId",
                as : "control"
            }
        },{
            "$unwind" : {path : "$control", preserveNullAndEmptyArrays: true}
        },{
            $lookup : {
                from : "unite",
                localField : "uniteId",
                foreignField : "_id",
                as: "unite"
            }
        },{
            $unwind : {path: "$unite", preserveNullAndEmptyArrays: true}
        },{
            $lookup : {
                from : "user",
                localField: "createdBy",
                foreignField : "_id",
                as: "creator"
            }
        },{
            $unwind : {path : "$creator", preserveNullAndEmptyArrays : true}
        },{
            $lookup : {
                from : "supplyxmix",
                let: { "mixId" : "$mixId"},
                pipeline: [
                    {
                        $match : {
                            $expr : {
                                $eq : ["$mixId", "$$mixId"]
                            }
                        }
                    },{
                        $lookup : {
                            from : "supply",
                            let: { "supplyId" : "$supplyId"},
                            pipeline: [
                                {
                                    $match : {
                                        $expr : {
                                            $eq : ["$_id", "$$supplyId"]
                                        }
                                    }
                                }
                            ],
                            as: "supply"
                        }
                    },{
                        $unwind : "$supply"
                    }
                ],
                as: "supplies"
            }
        },{
            $lookup : {
                from : "lotxmix",
                let: { "mixId" : "$mixId"},
                pipeline: [
                    {
                        $match : {
                            $expr : {
                                $eq : ["$mixId", "$$mixId"]
                            }
                        }
                    },{
                        $lookup : {
                            from : "lot",
                            let: { "lotId" : "$lotId"},
                            pipeline: [
                                {
                                    $match : {
                                        $expr : {
                                            $eq : ["$_id", "$$lotId"]
                                        }
                                    }
                                }
                            ],
                            as: "lot"
                        }
                    },{
                        $unwind : "$lot"
                    }
                ],
                as: "lots"
            }
        },{
            "$match" : {
                "$or" : [
                    {"code" : {"$regex" : regExp}},
                    {"initialW" : {"$regex" : regExp}},
                    {"unite.code" : {"$regex" : regExp}},
                    {"unites" : {"$regex" : regExp}},
                    {"netW" : {"$regex" : regExp}},
                    {"grossW" : {"$regex" : regExp}},
                    {"description" : {"$regex" : regExp}},
                ]
            }
        },{
            '$group': {
                "_id": "$_id",
                "code" : {"$first" : "$code"},
                "initialW" : {"$first" : "$initialW"},
                "netW": { "$first" : "$netW"},
                "grossW": { "$first" : "$grossW"},
                "state": { "$first" : "$state"},
                "creator": { "$first" : "$creator"},
                "createdAt": { "$first" : "$createdAt"},
                "modificator": { "$first" : "$modificator"},
                "modifiedAt": { "$first" : "$modifiedAt"},
                "unite": {"$first" : "$unite"},
                "description": {"$first" : "$description"},
                "consumed" : { "$sum" : "$control.factor"} 
            }
        }
    ];

    if (s){
        //console.log(order);		
        try{
            let orderObj = {};
            let params = s.split(":");
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

    let mixAgg = Mix.aggregate(agg);
    Mix.aggregatePaginate(mixAgg,{"page":p,"limit":l}).then((data)=>{
        callback(null,data);        
    },(err)=>{
        callback(err, null);
    });
}

/**
 * Get mix brinding the id of the mix object in mongodb
 * @param {String} idMix : id of mix in mongodb 
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getMix(idMix,callback){
    try{
        let agg = [
            {
                $match : {
                    "_id" : new mongoose.Types.ObjectId(idMix)
                }
            },{
                $lookup : {
                    from : "unite",
                    localField : "uniteId",
                    foreignField : "_id",
                    as : "unite"
                }
            },{
                $unwind : "$unite"
            },{
                $lookup : {
                    from : "user",
                    localField : "createdBy",
                    foreignField : "_id",
                    as : "creator"
                }
            },{
                $unwind : "$creator"
            },{
                $lookup : {
                    from : "user",
                    localField : "modifiedBy",
                    foreignField : "_id",
                    as : "modificator"
                }
            },{
                $unwind : "$modificator"
            }
        ];
        Mix.aggregate(agg,(err,data)=>{
            callback(err,data);
            
        });
    }catch(e){
        callback(e,null);
    }
}

/**
 * Add a mix with format of specified param
 * @param {Mix} dataMix: Mix to be added in format of model mix.js
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function addMix(dataMix,callback){
    //console.log(dataMix);

    try {
        counterService.getDocNum("mix",(err,data)=>{           
         if (err){
             //console.log(err);
             callback(err, null);
         }else{
             //console.log(dataMix);
             dataMix["code"]=data;
             //console.log(lotObj);
             Mix.create(dataMix, function (err, data) {
                 callback(err, data);                 
             });
         }
        });
         
     } catch (e) {
         //console.log(e); 
         callback(e, null);
     }
}

/**
 * get all supplies registered as a mix composition
 * @param {String} idMix : id of mongodb mix object
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getMixSupplies(idMix,callback){
    try{
        let agg = [
            {
                $lookup : {
                    from : "supply",
                    let : {"idRel" : "$supplyId"},
                    pipeline: [
                        {
                            $match: {
                                "$expr": {
                                    "$eq": ["$_id", "$$idRel"]
                                }
                            }
                        },{
                            $lookup : {
                                from : "product",
                                let : {"prodId" : "$productId"},
                                pipeline:[
                                    {
                                        $match: {
                                            "$expr": {
                                                "$eq": ["$_id", "$$prodId"]
                                            }
                                        }
                                    },{
                                        $lookup : {
                                            from : "unite",
                                            localField : "uniteId",
                                            foreignField : "_id",
                                            as : "unite"
                                        }
                                    },{
                                        $unwind : "$unite"
                                    }
                                ],
                                as: "product"
                            }
                        },{
                            $unwind : "$product"
                        },{
                            $lookup : {
                                from : "remision",
                                let : {"remId" : "$remisionId"},
                                pipeline : [
                                    {
                                        $match: {
                                            "$expr": {
                                                "$eq": ["$_id", "$$remId"]
                                            }
                                        }
                                    }
                                ],
                                as : "remision"
                            }
                        },{
                            $unwind : "$remision"
                        }
                    ],
                    as : "supply"
                }
            },{
                $unwind : "$supply"
            },{
                $match : {
                    "mixId" : new mongoose.Types.ObjectId(idMix)
                }
            }
        ];
        SupplyXmix.aggregate(agg,(err,data)=>{            
            callback(err,data);            
        });
    }catch(e){
        callback(e,null);
    }
}

/**
 * Update Mix
 * @param {String} idMix : id of mix object in mongodb to be updated
 * @param {Mix} dataMix : mix fields to be updated
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function updateMix(idMix,dataMix,callback){
    Mix.updateOne({ "_id": idMix }, dataMix, function (err, data) {
        callback(err, data);
    });
}

/**
 * Delete mix if it is in Registrado state, if not, the ans will be an error
 * @param {String} idMix : id of mongodb object mix
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function deleteMix(idMix,callback){
    Mix.find({"_id": idMix}, (err,data)=>{
        if (data.length>=0){
            let inf = data[0];
            if (inf["state"]!="Registrado"){
                callback("No se puede eliminar una mezcla en uso",null);
            }else{
                Mix.deleteOne({"_id": new mongoose.Types.ObjectId(idMix)},(err,data)=>{
                    callback(err,data);
                });
            }
        }else{
            callback("No se encontro información",null);
        }
    });
}

/**
 * Add a supply to mix, partiotionally
 * @param {SupplyXmix} supplyRel : object as supplyxmix.js model
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function addSupplyToMix(supplyRel,callback){
    SupplyXmix.create(supplyRel,(err,data)=>{
         callback(err,data);
        
    });
}

/**
 * Delete supply from mix
 * @param {String} idRel : id of supplyxmix mongodb object
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function deleteSupplyFromMix(idRel,callback){
    SupplyXmix.deleteOne({"_id": new mongoose.Types.ObjectId(idRel)},(err,data)=>{
        callback(err,data);        
    });
}

/**
 * Add lot to mix partitioned
 * @param {LotXmix} lotRel : lotxmix.js object
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function addLotToMix(lotRel,callback){
    LotXmix.create(lotRel,(err,data)=>{
        callback(err,data);        
    });
}

/**
 * get all lots added to mix
 * @param {String} idMix : id of mix mongodb object
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function getMixLots(idMix,callback){
    //console.log("Getting mix lots");
    try{
        let agg = [
            {
                $lookup : {
                    from : "lot",
                    let : {
                        "lotId" : "$lotId"
                    },
                    pipeline : [
                        {
                            $match: {
                                "$expr": {
                                    "$eq": ["$_id", "$$lotId"]
                                }
                            }
                        },{
                            $lookup : {
                                from : "unite",
                                localField : "uniteId",
                                foreignField : "_id",
                                as : "unite"
                            }
                        },{
                            $unwind : "$unite"
                        }
                    ],
                    as : "lot"
                }
            },{
                $unwind : "$lot"
            },{
                $match : {
                    "mixId" : new mongoose.Types.ObjectId(idMix)
                }
            }
        ];
        LotXmix.aggregate(agg,(err,data)=>{
            callback(err,data);            
        });
    }catch(e){
        callback(e,null);
    }
}

/**
 * Delete lot from mix
 * @param {String} idRel : id of mongodb object lotxmix
 * @param {Function} callback : function to execute on search ends with (err,ans) as resolve params
 */
function deleteLotToMix(idRel,callback){
    //console.log(idRel);
    LotXmix.deleteOne({"_id": new mongoose.Types.ObjectId(idRel)},(err,data)=>{
        callback(err,data);        
    });
}