const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Product = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        name: { type: String, required: [true,"El nombre es requerido"], unique: true },
        code: { type: String, unique: true },
        clase: { type: String, required: [true, "La clase es requerida"] },
        type: { type: String, required: [true, "El tipo es requerido"] },
        uniteId: { type: SchemaObj.Types.ObjectId,  required: [true, "La unidad es requerida"], ref: 'unite' },
        weigthxpack: { type: Number },
        unitxpack: { type: Number },
        density: { type: Number },
        state: {type: String, default: "Activo"},
        description: { type: String }
    }, {
        timestamps: true,
        collection: 'product'
    });

Product.plugin(pag);
Product.plugin(uniqueValidator, {"message":"Ya existe un registro con el valor indicado en {PATH} "});

module.exports = mongObj.model('Product', Product);