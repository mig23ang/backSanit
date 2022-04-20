const express = require('express');
const moduleRoute = express.Router();
const moduleService = require('../services/modulesService');

function authResp(data, response) {
    response.json(data);
}

moduleRoute.get('/findSysModules', function (req, resp, callback) {
    moduleService.getAll(authResp,resp);
});

moduleRoute.get("/getSysModuleById/:id", function (req, resp, callback) {
    moduleService.findById(req.params.id, authResp,resp);
});

moduleRoute.get("/sysModulesList/:page/:limit", function(req,resp,callback){
    moduleService.getList(req.params.page, req.params.limit, authResp, resp);
});

moduleRoute.get("/sysModulesListFiltered/:page/:limit/:filter",(req,resp,callback)=>{
    moduleService.getListFiltered(req.params.page, req.params.limit, req.params.filter, authResp, resp);
});

moduleRoute.post("/addRolXmodule", (req, resp, callback) => {
    let relData = req.body.data;
    //console.log(req.body);
    moduleService.addModuleXrol(relData, authResp, resp);
});

moduleRoute.delete("/removeRolXmodule/:idRel",(req,resp,callback)=>{
    moduleService.removeRolModule(req.params.idRel,authResp,resp);
});

moduleRoute.get("/getSysPrivileges/:codeModule/:rolId",(req,resp,callback)=>{
    moduleService.getModulePrivileges(req.params.codeModule,req.params.rolId,authResp,resp);
});

module.exports = moduleRoute;