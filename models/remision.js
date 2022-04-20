const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
var mongooseIncrement = require('mongoose-increment');
var increment = mongooseIncrement(mongObj);

//We will define the Schema of the user type data
let Remision = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        receivedAt: { type: String, required:  [true,"La fecha de recepción es requerida"] },
        placeId : { type: SchemaObj.Types.ObjectId, ref: 'place', required: [true, "El lugar de recepcion es requerido"]},
        code: { type: String, unique: true },     
        description: { type: String },     
        providerId: { type: SchemaObj.Types.ObjectId, ref: 'entite', required: [true,"El proveedor es requerido"] },
        state: { type: String, default: "Pendiente" },
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user' },
        modifiedBy: { type: SchemaObj.Types.ObjectId, ref: 'user' }
    }, {
        timestamps: true,
        collection: 'remision'
    });

Remision.plugin(pag);
Remision.plugin(uniqueValidator, {"message":"El {PATH} ya esta registrado"});

Remision.plugin(increment, {
    type: String,
    modelName: 'remision',
    fieldName: 'code',
    prefix: 'LOT-',
});

module.exports = mongObj.model('Remision', Remision);