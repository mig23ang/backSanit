/**
 * CONTROLLER TO ROUTE THE REQUEST OF SUPPLIES  
 * /getAllSupplies
 * /getSuppliesFiltered/:page/:lines
 * /getAllSuppliesFiltered
 * /getAllSuppliesPaginated/:page/:lines
 * /getRemisionSupplies/:page/:lim/:idRem
 * /addSupply
 * /getSupplyById/:id
 * /deleteSupply/:id
 */
const express = require('express');
const opRoute = express.Router();
const opservice = require('../services/supplyService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data 
 * @param {*} response 
 */
function authResp(data, response) {
    //Respond to response object as callback passing data as json answer
    response.json(data);
}

/**
 * Get all registered supplies, whitout pagination and without filter
 */
 opRoute.get("/getAllSupplies", function (req, resp, callback) {
     //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    opservice.getAllSupply(authResp, resp);
});

/**
 * Get supplies with filter and a page and line in request params
 * @page : actual page to search
 * @lines : lines per page
 */
opRoute.post("/getSuppliesFiltered/:page/:lines", function (req, resp, callback) {
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    //req.params.page is the page of search
    //re.params.lines is the lines per page (limit) of search
    //pass the filter send in body as a filter, must be in format of aggregation filters of mongodb
    //p.e [{$lookup} ...]
    opservice.getSupplyPaginatedFiltered(req.params.page, req.params.lines, req.body.data, authResp, resp);
});

/**
 * Get all supplies without pagination but with filter in body request
 */
opRoute.post("/getAllSuppliesFiltered", function (req, resp, callback) {
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    //pass the filter send in body as a filter, must be in format of aggregation filters of mongodb
    //p.e [{$lookup} ...]
    opservice.getSuppliesFiltered(req.body.data, authResp, resp);
});

/**
 * get all supplies with pagination in request params, but without a filter in body
 * @page : actual page to search
 * @lines : lines per page
 */
opRoute.get("/getAllSuppliesPaginated/:page/:lines", function (req, resp, callback) {
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    //req.params.page is the page of search
    //re.params.lines is the lines per page (limit) of search
    opservice.getSupplyPaginated(req.params.page, req.params.lines, authResp, resp);
});

/**
 * get all supplies filtered by remision id and paginated, all params in request params
 * @page : page to search
 * @limit : lines per page
 * @idRem : id of remision object to collect his supplies
 */
opRoute.get("/getRemisionSupplies/:page/:lim/:idRem", function (req, resp, callback) {
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    //req.params.page is the page of search
    //re.params.lines is the lines per page (limit) of search
    //req.params.idRem id of remision object to collect all supplies registered in that
    opservice.getRemisionSupplies(req.params.page,req.params.lim, req.params.idRem, authResp, resp);
});

/**
 * Route to create new supply (register)
 * @body.data : supply object to be inserted
 */
opRoute.post("/addSupply", function (reqst, resp, callback) {
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    //pass req.body.data containig the supply object to be inserted
    opservice.addSupply(reqst.body.data, authResp, resp);
});

/**
 * Route to find and return supply by id
 * @id : id of searched supply
 */
opRoute.get("/getSupplyById/:id", function (reqst, resp, callback) {
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    //pass the id of supply object to be found and returned in callback
    opservice.getSupplyById(reqst.params.id, authResp, resp);
});

/**
 * Route to find and update supply by id
 * @id : id of searched supply
 */
opRoute.put("/updateSupply/:id", function (reqst, resp, callback) {
    //collect the supply object to be updated from request body
    let remData = reqst.body;
    //collect the id of supply from request params
    let remId = reqst.params.id;
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    opservice.updateSupply(remId, remData, authResp, resp);
});

/**
 * Route to find and delete supply by id
 * @id : id of searched supply
 */
opRoute.delete("/deleteSupply/:id", function (reqst, resp, callback) {
    //collect the id of supply from request params
    let remId = reqst.params.id;
    //call service passing authResp as a Callback and resp as a response reference to respond when operacion ends
    opservice.deleteSupply(remId, authResp, resp);
});

module.exports = opRoute;