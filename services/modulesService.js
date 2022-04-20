const dbCLient = require("mongodb");
const dbConn = require("../config/database.js");
let SysModule = require('../models/sysModule');
let rolXmodule = require('../models/rolexmodule');
var mongoose = require('mongoose');

module.exports = {
    getAll,
    getList,
    getListFiltered,
    findById,
    updateModule,
    addModuleXrol,
    removeRolModule,
    getModulePrivileges
}

/**
 * get all modules register system
 * @param {*} callback 
 * @param {*} response 
 */
function getAll(callback, response) {
    let smAgg = [
        {
            $lookup: {
                from: "rolxmodule",
                let: { "moduleId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$moduleId","$$moduleId"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "role",
                            let: { "roleId" : "$roleId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$roleId"]
                                        }
                                    }
                                }
                            ],
                            as: "role"
                        }
                    }
                ],
                as : "rel"
            }
        }
    ];
    SysModule.aggregate(smAgg, function (err, data) {
        if (err) {
            callback({ "Error": err }, response);
        } else {
            callback(data,response);
        }
    });
}

/**
 * get List paginated
 * @param {*} p page
 * @param {*} l line sper page
 * @param {*} callback 
 * @param {*} response 
 */
function getList(p,l,callback,response){
    let smAgg = SysModule.aggregate([
        {
            $lookup: {
                from: "rolxmodule",
                let: { "moduleId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$moduleId","$$moduleId"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "role",
                            let: { "roleId" : "$roleId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$roleId"]
                                        }
                                    }
                                }
                            ],
                            as: "role"
                        }
                    },{
                        $unwind : "$role"
                    }
                ],
                as : "rel"
            }
        }
    ]);
    SysModule.aggregatePaginate(smAgg,{page: p, limit: l}).then((data)=>{
        callback(data, response);
    }).catch((err)=>{
        callback({ "Error": err }, response);
    });
}


/**
 * get List paginated
 * @param {*} p page
 * @param {*} l line sper page
 * @param {*} callback 
 * @param {*} response 
 */
 function getListFiltered(p,l,param,callback,response){
    let regExp = new RegExp(param,'i');
    let smAgg = SysModule.aggregate([
        {
            $lookup: {
                from: "rolxmodule",
                let: { "moduleId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$moduleId","$$moduleId"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "role",
                            let: { "roleId" : "$roleId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$roleId"]
                                        }
                                    }
                                }
                            ],
                            as: "role"
                        }
                    },{
                        $unwind : "$role"
                    }
                ],
                as : "rel"
            }
        },{
            $match : {                
                $or : [
                    {"code" : {"$regex" : regExp}},
                    {"tittle" : {"$regex" : regExp}}
                ]                
            }
        }
    ]);
    SysModule.aggregatePaginate(smAgg,{page: p, limit: l}).then((data)=>{
        callback(data, response);
    }).catch((err)=>{
        callback({ "Error": err }, response);
    });
}

/**
 * get module by id with his related roles
 * @param {*} idModule 
 * @param {*} callback 
 * @param {*} response 
 */
function findById(idModule,callback, response) {
    let smAgg = [
        {
            $match: {
                "_id": mongoose.Types.ObjectId(idModule)          
            }
        }, {
            $lookup: {
                from: "moduleXrol",
                let: { "moduleId": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$sysModuleId", "$$moduleId"]
                            }
                        }
                    }, {
                        $lookup: {
                            from: "role",
                            let: { "roleId": "$roleId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$roleId"]
                                        }
                                    }
                                }
                            ],
                            as: "role"
                        }
                    }
                ],
                as: "moduleXrol"
            }
        }
    ];
    SysModule.aggregate(smAgg, function (err, data) {
        if (err) {
            callback({ "Error": err }, response);
        } else {
            callback(data, response);
        }
    });
}

function updateModule(idModule, data, callback, response) {
    //SysModule.findOneAndUpdate();
}

/**
 * add rol to module
 * @param {*} relData 
 * @param {*} callback 
 * @param {*} response 
 */
function addModuleXrol(relData, callback, response) {
    //console.log("adding rol x module");
    rolXmodule.find({ "moduleId": mongoose.Types.ObjectId(relData.moduleId), "roleId": mongoose.Types.ObjectId(relData.roleId) }, function (err, data) {
        if (err) {
            //console.log(err);
            callback({ "Error": err }, response);
        } else {
            if (data.length > .0) {
                //console.log(err);
                callback({ "Error": "Ya existe la relacion entre el rol y el modulo" }, response);
            } else {
                
                rolXmodule.create(relData, function (err, data) {
                    if (err) {
                        //console.log(err);
                        callback({ "Error": err }, response);
                    } else {
                        callback(data, response);
                    }
                });
            }
        }
    });
}

/**
 * Delete rol from module and his permissions
 * @param {*} relId 
 * @param {*} callback 
 * @param {*} response 
 */
function removeRolModule(relId,callback,response){
    rolXmodule.deleteOne({"_id":relId},(err,data)=>{
        if (err){
            callback({"Error":err},response);
        }else{
            callback(data,response);
        }
    });
}

/**
 * Get the acces orivileges of role from module
 * @param {*} codeModule code of module
 * @param {*} rolId rol id
 * @param {*} callback 
 * @param {*} response 
 */
function getModulePrivileges(codeModule,rolId,callback,response){
    try{
        SysModule.find({"code":codeModule},(err,data)=>{
            if (err){
                callback({"Error":err},response);  
            }else{
                if (data.length>0){
                    let moduleId = data[0]["_id"];
                    rolXmodule.find({"moduleId":moduleId,"roleId":rolId},(err,data)=>{
                        if (err){
                            callback({"Error":err},response);
                        }else{
                            callback(data,response);
                        }
                    });
                }else{

                }
            }
        });
    }catch(e){
        callback({"Error":e},response);
    }
}