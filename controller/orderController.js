const express = require('express');
const poRoute = express.Router();
const poservice = require('../services/orderService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
 function authResp(data,response){
	response.json(data);
}

poRoute.get("/orderListRaw", function(req,resp,callback){
    poservice.orderListRaw(authResp, resp);
});

poRoute.get("/orderList/:page/:limit/:order", function (req, resp, callback) {
    poservice.orderList(req.params.page, req.params.limit, req.params.order, authResp, resp);
});

poRoute.get("/orderListFilter/:page/:limit/:filter/:order", function (req, resp, callback) {
    poservice.orderListFilter(req.params.page, req.params.limit, req.params.filter, req.params.order, authResp, resp);
});

poRoute.post("/addOrder",(req,resp,callback)=>{
    poservice.addOrder(req.body.data, authResp, resp);
});

poRoute.put("/updateOrder/:id",(req,resp,callback)=>{
    poservice.updateOrder(req.params.id,req.body.data, authResp, resp);
});

poRoute.get("/getOrder/:id",(req,resp,callback)=>{
    poservice.getOrder(req.params.id,authResp,resp);
});

poRoute.get("/getOrderProducts/:id",(req,resp,callback)=>{
    poservice.getOrderProducts(req.params.id,authResp,resp);
});

poRoute.post("/addProductOrder",(req,resp,callback)=>{
    poservice.addProductToOrder(req.body.data,authResp,resp);
});

poRoute.delete("/deleteProductFromOrder/:id",(req,resp,callback)=>{
    poservice.deleteProductFromOrder(req.params.id,authResp,resp);
});

module.exports = poRoute;