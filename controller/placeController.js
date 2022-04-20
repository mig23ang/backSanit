const express = require('express');
const poRoute = express.Router();
const poservice = require('../services/placeService');

/**
* Places ========================================================================
**/

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
 function authResp(data,response){
	response.json(data);
}

poRoute.get("/placesListRaw", function(req,resp,callback){
    poservice.getPlacesRaw(authResp, resp);
});

poRoute.get("/placesList/:page/:limit/:order", function (req, resp, callback) {
    poservice.getPlaces(req.params.page, req.params.limit, req.params.order, authResp, resp);
});

poRoute.get("/placesListFilter/:filter/:page/:limit/:order", function (req, resp, callback) {
    poservice.getPlacesFilter(req.params.filter, req.params.page,req.params.limit,  req.params.order,authResp, resp);
});

poRoute.post("/placesFiltered", function (reqst, resp, callback) {
    poservice.getPlacesFiltered(reqst.body.filter,authResp, resp);
});

poRoute.post("/addPlace", function (reqst, resp, callback) {
    poservice.addPlace(reqst.body.data, authResp, resp);
});

poRoute.put("/updatePlace/:id", function (reqst, resp, callback) {
    let placeData = reqst.body;
    let placeId = reqst.params.id;
    poservice.updatePlace(placeId, placeData, authResp, resp);
});

poRoute.get("/getPlaceById/:id", function (reqst, resp, callback) {
    poservice.getPlaceById(reqst.params.id, authResp, resp);
});

poRoute.get("/getPlacesByOwnerId/:id",(req,resp,callback)=>{
    poservice.getOwnersPlaces(req.params.id,authResp,resp);
});

poRoute.delete("/depurePlace/:id", (req,resp,callback)=>{
    poservice.depurePlace(req.params.id,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

module.exports = poRoute;