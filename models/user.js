const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
var Role = require("./role");
//
//We will define the Schema of the user type data
let User = new SchemaObj(
    {
        //id podria quitarse
        _id: { type: objId, auto: true },
		email: {type: String, required: [true,"El email es requerido"], unique: true}, 
        names: { type: String, required: [true, "El Nombre es requerido"]},
        lastNames: { type: String, required: [true, "El Apellido es requerido"] },
        idnumber: { type: String, required: [true, "El documento de identidad es requerido"], unique: true },
        idType: { type: Number, required: [true, "El Tipo de documento es requerido"]},
		birthday: {type: Date},
        phone: {type: Number},
        roleId: { type: SchemaObj.Types.ObjectId, ref: 'Role', required: [true, "El Rol del usuario es requerido"]},
        urlPhoto: {type: String},
		password: {type: String},
		state: {type: String, default: "Activo"},
        createdBy : {type: SchemaObj.Types.ObjectId, ref: 'user'}		
    }, {
        strict: true,
		timestamps: true,
        collection: 'user'
    });

User.plugin(pag);
User.plugin(uniqueValidator, {message: 'El {PATH} ya esta registrado!'});

module.exports = mongObj.model('User', User);