const express = require('express');
const opRoute = express.Router();
const opservice = require('../services/mixService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
function authResp(data, response) {
    response.json(data);
}

/**
 * GEt list of mixes without filter
 * @param {Number} page : actual list page
 * @param {Number} limit: actual lines per page
 * @param {String} order: field:(1 for ASC, -1 for DSC)
 */
opRoute.get("/mixList/:page/:limit/:order",(req,resp,callback)=>{
    opservice.mixList(
        req.params.page,
        req.params.limit,
        req.params.order,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * GEt list of mixes with filter
 * @param {Number} page : actual list page
 * @param {Number} limit: actual lines per page
 * @param {String} order: field:(1 for ASC, -1 for DSC)
 * @param {String} filter: expression that will be converted into regular expression 
 */
opRoute.get("/mixListFiltered/:page/:limit/:filter/:order",(req,resp,callback)=>{
    opservice.mixListFiltered(
        req.params.page,
        req.params.limit,
        req.params.order,
        req.params.filter,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * Add mix, the mix.js must be in body as data
 */
opRoute.post("/addMix",(req,resp,callback)=>{
    let data = req.body.data;
    //console.log(data);
    opservice.addMix(
        data,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * get mix brinding the id of mongodbObject
 * @param {String} id: id of mix
 */
opRoute.get("/getMix/:id",(req,resp,callback)=>{
    opservice.getMix(req.params.id,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Update mix brinding the id of mongodbObject, datamust be in body as data
 * @param {String} id: id of mix
 */
opRoute.put("/updateMix/:id",(req,resp,callback)=>{
    opservice.updateMix(
        req.params.id,
        req.body.data,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * Add supply to mix, the supplyxmix.js must be in body as data
 */
opRoute.post("/addSupplyToMix",(req,resp,callback)=>{
    opservice.addSupplyToMix(
        req.body.data,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * get all suplies mix brinding the id of mix mongodbObject
 * @param {String} id: id of mix
 */
opRoute.get("/mixSupplies/:idMix",(req,resp,callback)=>{
    opservice.getMixSupplies(req.params.idMix, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * delete supply from mix brinding the id of supplyxmix mongodb object
 * @param {String} id: id of supplyxmix
 */
opRoute.delete("/deleteSupplyFromMix/:id",(req,resp,callback)=>{
    opservice.deleteSupplyFromMix(
        req.params.id,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * Get all mixes bringind a filter that must be send in body as filter
 */
opRoute.post("/getMixesFiltered",(req,resp,callback)=>{
    opservice.getMixesFiltered(req.body.filter,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Add lot to mix, the lotxmix must be in body as data
 */
 opRoute.post("/addLotToMix",(req,resp,callback)=>{
    opservice.addLotToMix(
        req.body.data,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

/**
 * get all lots mix brinding the id of mix mongodbObject
 * @param {String} id: id of mix
 */
opRoute.get("/mixLots/:idMix",(req,resp,callback)=>{
    opservice.getMixLots(req.params.idMix,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Delete lot from mix brinding the lotxmix id mongodb object
 * @param {String} id: id of lotxmix
 */
opRoute.delete("/deleteLotFromMix/:id",(req,resp,callback)=>{
    opservice.deleteLotToMix(
        req.params.id,
        (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        }
    );
});

module.exports = opRoute;