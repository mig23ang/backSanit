let Menu = require('../models/menu');
const config = require("../config/appconfig");
const { Mongoose } = require('mongoose');

module.exports = {
	getAll,
	getStructure
}

function getAll(callback,response){
	
}

function defaultMenu(){
	let mnu = [{ 
		"_id" : new Mongoose.types.ObjectId("60333d936797d9cd102d309b"), 
		"label" : "Usuarios", 
		"linkTo" : "", 
		"idparent" : new Mongoose.types.ObjectId("60368f846797d9cd102d30a1"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/users.png", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("60334a3f6797d9cd102d309e"), 
		"label" : "Roles", 
		"linkTo" : "", 
		"idparent" : ObjectId("60368f846797d9cd102d30a1"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/roles.png", 
		"order" : "2"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("6035e6f06797d9cd102d30a0"), 
		"label" : "Terceros", 
		"linkTo" : "", 
		"idparent" : new Mongoose.types.ObjectId("6036904d6797d9cd102d30a2"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/entites.png", 
		"order" : "3"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("60368f846797d9cd102d30a1"), 
		"label" : "Configuraciones generales", 
		"linkTo" : "", 
		"idparent" : "", 
		"level" : "0", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("6036904d6797d9cd102d30a2"), 
		"label" : "Información de base", 
		"linkTo" : "", 
		"idparent" : "", 
		"level" : "0", 
		"iconSrc" : "", 
		"order" : "2"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("603f7b95b6b8663204081168"), 
		"label" : "Lugares", 
		"linkTo" : "", 
		"idparent" : new Mongoose.types.ObjectId("6036904d6797d9cd102d30a2"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/place.png", 
		"order" : "2"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("603f7bbdb6b8663204081169"), 
		"label" : "Productos", 
		"linkTo" : "", 
		"idparent" : new Mongoose.types.ObjectId("6036904d6797d9cd102d30a2"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/prod.png", 
		"order" : "3"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("603f7c30b6b866320408116a"), 
		"label" : "Operacional", 
		"linkTo" : "", 
		"idparent" : "", 
		"level" : "0", 
		"iconSrc" : "", 
		"order" : "3"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("603fb02cb6b866320408116b"), 
		"label" : "Permisos", 
		"linkTo" : "/module-list", 
		"idparent" : new Mongoose.types.ObjectId("60334a3f6797d9cd102d309e"), 
		"level" : "2", 
		"iconSrc" : "./assets/img/icons/menu/users.png", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("60415ca80cef09da8ee98a1c"), 
		"label" : "Remisiones", 
		"linkTo" : "", 
		"idparent" : new Mongoose.types.ObjectId("603f7c30b6b866320408116a"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/inventory.png", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("6045b5cb3e6feafd769ba35c"), 
		"label" : "Lotes", 
		"linkTo" : "/lotList", 
		"idparent" : new Mongoose.types.ObjectId("603f7c30b6b866320408116a"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/summarize.png", 
		"order" : "2"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("6045b7493e6feafd769ba35d"), 
		"label" : "Ver remisiones", 
		"linkTo" : "/remissionlist", 
		"idparent" : new Mongoose.types.ObjectId("60415ca80cef09da8ee98a1c"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("60518a1f5500a35d7cc10323"), 
		"label" : "Configuraciones", 
		"linkTo" : "", 
		"idparent" : "", 
		"level" : "0", 
		"iconSrc" : "", 
		"order" : "3"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("60518b195500a35d7cc10324"), 
		"label" : "Crear campos", 
		"linkTo" : "/fields", 
		"idparent" : new Mongoose.types.ObjectId("607465e4be76661b574e0403"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("6063cd9d73fab3f70ce98253"), 
		"label" : "Ver usuarios", 
		"linkTo" : "/userlist", 
		"idparent" : new Mongoose.types.ObjectId("60333d936797d9cd102d309b"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("606ccc0335201ea97da39796"), 
		"label" : "Roles", 
		"linkTo" : "/roles-list", 
		"idparent" : new Mongoose.types.ObjectId("60334a3f6797d9cd102d309e"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("606e0fc035201ea97da39797"), 
		"label" : "Ver terceros", 
		"linkTo" : "/entites", 
		"idparent" : new Mongoose.types.ObjectId("6035e6f06797d9cd102d30a0"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("606e112135201ea97da39798"), 
		"label" : "Ver lugares", 
		"linkTo" : "/placesList", 
		"idparent" : new Mongoose.types.ObjectId("603f7b95b6b8663204081168"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("606ef8ae35201ea97da39799"), 
		"label" : "Agregar Materias", 
		"linkTo" : "/productList", 
		"idparent" : new Mongoose.types.ObjectId("603f7bbdb6b8663204081169"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("607465e4be76661b574e0403"), 
		"label" : "Configuración de actividades", 
		"linkTo" : "", 
		"idparent" : ObjectId("60518a1f5500a35d7cc10323"), 
		"level" : "1", 
		"iconSrc" : "./assets/img/icons/menu/fields.png", 
		"order" : "1"
	},
	{ 
		"_id" : new Mongoose.types.ObjectId("60746673be76661b574e0404"), 
		"label" : "Ver actividades", 
		"linkTo" : "/transactions", 
		"idparent" : new Mongoose.types.ObjectId("607465e4be76661b574e0403"), 
		"level" : "2", 
		"iconSrc" : "", 
		"order" : "1"
	}];
}

function getSquery(levels,level){
	let part = {};
	let sVar = "parentId"+level;
	let sRel = {}
	sRel[sVar] = "$_id";
	if (level==levels){
		part = {"$lookup": {"from": "menu", "let" : sRel ,	"pipeline": [{"$match": {"$expr": { "$eq": ["$idparent", "$$"+sVar] }}},{"$sort":{"order":1,"label":1}}], "as":"subLevel"}};
	}else{
		part = {"$lookup": {"from": "menu",	"let": sRel,
		"pipeline": [{"$match": {"$expr": { "$eq": ["$idparent", "$$"+sVar] }}},getSquery(levels,level+1),{"$sort":{"order":1,"label":1}}], "as":"subLevel"}};
	}
	
	return part;
}

function getStructure(level,callback,response){
	Menu.find({}).sort({"level":-1}).limit(1).exec(function(err,data){
		if (err){
			console.log("Error getting structure: "+err);
		} else {
			let maxLevel = data[0]["level"];
			let sQuery = [{$match : {$and : [{level:{$eq:level}},{idparent:{$eq:""}}]}}];
			try{
				maxLevel = parseInt(maxLevel);
				level = parseInt(level);
			}catch(err){
				maxLevel = 0
			}
			let agg = getSquery(maxLevel,(level+1));
			//console.log(JSON.stringify(agg));
			sQuery.push(agg);
			//console.log("Getting menu ->>>>>>>>>>>>>>>")
			//console.log(JSON.stringify(sQuery));
			Menu.aggregate(sQuery,function(err,data){
				if (err){
					callback({"Error":err},response);
				}else{
					callback(data,response);
				}
			});
		}
	});
}