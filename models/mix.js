const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Mix = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        code: { type: String, unique: true },
        lotCode : { type: String},
        initialW: { type: String},
        netW: {type: Number},
        grossW: {type: Number},
        uniteId: { type: SchemaObj.Types.ObjectId, ref: 'unite', required : [true,"La unidad de la mezcla es requerida"]},
        description: {type: String},
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user'},
        modifiedBy: { type: SchemaObj.Types.ObjectId, ref: 'user'},
        state: { type: String, default : "Registrado"}
    }, {
        timestamps: true,
        collection: 'mix'
    });

Mix.plugin(pag);
Mix.plugin(uniqueValidator, {"message":"ya se encuentra un registro con  {PATH} registrado!"});

module.exports = mongObj.model('Mix', Mix);