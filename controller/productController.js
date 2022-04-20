const express = require('express');
const poRoute = express.Router();
const poservice = require('../services/productService.js');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data 
 * @param {*} response 
 */
function authResp(data,response){
	response.json(data);
}

/**
 * Get all registered products, whitout pagination and without filter
 */
poRoute.get("/productList/:page/:limit/:order", function (req, resp, callback) {
    poservice.getProductTypes(
        req.params.page,
        req.params.limit,
        req.params.order,
        authResp, 
        resp);
});

/**
 * Get all registered products, whitout pagination and without filter
 */
 poRoute.get("/productListFilter/:filter/:page/:limit/:order", function (req, resp, callback) {
    poservice.getProductTypesFilter(
        req.params.filter,
        req.params.page,
        req.params.limit,
        req.params.order,
        authResp, 
        resp);
});

/**
 * 
 */
poRoute.get("/productListRaw", function(req,resp,callback){
    poservice.getProductsRaw(authResp,resp);
});


/**
 * Get products with page and line in request params
 * @page : actual page to search
 * @lines : lines per page
 */
poRoute.get("/productListPaginated/:page/:limit", function (reqst, resp, callback) {
    let page = reqst.params.page;
    let limit = reqst.params.limit;
    poservice.getProductTypesPaginated(page,limit,authResp, resp);
});

poRoute.post("/addProduct", function (reqst, resp, callback) {
    poservice.addProduct(reqst.body.data, authResp, resp);
});

poRoute.put("/updateProduct/:id", function (reqst, resp, callback) {
    let prodData = reqst.body;
    let prodId = reqst.params.id;
    poservice.updateProduct(prodId, prodData,authResp,resp);
});

poRoute.delete("/removeProduct/:id", (req,resp,callback)=>{
    poservice.depureProduct(req.params.id,authResp,resp);
});

poRoute.get("/getProductById/:id", function (reqst, resp, callback) {
    poservice.getProductById(reqst.params.id, authResp, resp);
});

module.exports = poRoute;