const path = require("path");
const fileSys = require("fs");
const baseFiles = "./uploads/";
const userService = require('./userService');
const orderService = require('./orderService');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    uploadFile,
    uploadImageFile,
    updateProfilePhoto,
    getFile,
    getFileWithPath,
    deteleFile,
    updateOrderPhoto
};

function authResp(data, response) {
    response.json(data);
}

function uploadFile(file, location, fn, resp) {
    //console.log("Trying to update profile photo");
    let separatedName = file.name.split(".");
    let extension = separatedName[separatedName.length - 1];
    //console.log(extension);
    let filePref = fn;
    if (!fn || fn == "") {
        filePref = uuidv4();
    }
    let fileName = location + "/" + filePref + "." + extension;
    file.mv(baseFiles + fileName, (err) => {
        if (err) {
            resp.json({ "Error": "El archivo no se pudo cargar" });
        } else {
            resp.json({ "filePath": fileName });
        }
    });
}

function updateProfilePhoto(imgFile, userId, location, resp) {
    try {
        let separatedName = imgFile.name.split(".");
        let extension = separatedName[separatedName.length - 1];
        if (extension != "png" || extension != "jpg" || extension != "bmp" || extension != "jpeg" || extension != "gif") {
            let filePref = uuidv4();
            let fileName = location + "/" + filePref + "." + extension;
            imgFile.mv(baseFiles + fileName, (err) => {
                if (err) {
                    resp.json({ "Error": "The file wasn't uploaded sera aca???????????" });
                } else {
                    userService.updateProfilePhoto(userId, fileName, authResp, resp);
                }
            });
        } else {
            resp.json({ "Error": "The image dont have valid extension" });
        }
    } catch (e) {
        resp.json({ "Error": e });
    }

}
function updateOrderPhoto(imgFile, orderId, location, resp) {
    try {
        let separatedName = imgFile.name.split(".");
        let extension = separatedName[separatedName.length - 1];
        if (extension != "png" || extension != "jpg" || extension != "bmp" || extension != "jpeg" || extension != "gif") {
            let filePref = uuidv4();
            let fileName = location + "/" + filePref + "." + extension;
            imgFile.mv(baseFiles + fileName, (err) => {
                if (err) {
                    resp.json({ "Error": "no se ha encontrado el archivo" });
                } else {
                    orderService.updateOrderPhoto(orderId, fileName, authResp, resp);
                }
            });
        } else {
            resp.json({ "Error": "The image dont have valid extension" });
        }
    } catch (e) {
        resp.json({ "Error": e });
    }

}

function uploadImageFile(file, folderLocation, resp) {
    //console.log("Trying to update profile photo");
    let separatedName = file.name.split(".");
    let extension = separatedName[separatedName.length - 1];
    //console.log(extension);
    if (extension != "png" || extension != "jpg" || extension != "bmp" || extension != "jpeg" || extension != "gif") {
        let fileName = folderLocation + "/testPhoto." + extension;
        file.mv(baseFiles + fileName, (err) => {
            if (err) {
                resp.json({ "Error": "El archivo no se pudo subir" });
            } else {
                resp.json({ "filePath": fileName });
            }
        });
    } else {
        resp.json({ "Error": "La imagen no tiene un formato válido" });
    }
}

function getFileWithPath(pth, resp) {
    //console.log(pth);
    let filePath = path.join(__dirname + "/../uploads/" + pth);
    //console.log(filePath);
    if (!fileSys.existsSync(filePath)) {
        //filePath = path.join(__dirname + "/../uploads/default.png");
        resp.json({ "Error": "El archivo no se encontró: " + filePath });
    } else {
        resp.sendFile(filePath);
    }
}

function getFile(fileName, folderDefault, resp) {
    let encodedDir = folderDefault + '/' + fileName;
    //console.log(encodedDir);
    let filePath = path.join(__dirname + "/../uploads/" + encodedDir);
    //console.log(filePath);
    if (!fileSys.existsSync(filePath)) {
        //filePath = path.join(__dirname + "/../uploads/default.png");
        resp.json({ "Error": "The file was not found" });
    } else {
        resp.sendFile(filePath);
    }
}

function deteleFile(filePath, callback) {
    console.log("deleting file");
    try {
        if (!fileSys.existsSync(filePath)) {
            callback("file wasn´t found", null);
        } else {
            fileSys.unlink(filePath, (err, data) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data);
                }
            });
        }
    } catch (e) {
        callback(e, null);
    }
}