const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Place = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        name: { type: String, unique: true },
        ownerId: { type: SchemaObj.Types.ObjectId, ref: 'entite', required : [true,"El Propietario es requerido"] },
        contactId: { type: SchemaObj.Types.ObjectId, ref: 'entite', required: [true, "El contacto / encargado es requerido"] },
        address: { type: String, required: [true, "La dirección es requerida"] },
        city: { type: String, required: [true, "La ciudad es requerida"] },
        extension: { type: String },
        capacity: { type: String },
        phone: { type: String },
        state: { type: String, default : "Activo"}
    }, {
        timestamps: true,
        collection: 'place'
    });

Place.plugin(pag);
Place.plugin(uniqueValidator, {"message":"ya se encuentra un registro con  {PATH} registrado!"});

module.exports = mongObj.model('Place', Place);