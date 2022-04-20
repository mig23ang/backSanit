const express = require('express');
const opRoute = express.Router();
const opservice = require('../services/lotService');
const usrService = require('../services/userService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
function authResp(data, response) {
    response.json(data);
}

/**
 * function to get Token from request and get the credentials
 * @param {*} request : request object with authorization token
 */
 function executeSecure(request,response,callback){
    try{
        let ans = request.header('Authorization').split(" ")[1];
        //console.log(ans);
        usrService.valideToken({"token":ans},(data,resp)=>{
            //console.log(data);
            if (data["Error"]){
                resp.json(data);
            }else{
                callback(data);
            }
        },response);
        
    }catch(e){
        response.json({"Error":e});
    }    
}

/**
 * get lots filtered
 * filter must be aggreation filter mongo and be included in body as data
 */
opRoute.post("/getLotsFiltered",(req,resp,callback)=>{
    opservice.getLotsFiltered(req.body.data,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Get all registered lots, whitout pagination and without filter
 */
opRoute.get("/getAllLots", function (req, resp, callback) {
    opservice.getAllLots((err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Get lots with filter and a page and line in request params
 * @page : actual page to search
 * @lines : lines per page
 * @filter : send in request body, must be a filter of mongo's aggregation format p.e [{$lookup: {} ...}]
 */
opRoute.post("/getAllLotsFiltered/:page/:lines", function (req, resp, callback) {
    opservice.getLotPaginatedFiltered(req.params.page, req.params.lines, req.body.data, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * get all lots with pagination in request params, but without a filter in body
 * @page : actual page to search
 * @lines : lines per page
 */
 opRoute.get("/getAllSLotsPaginatedFiltered/:page/:lines/:filter/:order", function (req, resp, callback) {
    opservice.getLotListFilter(req.params.page, req.params.lines, req.params.filter, req.params.order, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * get all lots with pagination in request params, but without a filter in body
 * @page : actual page to search
 * @lines : lines per page
 */
opRoute.get("/getAllSLotsPaginated/:page/:lines/:order", function (req, resp, callback) {
    opservice.getLotPaginated(req.params.page, req.params.lines, req.params.order, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Route to create new lot (register)
 * @body.data : lot object to be inserted
 */
opRoute.post("/addLot", function (reqst, resp, callback) {
    let lotData = reqst.body.data;
    executeSecure(reqst,resp,(data)=>{
        //console.log("Callbacking the result");
        //console.log(data);
        lotData["createdBy"] = data["_id"];
        opservice.addLot(lotData, (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        });
    });    
});

opRoute.get("/getLotById/:id", function (reqst, resp, callback) {
    opservice.getLotById(reqst.params.id,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

opRoute.put("/updateLot/:id", function (reqst, resp, callback) {
    let lotData = reqst.body.data;
    let lotId = reqst.params.id;
    executeSecure(reqst,resp,(data)=>{
        //console.log("Callbacking the result");
        //console.log(data);
        lotData["modifiedBy"] = data["_id"];
        opservice.updateLot(lotId, lotData, (err,data)=>{
            if (err){
                resp.json({"Error":err});
            }else{
                resp.json(data);
            }
        });
    });
    
});

//SupplyXLot ====================================================================================================================================
opRoute.post("/addSupplyXlot", function (req, resp, callback) {
    opservice.addSupplyXlot(req.body.data,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

opRoute.put("/updateSupplXlot/:idSxL", function(req,resp,callback){
    opservice.updateSupplyXlot(req.body.data, req.params.idSxl, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

opRoute.get("/getSupplyXlotPaginated/:idLot/:page/:limit", function (req, resp, callback) {
    opservice.getSupplyByLot(req.params.idLot, req.params.page, req.params.limit, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

opRoute.get("/getSupplyXlot/:idLot", (req,resp,callback)=>{
    opservice.getSupplyByLot(req.params.idLot, null,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

opRoute.post("/getSuppliesExcluded", (req,resp,callback)=>{
    let exclusion = req.body.excluded;
    opservice.getAvailableSupplies(exclusion,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

opRoute.delete("/removeSupplyXlot/:idRel", (req,resp,callback)=>{
    opservice.removeSupplyFromLot(req.params.idRel,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});
module.exports = opRoute;