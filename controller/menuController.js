const express = require('express');
const menuRoute = express.Router();
const dbCLient = require("mongodb");
const dbConn = require("../config/database.js");
const menuService = require('../services/menuService');

function authResp(data,response){
	response.json(data);
}

menuRoute.get("/menuList",function(req,resp,callback){
	try{
		dbCLient.MongoClient.connect(dbConn.strCon, function(err, db) {
			try{
				 db.collection("menu").find({}).toArray(function(err,res){
					if (err){
						console.log("Error At Backend/controller/menuController[10]: from call to db " + err);
						resp.json({"Error":err});
					}else{
						//console.log("data recolected Type: "+typeof(res));
						resp.json(res);
					}
					db.close();
				});
			}catch(err){
				console.log("Error At Backend/controller/menuController[10] from return data found: " + err);
				resp.json({"Error":err});
			}
		});		
	}catch(err){
		console.log("Error At Backend/controller/menuController [8] " + err);
		resp.json({"Error":err});
	}

});

menuRoute.get("/menuStructure",function(req,resp,callback){
	//console.log("Getting structure");
	menuService.getStructure("0",authResp,resp);

});

menuRoute.put("/addMenu",function(req,resp,callback){
	
	try{
		 dbCLient.MongoClient.connect(dbConn.strCon, function(err, db) {
			try{
				 db.collection("menu").insertOne(req.body.data,
					function(err,res){
						if (err){
							console.log("Error At Backend/controller/menuController insertOne "+err);
							resp.json({"Error":err});
						}else{
							//console.log("Data posted ");
							resp.json({"success":""});
						}
						db.close();
					}
				);
			}catch(err){
				console.log("Error At Backend/controller/menuController [36] "+err);
				resp.json({"Error":err});;
			}
		});
	}catch(err){
		console.log("Error At Backend/controller/menuController [34] "+err);
		resp.json({"Error":err});
	}
});

module.exports = menuRoute;