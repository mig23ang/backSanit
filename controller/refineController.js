const express = require('express');
const rt = express.Router();
const srv = require('../services/refineService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
 function authResp(data, response) {
    response.json(data);
}

/**
 * Get refine list without filter
 */
rt.get("/refineList/:page/:limit/:sort", (req, resp, callback)=>{
    srv.refineList(req.params.page, req.params.limit, req.params.sort, resp);
});

/**
 * Get refine list with filter
 */
 rt.get("/refineListFilter/:page/:limit/:sort/:filter", (req, resp, callback)=>{
    srv.refineListFilter(req.params.page, req.params.limit, req.params.sort, req.params.filter, resp);
});

/**
 * Get refine by Id
 */
rt.get("/getRefineById/:id",(req,resp,callback)=>{
    srv.getRefine(req.params.id,resp);
});

/**
 * Get refine with filter mongo structure aggregation
 */
rt.post("/getRefineByFilter",(req,resp,callback)=>{
    srv.getRefineByFilter(req.body.data,resp);
});

/**
 * add refine
 */
rt.post("/addRefine",(req,resp,callback)=>{
    srv.addRefine(req.body.data,authResp,resp);
});

/**
 * pudate refination data
*/
rt.put("/updateRefine/:id",(req,resp,callback)=>{
    srv.updateRefine(req.body.data, req.params.id, authResp, resp);
});

/**
 * Delete refination passing id mongo obj
 */
rt.delete("/deleteRefine/:id", (req,resp,callback)=>{
    srv.deleteRefine(req.params.id, authResp,resp);
});

/**
 * Add mix to refination indicating the quantity
 */
rt.post("/addMixToRefine",(req,resp,callback)=>{
    srv.addMixToRefine(req.body.data, resp);
});

/**
 * Delete mix from refination process
 */
rt.delete("/removeMixFromRefine/:id",(req,resp,callback)=>{
    srv.deleteMixFromRefine(req.params.id, resp);
});

rt.get("/getRefineMixes/:idRef",(req,resp,callback)=>{
    srv.getRefineMixes(req.params.idRef,resp);
});
rt.post("/getAllRegisterFine/:target/:filter/:sort",(req,resp,callback)=>{
    srv.findAllRegistersRefine(
        req.params.target,
        req.body.fields,
        req.params.filter,
        req.params.sort,
        authResp,
        resp);
});


module.exports = rt;