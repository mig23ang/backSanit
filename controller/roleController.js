const express = require('express');
const roleRoute = express.Router();
const roleService = require('../services/roleService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
function authResp(data,response){
	response.json(data);
}

/**
 * get rol by id
 */
roleRoute.get("/getRoleById/:id", function (req, resp, callback) {
    roleService.getRolById(req.params.id, authResp, resp);
});

/**
 * find all roles filtered
 */
roleRoute.get("/roleListFiltered/:filter/:page/:limit/:order",function(req,resp,callback){
	roleService.getFiltered(req.params.filter,req.params.page,req.params.limit,req.params.order,authResp,resp);
});

/**
 * find roles
 */
 roleRoute.get("/roleList/:page/:limit/:order",function(req,resp,callback){
	roleService.getAll(
        req.params.page,
        req.params.limit, 
        req.params.order,
        authResp,
        resp);
});

/**
 * find all roles
 */
roleRoute.get("/roleListRaw",function(req,resp,callback){
    roleService.getAllRaw(authResp,resp);
});

roleRoute.post("/addRol",function (reqst, resp, callback) {
    roleService.addRol(reqst.body.roleData,authResp,resp);	
});

roleRoute.get("/getRol/:id", function(reqst,resp,callback){
    roleService.getRolById(reqst.params.id,authResp,resp);
});

roleRoute.put("/updateRol/:id", function(reqst,resp,callback){
	let rolData = reqst.body.roleData;
	let rolId = reqst.params.id;
    //console.log(rolData);
	roleService.updateRol(rolId,rolData,authResp,resp);
});

roleRoute.get("/getRolesAvailables/:idModule", (req, resp, callback) => {
    let idModule = req.params.idModule;
    roleService.getRolesAvailables(idModule, authResp, resp);
});

roleRoute.get("/getRolesByModule/:idModule/:page/:limit", (req, resp, callback) => {
    let moduleId = req.params.idModule;
    roleService.getRolesByModule(moduleId, req.params.page, req.params.limit, authResp, resp);
});
module.exports = roleRoute;