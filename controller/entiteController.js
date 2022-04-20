const express = require('express');
const route = express.Router();
const service = require('../services/entiteService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
function authResp(data,response){
	response.json(data);
}

/**
 * Route to get all Entite list from collection entite
 * @param {String} page : a number indicating the pagination of list
 * @param {String} limit: a number indicating the lines per page of list
 * @param {String} order: a key value, indicating the property of sorting and the ascendance condition (1 ascendant, -1 descendant)
 */
route.get("/entiteList/:page/:limit/:order",function(req,resp,callback){
    service.getAllEntites(req.params.page, req.params.limit, req.params.order,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Route to get all Entite list with filter from collection entite
 * @param {String} page : a number indicating the pagination of list
 * @param {String} limit: a number indicating the lines per page of list
 * @param {String} order: a key value, indicating the property of sorting and the ascendance condition field:(1 ascendant, -1 descendant)
 * @param {String} filter: a string that will be used to filter in list fields
 */
route.get("/entiteListFilter/:filter/:page/:limit/:order",function(req,resp,callback){
    service.getEntitesFiltered(req.params.filter,req.params.page, req.params.limit, req.params.order,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Get entite with special filter aggregation 
 * The filter will be contained in request body as data see https://docs.mongodb.com/manual/aggregation/
 */
route.post("/entiteFiltered", function (req, resp, callback) {
    service.getEntiteFilter(req.body.data, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Get all entites clasified as contacts
 */
route.get("/getOwnersContacts", function (req, resp, callback) {
    service.getOwnerContact((err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Add an entite, the format will be as a entite.js model and will be contained in request body as data
 * the format will be as Entite.js model
 */
route.post("/addEntite",function (reqst, resp, callback) {
    service.addEntite(reqst.body.data,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Get entite providing the mongodb id of object
 * @param {String} id: id of the object allocated in mongodb
 */
route.get("/getEntiteById/:id", function (reqst, resp, callback) {
    service.getEntiteById(reqst.params.id, (err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Update an entite, the format will be as a entite.js model and will be contained in request body as data
 * the format will be as Entite.js model
 * @param {String} id : id of mongodb entite to will be updated
 */
route.put("/updateEntite/:id", function(reqst,resp,callback){
	let entData = reqst.body;
	let entId = reqst.params.id;
    service.updateEntite(entId,entData,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * set in eliminado state of entite id 
 * @param {String} Id
 */
route.delete("/removeEntite/:id", (req,resp,callback)=>{
    service.depureEntite(req.params.id,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

module.exports = route;