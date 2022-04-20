const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Supply = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        code: { type: String, required: true, unique: true},
        remisionId: { type: SchemaObj.Types.ObjectId, ref: 'remision', required: [true,"La remision del producto es requerida"] },
        productId: { type: SchemaObj.Types.ObjectId, ref: 'product', required: [true,"El tipo de producto es requerido"] },
        factor: { type: Number, required: [true,"EL conteo de la unidad de medida es requerido"] },
        quantity: { type: Number, required: [true,"La cantidad es requerida"] },
        total: { type: Number, require: ["El total es requerido, por favor informe a soporte la novedad"]},
        placeId: { type: SchemaObj.Types.ObjectId, ref: 'place', required: [true,"El lugar de origen es requerido"] },
        expdate: { type: String },
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user'}
    }, {
        timestamps: true,
        collection: 'supply'
    });

Supply.plugin(pag);
Supply.plugin(uniqueValidator);

module.exports = mongObj.model('Supply', Supply);