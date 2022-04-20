const express = require('express');
const poRoute = express.Router();
const poservice = require('../services/processService.js');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data 
 * @param {*} response 
 */
 function authResp(data,response){
	response.json(data);
}

poRoute.get("/getTransactionStructure/:id",(req,resp,callback)=>{
    poservice.getTransactionStructure(req.params.id,authResp,resp);
});

module.exports = poRoute;