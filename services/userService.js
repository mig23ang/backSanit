const jwt = require('jsonwebtoken');
// Get the user data template and structure
let User = require('../models/user');
const bcrypt = require('bcrypt');
const gPwd = require("password-generator");
const config = require("../config/appconfig");
const tools = require("../tools/stringTools");
const mail = require("../tools/mailerTools");
const { now } = require('mongoose');

module.exports = {
	authenticate,
	getAll,
	getAllPaginated,
	addUser,
	valideToken,
	recoverPass,
	updateUserInfo,
	updateProfilePhoto,
	getFiltered,
	getById,
	updatePassword,
	deleteUser
};

/**
 * Authenticate user 
 * @param {payload} reqBody 
 * @param {Function} callback 
 * @param {*} response 
 */
function authenticate(reqBody, callback, response) {
	//console.log("autenticating user: "+reqBody.user);
	let email = reqBody.user;

	let agg = [
		{
			$lookup: {
				from: "role", localField: "roleId", foreignField: "_id", as: "role"
			}
		}, {
			$unwind: { path: "$role", preserveNullAndEmptyArrays: true }
		}, {
			$match: {
				$and: [
					{ email: { $eq: email == "SuperAdmin" ? email : email.toLowerCase() } }, { state: { $eq: "Activo" } }
				]
			}
		}
	];
	//User.find({"email":reqBody.user,"state":"Activo"},function(error,data){
	User.aggregate(agg, function (error, data) {
		if (error) {
			//console.log("Error authenticating user: " + error);
			callback({ "Error": error }, response);
		} else {
			//console.log(data.length);

			if (data.length > 0) {
				let usrData = data[0];
				//console.log("User found: "+JSON.stringify(usrData));
				bcrypt.compare(reqBody.pwd, usrData["password"], function (err, result) {

					if (result) {
						//console.log("Credentials works");
						//Generate JWT	
						let payload = {
							"_id": usrData["_id"],
							"names": usrData["names"],
							"lastNames": usrData["lastNames"],
							"email": usrData["email"],
							"urlPhoto": usrData["urlPhoto"] ? usrData["urlPhoto"] : "./assets/img/icons/icon.png",
							"role": usrData["role"]
						};
						//console.log(payload);
						jwt.sign(payload, config.secret, { expiresIn: '3h' }, function (err, token) {
							if (err) {
								//console.log("Error at sign in "+err);
								callback({ "Error": err }, response);
							} else {
								payload["token"] = token;
								callback(payload, response);
							}
						});
					} else {
						//console.log("bad pwd Credentials");
						//callback ({"Error":"Bad credentials"},response);
						response.json({ "Error": "credenciales erroneas" });
					}
				});
			} else {
				response.json({ "Error": "credenciales erroneas" });
			}

		}
	});
}

/**
 * 
 * @param {*} usremail 
 * @param {*} callback 
 * @param {*} response 
 */
function recoverPass(usremail, callback, response) {
	//console.log("recovering: "+usremail);
	User.find({ "email": usremail.toLowerCase() }, function (error, data) {
		if (error) {
			//console.log("(recoverPass) error getting users: "+error);
			callback({ "Error": error }, response);
		} else {
			if (data.length > 0) {
				//console.log("(recoverPass) User to recover pass was found succesfully");
				let usrData = data[0];
				let payload = {
					"_id": usrData["_id"],
					"email": usrData["email"],
					"TokenType": "onlyRecoverToken"
				};
				jwt.sign(payload, config.secret, { expiresIn: '5m' }, function (err, token) {
					if (err) {
						//console.log("(recoverPass) erro getting token: "+err);
						callback({ "Error": err }, response);
					} else {

						let body = "<center><label style='font-family: arial; font-size: 1.2em'>Para reestablecer la contraseña por favor entrar al siguiente link: </label></center>";
						body += "<br><center><a style='font-size: 1.2em; text-aling: center;' href='http://localhost:4200/updatePass/" + token + "'> Recuperar mi contraseña </a></center>";

						mail.sendMail(usrData["email"], "Solicitud de recuperación de contraseña", "Reestablecer Contraseña!", body, "Si no ha solicitado el cambio, hacer caso omiso", (ans) => {
							//console.log("Ans of mailer send: ");
							//console.log(ans);
							if (ans["Error"]) {
								callback({ "Error": ans["Error"] }, response);
							} else {
								callback({ "Success": "se envió un correo con un link, vigencia de 10 minutos" }, response);
							}
						});

					}
				});
			} else {
				//console.log("(recoverPass) User was not found");
				callback({ "Error": "El email no es válido o no se encontró" }, response);
			}
		}
	});

}
/**
 * Valide if token is in well, and return the token payload
 * @param {*} tokenObj string of token without prefix Bearer
 * @param {*} callback function to resolve asynchronous request
 * @param {*} response response reference to return result
 */
function valideToken(tokenObj, callback, response) {
	console.log("validating token: " + tokenObj.token);
	try {
		jwt.verify(tokenObj.token, config.secret, function (err, decoded) {
			if (err) {
				callback({ "Error": err }, response);
			} else {
				callback(decoded, response);
			}
		});
	} catch (e) {
		callback({ "Error": e }, response);
	}
}

/**
 * 
 * @param {*} callback 
 * @param {*} response 
 */
function getAll(callback, response) {
	User.aggregate([{
		$lookup:
			{ from: "role", localField: "roleId", foreignField: "_id", as: "role" }
	}], function (error, data) {
		if (error) {
			//console.log("Error Getting All User: "+error);
			callback({ "Error Getting users": error }, response);
		} else {
			//console.log("(userController/get/) Data recolected succesfully...");
			callback(data, response);
		}
	});
}

/**
 * 
 * @param {Number} p : current page
 * @param {Number} l : lines per page
 * @param {Function} callback : respons
 * @param {*} response 
 */
async function getAllPaginated(p, l, order, callback, response) {
	//console.log("Searching with pagination (page): "+p+" (limit): "+l);

	let userAggregation = [
		{
			$match: {
				"state": {
					$ne: "Depurado"
				}
			}
		}, {
			$lookup:
			{
				from: "role", localField: "roleId", foreignField: "_id", as: "role"
			}
		}, { $unwind: "$role" }

	];
	/**
	let sQuery = await User.paginate({state:{$ne:"Depurado"}},"names lastNames state email roleId").populate(
		[
			{
				path : "roleId"
				
			}
		]
	);


	User.find({state:{$ne:"Depurado"}},"names lastNames state email roleId").populate([
		// here array is for our memory. 
		// because may need to populate multiple things
		{
			path: 'roleId',
			select: 'roleName',
			options: {
				skip: p,
				limit : l
			}
		}
	]).exec((err, data)=>{
	   if (err){
		console.log("userList error at : " + new Date().getMilliseconds());
		callback({"Error":err},response);
	   }else{
		console.log("userList collected at : " + new Date().getMilliseconds());
		console.log(data);
		callback(data,response);
	   }
	});

	//console.log(sQuery);
**/

	if (order) {
		//console.log(order);		
		try {
			let orderObj = {};
			let params = order.split(":");
			if (params[1] == "1") {
				orderObj[params[0]] = 1;
			} else {
				orderObj[params[0]] = -1;
			}
			userAggregation.push({ "$sort": orderObj });
		} catch (e) {
			//console.log(e);
		}
	}
	//console.log(JSON.stringify(userAggregation));
	let agg = User.aggregate(userAggregation);
	User.aggregatePaginate(agg, { page: p, limit: l }).then((data) => {
		console.log("userList collected at : " + now() + " :: " + new Date().getMilliseconds());
		//console.log(data);
		callback(data, response);
	}).catch((error) => {
		//console.log("Error ocurred during the recollection... " + error);
		console.log("userList error at : " + now() + " :: " + new Date().getMilliseconds());
		callback({ "Error": error }, response);
	});
	/**
	let resp = await User.aggregatePaginate(agg,{page:p,limit:l});
	**/
	//response.json(sQuery2);


}

/**
 * 
 * @param {*} usrId 
 * @param {*} callback 
 * @param {*} response 
 */
function getById(usrId, callback, response) {
	User.find({ "_id": usrId }, function (error, data) {
		if (error) {
			callback({ "Error": error }, response);
		} else {
			delete data["password"];
			callback(data, response);
		}
	});
}

/**
 * 
 * @param {*} usrData 
 * @param {*} callback 
 * @param {*} response 
 */
function addUser(usrData, callback, response) {
	// At this point generate automatic pwd and an state
	//let usrData = user;
	// generate and encrypt pwd
	//validate tha emails is unique
	User.find({ "email": usrData.email.toLowerCase() }, function (error, data) {
		//console.log("Adding user: "+data.length);
		if (error) {
			callback({ "Error": error }, response);
		} else {
			if (data.length > 0) {
				callback({ "Error": "Ya existe un usuario con el email " + usrData.email }, response);
			} else {
				mail.testHostEmail((err, data) => {
					if (err) {
						callback({ "Error": "Credenciales del host erróneas" }, response);
					} else {
						mail.testTargetEmail(usrData['email'].toLowerCase(), (err, data) => {
							if (err) {
								callback({ "Error": "El correo no existe o no se encuentra" }, response);
							} else {
								let autoGenerated = gPwd(8, false);
								//console.log("Password generated: "+autoGenerated);				
								bcrypt.hash(autoGenerated, 10, (err, hash) => {
									if (err) {
										//console.log("Error saving user: "+err);
										callback({ "Error": err }, response);
									} else {
										usrData['password'] = hash;
										usrData['state'] = "Activo";
										usrData['email'] = usrData['email'].toLowerCase();
										usrData['names'] = tools.camelCaseSpaced(usrData['names']);
										usrData['lastNames'] = tools.camelCaseSpaced(usrData['lastNames']);
										//console.log()
										User.create(usrData, function (error, data) {
											if (error) {
												//console.log("Error Adding User: " + error);
												callback({ "Error": error }, response);
												//return callback("Error Adding User: " + error);
											} else {
												//console.log("Data persisted succesfully...");
												let body = "<center><label style='font-family: arial; font-size: 1.2em'>Bienvenido al sistema: </label></center>";
												body += "<center><label style='font-family: arial; font-size: 1.2em'>Usuario: " + usrData['email'] + " </label></center>";
												body += "<center><label style='font-family: arial; font-size: 1.2em'>Credenciales: " + autoGenerated + " </label></center>";
												body += "<br><center><a style='font-size: 1.2em; text-aling: center;' href=" + config.baseUrl + "'login'> Iniciar sesión </a></center>";

												mail.sendMail(usrData["email"], "Bienvenido al sistema", "Inicie sesión!", body, "...", (ans) => {
													//console.log("Ans of mailer send: ");
													console.log(ans);
													if (ans["Error"]) {
														callback({ "Error": "Usuario creado, sin embargo no se pudo enviar las credenciales al correo: " + autoGenerated }, response);
													} else {
														callback(data, response);
													}
												});

											}
										})
									}
								});
							}
						});

					}
				});

			}
		}

	});
}

/**
 * 
 * @param {*} idUser 
 * @param {*} jsonInfo 
 * @param {*} callback 
 * @param {*} response 
 */
function updateUserInfo(idUser, jsonInfo, callback, response) {
	let user = jsonInfo["data"];
	user['names'] = tools.camelCaseSpaced(user['names']);
	user['lastNames'] = tools.camelCaseSpaced(user['lastNames']);
	//console.log(user);

	User.updateOne({ "_id": idUser }, user, function (error, data) {
		if (error) {
			//console.log("Error updating: "+error);
			callback({ "Error": error }, response);
		} else {
			//console.log("Success: " + JSON.stringify(data));
			callback(user, response);
		}
	});
}

/**
 * 
 * @param {*} idUser 
 * @param {*} urlPhoto 
 * @param {*} callback 
 * @param {*} response 
 */
function updateProfilePhoto(idUser, urlPhoto, callback, response) {
	User.updateOne({ "_id": idUser }, { "urlPhoto": urlPhoto }, function (error, data) {
		if (error) {
			//console.log("Error updating: "+error);
			callback({ "Error": error }, response);
		} else {
			//console.log("Success: " + JSON.stringify(data));
			callback({ "urlPhoto": urlPhoto }, response);
		}
	})
}

/**
 * 
 * @param {*} idUser 
 * @param {*} newPwdm 
 * @param {*} callback 
 * @param {*} response 
 */
function updatePassword(idUser, newPwdm, callback, response) {
	//generate the hash
	bcrypt.hash(newPwdm, 10, (err, hash) => {
		if (err) {
			callback({ "Error": err }, response);
		} else {
			User.updateOne({ "_id": idUser }, { "password": hash }, (err, data) => {
				if (err) {
					callback({ "Error": err }, response);
				} else {
					//console.log("Contrase�a actualizada: "+JSON.stringify(data));
					callback({ "Succes": "Credentials updated" }, response);
				}
			});
		}
	});
}

/**
 * get user with condition of search
 * @param {Number} p: page 
 * @param {Number} l: lines per page
 * @param {String} param: filter field search
 * @param {Function} callback: function to resolve asynchronous request
 * @param {Response} response 
 */
function getFiltered(p, l, param, order, callback, response) {
	let regExp = new RegExp(param, 'i');
	try {
		let userAggregation = [
			{
				$lookup:
				{
					from: "role", localField: "roleId", foreignField: "_id", as: "role"
				}
			}, { $unwind: "$role" }, {
				$match: {
					$and: [
						{
							"state": {
								$ne: "Depurado"
							}
						}, {
							$or: [
								{ "names": { "$regex": regExp } },
								{ "lastNames": { "$regex": regExp } },
								{ "email": { "$regex": regExp } },
								{ "role.roleName": { "$regex": regExp } },
								{ "state": { "$regex": regExp } }
							]
						}
					]

				}
			}

		]

		if (order) {
			//console.log(order);		
			try {
				let orderObj = {};
				let params = order.split(":");
				if (params[1] == "1") {
					orderObj[params[0]] = 1;
				} else {
					orderObj[params[0]] = -1;
				}
				userAggregation.push({ "$sort": orderObj });
			} catch (e) {
				//console.log(e);
			}
		}

		User.aggregatePaginate(User.aggregate(userAggregation), { page: p, limit: l }).then((data) => {
			//console.log("data recolected succesfully");
			callback(data, response);
		}).catch((error) => {
			//console.log("Error ocurred during the recollection... " + error);
			callback({ "Error": error }, response);
		});
	} catch (e) {
		callback({ "Error": e }, response);
	}

}

/**
 * 
 * @param {*} userId 
 * @param {*} callback 
 * @param {*} response 
 */
function deleteUser(userId, callback, response) {
	User.updateOne({ "_id": userId }, { "state": "Depurado" }, (err, data) => {
		if (err) {
			callback({ "Error": err }, response);
		} else {
			callback({ "Success": "User depured" }, response);
		}
	});
}