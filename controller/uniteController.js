const express = require('express');
const route = express.Router();
const service = require('../services/lotService');

/**
 * Get all meassure unites registered
 */
route.get("/getUnites", function (req, resp, callback) {
    service.getUnites((err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

/**
 * Get unites with filter, filter must be as aggregation filter format in mongodb, see https://docs.mongodb.com/manual/aggregation/
 */
route.post("/getUnitesFiltered",(req,resp,callback)=>{
    service.getUnitesFiltered(req.body.filter,(err,data)=>{
        if (err){
            resp.json({"Error":err});
        }else{
            resp.json(data);
        }
    });
});

module.exports = route;
