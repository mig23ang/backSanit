const express = require('express');
const fileUp = require('express-fileupload');
const fileRoute = express.Router();
const fileService = require('../services/fileService');
var cors = require('cors');

fileRoute.use(fileUp());

fileRoute.post("/uploadImage/:folder", function (reqst, resp, callback) {
    let file = reqst.files.imgUpload;
    let folder = reqst.params.folder;
    //console.log("Calling route to post profile photo");
    //define the name of file (only png,jpg,bmp,jpeg,gif)
    if (!file || Object.keys(reqst.files).length == 0) {
        resp.json({ "Error": "File was not send!!" });
    } else {
        fileService.uploadImageFile(file, folder, resp);
    }
});

fileRoute.post("/updateProfilePhoto/:userId/:folderLocation", function (req, resp, callback) {
    let usrId = req.params.userId;
    let folder = req.params.folderLocation;
    let fileImg = req.files.profilePhoto;
    //console.log(fileImg);
    if (!fileImg || Object.keys(req.files).length == 0) {
        resp.json({ "Error": "Photo was not send" });
    } else {
        fileService.updateProfilePhoto(fileImg, usrId, folder, resp);
    }
});
fileRoute.post("/updateOrderPhoto/:orderId/:folderLocation", function (req, resp, callback) {
    let orderId = req.params.orderId;
    let folder = req.params.folderLocation;
    let fileImg = req.files.orderPhoto;
    //console.log(fileImg);
    if (!fileImg || Object.keys(req.files).length == 0) {
        resp.json({ "Error": "Photo was not send aca deberia estar enviando la ruta pedida" });
    } else {
        fileService.updateProfilePhoto(fileImg, orderId, folder, resp);
    }
});

fileRoute.get("/getFile/:folderLocation/:fileName", cors(),function (req, resp, callback) {
    let folderLoc = req.params.folderLocation;
    let fileName = req.params.fileName;
    fileService.getFile(fileName,folderLoc, resp);
});

fileRoute.post("/getFileWithPath",cors(),(req,resp,callback)=>{
    let obj = req.body.data;
    fileService.getFileWithPath(obj,resp);
});

fileRoute.post("/uploadFile", (req,resp,callback)=>{
    let file = req.files.file;
    let location = req.body.location;
    let fileName = req.body.fileName;
    fileService.uploadFile(file,location,fileName,resp);
   
});

module.exports = fileRoute;