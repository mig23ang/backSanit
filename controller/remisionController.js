const express = require('express');
const opRoute = express.Router();
const opservice = require('../services/remisionService');
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
function getToken(request){
    console.log(request.header('Authorization').split(" "));
    try{
        let ans = request.header('Authorization').split(" ")[1];
        //console.log(ans);
        return {"token":ans};
    }catch(e){
        return {"token": ""};
    }    
}

/**
* Remission ========================================================================
**/
opRoute.get("/getAllRemision", function (req, resp, callback) {
    opservice.getAllRemision(authResp, resp);
});

opRoute.get("/remisionList/:page/:lim/:order", function (req, resp, callback) {
    opservice.getRemisionPaginated(req.params.page, req.params.lim, req.params.order, authResp, resp);
});


opRoute.get("/remisionListFilter/:filter/:page/:lim/:order", function (req, resp, callback) {
    opservice.getRemisionsFilter(req.params.filter,req.params.page, req.params.lim, req.params.order, authResp, resp);
});

opRoute.post("/addRemision", function (reqst, resp, callback) {
    usrService.valideToken(getToken(reqst),(data,resp)=>{
        //console.log("Callback from token validation");
        //console.log(data);
        if (data["Error"]){
            resp.json(data);
        }else{
            let remData = reqst.body.data;
            remData["createdBy"] = data["_id"];
            opservice.addRemision(reqst.body.data, authResp, resp);
        }        
    },resp);     
});

opRoute.get("/getRemisionById/:id", function (reqst, resp, callback) {
    opservice.getRemisionById(reqst.params.id, authResp, resp);
});

opRoute.put("/updateRemision/:id", function (reqst, resp, callback) {
    let remData = reqst.body.data;
    let remId = reqst.params.id;
    usrService.valideToken(getToken(reqst),(data,resp)=>{
        //console.log("Callback from token validation");
        //console.log(data);
        if (data["Error"]){
            resp.json(data);
        }else{
            remData["modifiedBy"] = data["_id"];
            opservice.updateRemision(remId, remData, authResp, resp);
        }        
    },resp);    
});

opRoute.delete("/deleteRemision/:id", (req,resp,callback)=>{
    opservice.deleteRemision(req.params.id, authResp, resp);
});

module.exports = opRoute;