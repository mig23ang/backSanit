const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let CustomField = new SchemaObj(
    {    
        label: { type: String, required: [true,"La etiqueta del campo es requerido"], unique: true },
        type: { type: String, required: [true, "el tipo es requerido"]},
        options: [{ type: String}],
        relation: { type: String},
        property: { type: String},
        aggProperty: { type: String},
        aggCondition: { type: String},
        aggFilter: { type: String},
        state : {type: String, default: "Activo"},
        relColl: {}
    }, {
		timestamps: true,
        collection: 'customfield'
    });

    CustomField.plugin(pag);
    CustomField.plugin(uniqueValidator, {"message":"El {PATH} es unico!, ya existe otro registro con este valor"});

module.exports = mongObj.model('CustomField', CustomField);