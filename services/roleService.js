// Get the user data template and structure
let Role = require("../models/role");
let Rel = require("../models/rolexmodule");
const config = require("../config/appconfig");
const strTool = require("../tools/stringTools");
var mongoose = require("mongoose");

module.exports = {
  getAll,
  getAllRaw,
  getFiltered,
  addRol,
  updateRol,
  getRolById,
  getRolesAvailables,
  getRolesByModule,
};

function getAllRaw(callback, response) {
  Role.find({ state: { $nin: ["Inactivo", "Depurado"] } }, (error, data) => {
    if (error) {
      //console.log("Error Getting All Roles: "+error);
      callback({ Error: error }, response);
    } else {
      //console.log("(userController/get/) Data recolected succesfully...");
      callback(data, response);
    }
  });
}

/**
 * find rol by Id
 * @param {Number} idRol
 * @param {Function} callback
 * @param {Response} response
 */
function getRolById(idRol, callback, response) {
  Role.find({ _id: idRol }, function (error, data) {
    if (error) {
      //console.log("Error Getting All Roles: "+error);
      callback({ Error: error }, response);
    } else {
      //console.log("(userController/get/) Data recolected succesfully...");
      callback(data, response);
    }
  });
}

/**
 * get all roles
 * @param {Number} p
 * @param {Number} l
 * @param {Function} callback
 * @param {Response} response
 */
function getAll(p, l, order, callback, response) {
  let roleAggregation = [
    {
      $match: {
        state: {
          $ne: "Depurado",
        },
      },
    },
  ];

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
      roleAggregation.push({ $sort: orderObj });
    } catch (e) {
      //console.log(e);
    }
  }

  let agg = Role.aggregate(roleAggregation);

  Role.aggregatePaginate(agg, { page: p, limit: l })
    .then((data) => {
      callback(data, response);
    })
    .catch((error) => {
      callback({ Error: error }, response);
    });
}

/**
 * get all roles
 *  * @param {String} filter
 * @param {Number} p
 * @param {Number} l
 * @param {Function} callback
 * @param {Response} response
 */
function getFiltered(filter, p, l, order, callback, response) {
  try {
    let regExp = new RegExp(filter, "i");
    let roleAggregation = [
      {
        $match: {
          $and: [
            {
              state: {
                $ne: "Depurado",
              },
            },
            {
              $or: [
                { roleName: { $regex: regExp } },
                { description: { $regex: regExp } },
                { state: { $regex: regExp } },
              ],
            },
          ],
        },
      },
    ];

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
        roleAggregation.push({ $sort: orderObj });
      } catch (e) {
        //console.log(e);
      }
    }

    let agg = Role.aggregate(roleAggregation);

    Role.aggregatePaginate(agg, { page: p, limit: l })
      .then((data) => {
        callback(data, response);
      })
      .catch((error) => {
        callback({ Error: error }, response);
      });
  } catch (e) {
    callback({ Error: e }, response);
  }
}

function addRol(rolData, callback, response) {
  //test if request is arriving
  let rolFormated = strTool.camelCaseSpaced(rolData.roleName);
  try {
    Role.find({ roleName: rolFormated }, function (error, data) {
      //console.log("Adding user: "+data.length);
      if (error) {
      } else {
        rolData.roleName = rolFormated;
        if (data.length > 0) {
          //console.log("User email is in use and must be unique " + data);
          callback(
            { Error: "Ya existe un rol con el nombre especificado" },
            response
          );
        } else {
          Role.create(rolData, function (error, data) {
            if (error) {
              //console.log("Error Adding User: " + error);
              callback({ Error: error }, response);
              //return callback("Error Adding User: " + error);
            } else {
              //console.log("Data persisted succesfully...");
              callback(data, response);
            }
          });
        }
      }
    });
  } catch (err) {
    callback({ Error: err }, response);
  }
}

function updateRol(idRole, jsonInfo, callback, response) {
  console.log(idRole);
  Role.updateOne({ _id: idRole }, jsonInfo, function (error, data) {
    if (error) {
      //console.log("Error updating: "+error);
      callback({ Error: error }, response);
    } else {
      //console.log(jsonInfo);
      //console.log(data);
      callback(jsonInfo, response);
    }
  });
}

function getRolesAvailables(idCurrentModule, callback, response) {
  // console.log("Getting rel of: " + idCurrentModule);
  try {
    Rel.find({ moduleId: idCurrentModule })
      .select("roleId -_id")
      .exec((err, data) => {
        if (err) {
          callback({ Error: err }, response);
        } else {
          let arrId = [];

          for (i = 0; i < data.length; i++) {
            arrId.push(data[i]["roleId"]);
          }

          console.log(arrId);

          Role.find({ _id: { $nin: arrId } }, (err, data) => {
            if (err) {
              callback({ Error: err }, response);
            } else {
              callback(data, response);
            }
          });
        }
      });
  } catch (e) {
    callback({ Error: e }, response);
  }
}

function getRolesByModule(idModule, p, l, callback, response) {
  try {
    //console.log("gettinf rel of :" +idModule);
    let aggregation = Rel.aggregate([
      {
        $lookup: {
          from: "role",
          let: { roleId: "$roleId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$roleId"],
                },
              },
            },
          ],
          as: "role",
        },
      },
      {
        $unwind: "$role",
      },
      {
        $match: {
          moduleId: {
            $eq: new mongoose.Types.ObjectId(idModule),
          },
        },
      },
    ]);
    Rel.aggregatePaginate(aggregation, { page: p, limit: l })
      .then((data) => {
        callback(data, response);
        console.log(data, "aca los roles")
      })
      .catch((err) => {
        callback({ Error: err }, response);
      });
  } catch (e) {
    callback({ Error: e }, response);
  }
}
