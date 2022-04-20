const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Entite = new SchemaObj(
    {
        _id: { type: objId, auto: true },		
        names: { type: String, required: [true, "Los nombres son requeridos"]},       
        idnumber: { type: String, required: [true,"El documento de identidad es requerido"]},
        iddigit: { type: Number, required: [true, "El tipo de documento es requerido"]},
        address: { type: String, required: [true, "La dirección es requerida"]},
        city: { type: String, required: [true, "La ciudad es requerida"]},
        phone: {type: String},
        email: { type: String},
        entType: { type: String, required: [true, "El tipo de tercero es requerido"]},
		state: {type: String, default: "Activo"}
    }, {
		timestamps: true,
        collection: 'entite'
    });

Entite.plugin(pag);
Entite.plugin(uniqueValidator, {"message":"El {PATH} es unico!, ya existe otro registro con este valor"});

module.exports = mongObj.model('Entite', Entite);