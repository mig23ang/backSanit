const mongoose = require("mongoose");
let Ref = require("../models/refine");
let Mxr = require("../models/mixxref");
const counterService = require("./counterService");
const strTool = require("../tools/stringTools");

module.exports = {
  refineList,
  refineListFilter,
  getRefineByFilter,
  getRefine,
  addRefine,
  updateRefine,
  deleteRefine,
  addMixToRefine,
  deleteMixFromRefine,
  getRefineMixes,
};

/**
 * get refine list paginated
 * @param {*} page : actual list page
 * @param {*} limit : actual lines per page list
 * @param {*} sort : sort condicion with format field:order
 * @param {Response} response : response object to resolver request
 */
function refineList(page, limit, sort, response) {
  let agg = [
    {
      $lookup: {
        from: "productxorder",
        localField: "_id",
        foreignField: "refId",
        as: "control",
      },
    },
    {
      $unwind: { path: "$control", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "user",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "modifiedBy",
        foreignField: "_id",
        as: "modificator",
      },
    },
    {
      $unwind: {
        path: "$modificator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "unite",
        localField: "uniteId",
        foreignField: "_id",
        as: "unite",
      },
    },
    {
      $unwind: {
        path: "$unite",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        state: { $ne: "Eliminado" },
      },
    },
    {
      $group: {
        _id: "$_id",
        unite: { $first: "$unite" },
        code: { $first: "$code" },
        lotCode: { $first: "$lotCode" },
        name: { $first: "$name" },
        unites: { $first: "$unites" },
        uniteW: { $first: "$uniteW" },
        netW: { $first: "$netW" },
        grossW: { $first: "$grossW" },
        state: { $first: "$state" },
        creator: { $first: "$creator" },
        createdAt: { $first: "$createdAt" },
        modificator: { $first: "$modificator" },
        modifiedAt: { $first: "$modifiedAt" },
        consumed: { $sum: "$control.factor" },
        description: { $first: "$description" },
      },
    },
  ];

  if (sort != "" && sort) {
    //console.log(order);
    try {
      let orderObj = {};
      let params = sort.split(":");
      if (params[1] == "1") {
        orderObj[params[0]] = 1;
      } else {
        orderObj[params[0]] = -1;
      }
      agg.push({ $sort: orderObj });
    } catch (e) {
      //console.log(e);
    }
  }

  Ref.aggregatePaginate(Ref.aggregate(agg), { page: page, limit: limit })
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      //console.log(error);
      response.json({ Error: error });
    });
}

/**
 * Function to collect refine list with filter condition
 * @param {*} page : actual page of list
 * @param {*} limit : actual lines per page of list
 * @param {*} sort : actual sort condition in format field : order
 * @param {*} filter : string with filter
 * @param {Response} response : response object to resolver request
 */
function refineListFilter(page, limit, sort, filter, response) {
  let regExp = new RegExp(filter, "i");
  let agg = [
    {
      $lookup: {
        from: "productXorder",
        localField: "_id",
        foreignField: "refId",
        as: "control",
      },
    },
    {
      $unwind: { path: "$control", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "user",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "modifiedBy",
        foreignField: "_id",
        as: "modificator",
      },
    },
    {
      $unwind: {
        path: "$modificator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "unite",
        localField: "uniteId",
        foreignField: "_id",
        as: "unite",
      },
    },
    {
      $unwind: {
        path: "$unite",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $and: [
          {
            state: { $ne: "Eliminado" },
          },
          {
            $or: [
              { code: { $regex: regExp } },
              { name: { $regex: regExp } },
              { lotCode: { $regex: regExp } },
              { "unite.code": { $regex: regExp } },
              { "unite.name": { $regex: regExp } },
              { uniteW: { $regex: regExp } },
              { description: { $regex: regExp } },
            ],
          },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        unite: { $first: "$unite" },
        code: { $first: "$code" },
        lotCode: { $first: "$lotCode" },
        name: { $first: "$name" },
        unites: { $first: "$unites" },
        uniteW: { $first: "$uniteW" },
        netW: { $first: "$netW" },
        grossW: { $first: "$grossW" },
        state: { $first: "$state" },
        creator: { $first: "$creator" },
        createdAt: { $first: "$createdAt" },
        modificator: { $first: "$modificator" },
        modifiedAt: { $first: "$modifiedAt" },
        consumed: { $sum: "$control.factor" },
        description: { $first: "$description" },
      },
    },
  ];

  if (sort != "" && sort) {
    //console.log(order);
    try {
      let orderObj = {};
      let params = sort.split(":");
      if (params[1] == "1") {
        orderObj[params[0]] = 1;
      } else {
        orderObj[params[0]] = -1;
      }
      agg.push({ $sort: orderObj });
    } catch (e) {
      //console.log(e);
    }
  }

  Ref.aggregatePaginate(Ref.aggregate(agg), { page: page, limit: limit })
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      //console.log(error);
      response.json({ Error: error });
    });
}

/**
 * get refine brinding id of mongo obj
 * @param {*} idRefine
 * @param {Response} response : response object to resolver request
 */
function getRefine(idRefine, response) {
  try {
    let agg = [
      {
        $lookup: {
          from: "unite",
          localField: "uniteId",
          foreignField: "_id",
          as: "unite",
        },
      },
      {
        $unwind: {
          path: "$unite",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "modifiedBy",
          foreignField: "_id",
          as: "modificator",
        },
      },
      {
        $unwind: {
          path: "$modificator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idRefine),
        },
      },
    ];

    Ref.aggregate(agg, (err, data) => {
      if (err) {
        response.json({ Error: err });
      } else {
        response.json(data);
      }
    });
  } catch (e) {
    response.json({ Error: e });
  }
}

/**
 * get refine with predefined aggregated filter mongo structure
 * @param {Array} filter
 * @param {Response} response
 */
function getRefineByFilter(filter, response) {
  try {
    Ref.aggregate(filter, (err, data) => {
      if (err) {
        response.json({ Error: err });
      } else {
        response.json(data);
      }
    });
  } catch (e) {
    response.json({ Error: e });
  }
}

/**
 *
 * @param {*} data
 * @param {Response} response : response object to resolver request
 */
function addRefine(data, callback, response) {
  try {
    counterService.getDocNum("ref", (err, docNum) => {
      if (err) {
        //console.log(err);
        response.json({ Error: err });
      } else {
        //console.log(data);
        data["code"] = docNum;
        //console.log(lotObj);
        Ref.create(data, function (err, ans) {
          if (err) {
            callback({ Error: err }, response);
            console.log(err, "accccccccccccccc")
          } else {
            callback(ans, response);
          }
        });
      }
    });
  } catch (e) {
    response.json({ Error: e });
  }
}

/**
 * Update refine
 * @param {*} data
 * @param {*} id
 * @param {Response} response : response object to resolver request
 */
function updateRefine(data, id, callback, response) {
  //console.log("Updating: ", id);
  //console.log(data);
  Ref.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    data,
    function (err, ans) {
      if (err) {
        callback({ Error: err }, response);
      } else {
        callback(ans, response);
      }
    }
  );
}

/**
 *
 * @param {*} id
 * @param {Response} response : response object to resolver request
 */
function deleteRefine(id, callback, response) {
  updateRefine(id, { state: "Eliminado" }, callback, response);
}

/**
 * Add mix to refine indicanting factor
 * @param {*} relData
 * @param {Response} response : response object to resolver request
 */
function addMixToRefine(relData, response) {
  Mxr.create(relData, function (err, resp) {
    if (err) {
      response.json({ Error: err });
    } else {
      response.json(resp);
    }
  });
}

function deleteMixFromRefine(idRel, response) {
  try {
    Mxr.findByIdAndRemove({ _id: idRel }, (err, data) => {
      if (err) {
        response.json({ Error: err });
      } else {
        response.json(data);
      }
    });
  } catch (e) {
    response.json({ Error: e });
  }
}

/**
 * Get list of mixes registered on refination process
 * @param {String} idRefine : id of refination object in mongodb
 * @param {Response} response : response object to resolver request
 */
function getRefineMixes(idRefine, response) {
  let agg = [
    {
      $lookup: {
        from: "mix",
        let: { mixId: "$mixId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$mixId"],
              },
            },
          },
          {
            $lookup: {
              from: "unite",
              localField: "uniteId",
              foreignField: "_id",
              as: "unite",
            },
          },
          {
            $unwind: { path: "$unite", preserveNullAndEmptyArrays: true },
          },
          {
            $lookup: {
              from: "supplyxmix",
              let: { mixId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$mixId", "$$mixId"],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "supply",
                    let: { supplyId: "$supplyId" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$_id", "$$supplyId"],
                          },
                        },
                      },
                      {
                        $lookup: {
                          from: "product",
                          localField: "productId",
                          foreignField: "_id",
                          as: "product",
                        },
                      },
                      {
                        $unwind: "$product",
                      },
                      {
                        $lookup: {
                          from: "remision",
                          localField: "remisionId",
                          foreignField: "_id",
                          as: "remision",
                        },
                      },
                      {
                        $unwind: "$remision",
                      },
                    ],
                    as: "supply",
                  },
                },
                {
                  $unwind: "$supply",
                },
              ],
              as: "supplyRel",
            },
          },
          {
            $lookup: {
              from: "lotxmix",
              let: { mixId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$mixId", "$$mixId"],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "lot",
                    let: { lotId: "$lotId" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$_id", "$$lotId"],
                          },
                        },
                      },
                      {
                        $lookup: {
                          from: "supplyxlot",
                          let: { lotId: "$_id" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $eq: ["$lotId", "$$lotId"],
                                },
                              },
                            },
                            {
                              $lookup: {
                                from: "supply",
                                let: { supplyId: "$supplyId" },
                                pipeline: [
                                  {
                                    $match: {
                                      $expr: {
                                        $eq: ["$_id", "$$supplyId"],
                                      },
                                    },
                                  },
                                  {
                                    $lookup: {
                                      from: "product",
                                      localField: "productId",
                                      foreignField: "_id",
                                      as: "product",
                                    },
                                  },
                                  {
                                    $unwind: "$product",
                                  },
                                  {
                                    $lookup: {
                                      from: "remision",
                                      localField: "remisionId",
                                      foreignField: "_id",
                                      as: "remision",
                                    },
                                  },
                                  {
                                    $unwind: "$remision",
                                  },
                                ],
                                as: "supply",
                              },
                            },
                            {
                              $unwind: "$supply",
                            },
                          ],
                          as: "rel",
                        },
                      },
                    ],
                    as: "lot",
                  },
                },
                {
                  $unwind: "$lot",
                },
              ],
              as: "lotRel",
            },
          },
        ],
        as: "mix",
      },
    },
    {
      $unwind: { path: "$mix", preserveNullAndEmptyArrays: true },
    },
    {
      $match: {
        refId: new mongoose.Types.ObjectId(idRefine),
      },
    },
  ];
  //console.log(JSON.stringify(agg));
  Mxr.aggregate(agg, (err, data) => {
    if (err) {
      response.json({ Error: err });
    } else {
      response.json(data);
    }
  });
  
}
