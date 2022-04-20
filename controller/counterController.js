const express = require('express');
const route = express.Router();
const service = require('../services/counterService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
 function authResp(data,response){
	response.json(data);
}

/**
 * Add a counter with format (contained in body as JSON as follow):
 * counter: a number indicating the start of counter
 * docName: a string indicating a code to get the counter
 * prefix: a string to concatenate with the counter number p.e LOT-//#
 * suffiX: a string to concatenate at end with counter number p.e ###LOT
 */
route.post("/addCounter", function (req, resp, callback) {
    let data = req.body;
    service.registryCounterDocNum(data, (err,data)=>{
        if (err){
            resp.json({"Error": err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Route to update counter
 * @param {String} id: Id of counter object in dataBase
 */
route.put("/updateCounter/:id", function(reqst,resp,callback){
    //service.updateEntite(entId,entData,authResp,resp);
});

module.exports = route;