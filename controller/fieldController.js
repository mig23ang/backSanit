const express = require('express');
const poRoute = express.Router();
const poservice = require('../services/fieldService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
function authResp(data,response){
	response.json(data);
}

/**
 * Get all structure of collections in system
 */
poRoute.get("/collectionStructure", function(req,resp,callback){
    poservice.getCollectionStrcutures(authResp,resp);
});

/**
 * get list of fields without filter, paginated
 * @param {Number} page : actual page of list
 * @param {Number} limit: actual lines per page
 */
poRoute.get("/fieldsList/:page/:limit",function(req,resp,callback){
    poservice.getFieldList(req.params.page,req.params.limit,authResp,resp);
});

/**
 * get fields brinding a string that can filter
 * @param {Number} page : actual page of list filtered
 * @param {Number} limit : actual lines per page of list
 * @param {filter} filter : a string that will be converted in a regular Expression
 */
poRoute.get("/fieldsListFilter/:page/:limit/:filter", (req,resp,callback)=>{
    poservice.getFieldListFilter(req.params.page,req.params.limit, req.params.filter,authResp,resp);
});

/**
 * Add new field
 * the customfield.js model consumed must be included in request body as data
 * @param {CustomField} body.data : a field
 */
poRoute.post("/addField",function (reqst, resp, callback) {
    poservice.addField(reqst.body.data,authResp,resp);	
});

/**
 * Delete Field only if field is not consumed by any transaction activity form
 * @param {Strgin} id : id of mongodb customfield object
 */
poRoute.delete("/deleteField/:id", (req,resp,callback)=>{
    poservice.deleteField(req.params.id,authResp,resp);
});

/**
 * Get customField
 * @param {Strgin} id : id of mongodb customfield object
 */
poRoute.get("/getFieldById/:id", function (reqst, resp, callback) {
    poservice.getFieldById(reqst.params.id, authResp, resp);
});

/**
 * Update field
 * @param {Strgin} id : id of mongodb customfield object to update
 * @param {CustomField} body.data : a field
 */
poRoute.put("/updateField/:id", function(reqst,resp,callback){
	let entData = reqst.body.data;
	let entId = reqst.params.id;
    poservice.updateField(entId,entData,authResp,resp);
});

/**
 * Get all fields brinding in a body a filter aggregation format of mongodb
 */
poRoute.post("/getFieldsFiltered", function(req,resp,callback){
    let filter = req.body.filter;
    //console.log(filter);
    poservice.getFieldsByFilter(filter,authResp,resp);
});

module.exports = poRoute;