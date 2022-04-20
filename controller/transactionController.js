const { response } = require('express');
const express = require('express');
const poRoute = express.Router();
const poservice = require('../services/transactionService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
 function authResp(data,response){
     //console.log(response);
	response.json(data);
}

/**
 * 
 */
poRoute.get("/transactionList/:page/:limit",(req,resp,callback)=>{
    poservice.getTransactionList(req.params.page,req.params.limit,authResp,resp)
});

/**
 * 
 */
poRoute.get("/transactionListFilter/:filter/:page/:limit",(req,resp,callback) => {
    poservice.getTransactionListFiltered(req.params.filter,req.params.page,req.params.limit,authResp,resp)
});

/**
 * 
 */
poRoute.get("/transaction/:id",(req,resp,callback) => {
    poservice.getTransactionById(req.params.id,authResp,resp);
});

/**
 * 
 */
poRoute.get("/transactionModel/:id",(req,resp,callback) => {

});

poRoute.post("/getOptions/:from",(req,resp,callback) => {
    //console.log(JSON.stringify(req.body.filter));
    poservice.getOptions(req.params.from, req.body.filter, authResp, resp);
});

/**
 * 
 */
poRoute.post("/saveTransaction",(req,resp,callback) => {
    poservice.addTransaction(req.body.data,authResp,resp)
});

poRoute.delete("/deleteTransaction/:id/:target",(req,resp,callback) => {
    poservice.deleteTransaction(req.params.id,req.params.target,authResp,resp);
});

/**
 * 
 */
 poRoute.put("/updateTransaction/:id/:target",(req,resp,callback) => {
    poservice.updateTransaction(req.params.id, req.params.target, req.body.data, authResp, resp)
});

/**
 * 
 */
 poRoute.post("/saveFieldxTransaction/:target",(req,resp,callback)=>{
    poservice.addFieldToTransaction(req.params.target,req.body.data,authResp,resp)
});

poRoute.delete("/deleteFieldFromTransaction/:id/:target",(req,resp,callback)=>{
    poservice.deleteFieldTransaction(req.params.id,req.params.target,authResp,resp);
});

/**
 * 
 */
poRoute.get("/registerList/:page/:limit/:target",(req,resp,callback)=>{
    poservice.registerList(req.params.page,req.params.limit,req.params.target,authResp,resp);
});

/**
 * 
 */
 poRoute.post("/registerListFilter/:page/:limit/:target/:filter",(req,resp,callback)=>{
    poservice.registerListFilter(
        req.params.page,
        req.params.limit,        
        req.params.target,
        req.body.fields,
        req.params.filter,
        authResp,
        resp);
});

poRoute.get("/getRegister/:id/:collection",(req,resp,callback)=>{
    poservice.getRegisterTransaction(req.params.id,req.params.collection, authResp, resp);
});

poRoute.post("/getAllRegister/:target/:filter/:sort",(req,resp,callback)=>{
    poservice.findAllRegisters(
        req.params.target,
        req.body.fields,
        req.params.filter,
        req.params.sort,
        authResp,
        resp);
});

/**
 * 
 */
poRoute.post("/addRegister/:collectionTarget",(req,resp,callback)=>{
    poservice.saveRegister(req.body.data,req.params.collectionTarget,authResp,resp);
});

poRoute.put("/updateRegister/:id/:collection",(req,resp,callback)=>{
    poservice.updateRegister(req.body.data,req.params.id,req.params.collection, authResp, resp);
});

poRoute.delete("/deleteRegister/:target/:id",(req,resp,callback)=>{
    //console.log(req.params.target);
    poservice.deleteRegister(req.params.target, req.params.id, authResp, resp);
});

/**
 * 
 */
poRoute.post("/addTrigger",(req,resp,callback)=>{
    poservice.saveTrigger(req.body.data,authResp,resp);
});

/**
 * 
 */
poRoute.delete("/deleteTrigger/:idTr",(req,resp,callback)=>{
    poservice.deleteTrigger(req.params.idTr,authResp,resp);
});

/**
 * 
 */
poRoute.get("/getTransactionTriggers/:id",(req,resp,callback)=>{
    poservice.getTransactionTriggers(req.params.id,authResp,resp);
});

/**
 * 
 */
poRoute.get("/getDefinedCollections", (req,resp,callback)=>{
    poservice.getDefinedCollections(authResp,resp);
});

module.exports = poRoute;