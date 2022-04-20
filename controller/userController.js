const express = require('express');
const { now } = require('mongoose');
const userRoute = express.Router();
const userService = require('../services/userService');

/**
 * Function to resolve request, used as callback of all db transaction answer, passed as parameter to be executed
 * @param {*} data : object to send a json
 * @param {*} response : reference response object to resolve http request
 */
function authResp(data, response) {
    
	response.json(data);
}

/**
 * Get all users with pagination
 */
userRoute.get("/usersList/:start/:end/:order", function (req, resp, callback) {
    console.log("Getting userList at : " + now() + " :: " + new Date().getMilliseconds());
	let startPagination = 2;
	let endPagination = 1;
	try{
        startPagination = Number(req.params.start) || startPagination;
        endPagination = Number(req.params.end) || endPagination;
	}catch(err){
		console.log(err);
    }
    if (endPagination < 0) {
        userService.getAll(authResp,resp);
    } else {
        userService.getAllPaginated(startPagination, endPagination, req.params.order, authResp, resp);
    }
	
});

/**
 * get users with search of parameter (default list) and pagination
 */
 userRoute.get("/userListFiltered/:page/:limit/:parameter/:order", function(reqst,resp,callback){
	userService.getFiltered(
        reqst.params.page,
        reqst.params.limit,
        reqst.params.parameter, 
        reqst.params.order,
        authResp,
        resp);
});

/**
 * Add a user
 */
userRoute.post("/addUser",function (reqst, resp, callback) {
	userService.addUser(reqst.body.data,authResp,resp);	
});

/**
 * Route to authenticate user (public)
 * **/
userRoute.post("/auth",function(reqst,resp,callback){
	userService.authenticate(reqst.body,authResp,resp);
});

/**
 * Route to valide token (public)
 */
userRoute.post("/valideToken",function(reqst,resp,callback){
	userService.valideToken(reqst.body,authResp,resp);
});

/**
 * Route to find and return a user by id object in mongo
 */
userRoute.get("/getUser/:id", function(reqst,resp,callback){
	userService.getById(reqst.params.id,authResp,resp);
});


userRoute.put("/updateUser/:id", function(reqst,resp,callback){
	let userData = reqst.body;
	let userId = reqst.params.id;
	userService.updateUserInfo(userId,userData,authResp,resp);
});

userRoute.post("/recoverPass", function (reqst, resp, callback) {
	let user = reqst.body.email;
	userService.recoverPass(user,authResp,resp);
});

userRoute.put('/updatePwd/:id', function (req, resp, callback) {
    console.log("Updating pwd");
    let newPwd = req.body.newPassWord;
    /**
    validar que la contrase�a sea distinta
    **/
    let usrId = req.params.id;
    userService.updatePassword(usrId, newPwd, authResp, resp);
});

userRoute.delete("/depureUser/:id", function (req, resp, callback) {
    userService.deleteUser(req.params.id, authResp, resp);
});

module.exports = userRoute;