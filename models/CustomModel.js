const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let CustomModel = new SchemaObj(
    {		
        name: { type: String, required: [true, "el nombre de la colección es requerido"]},       
        label: { type: String, required: [true,"La etiqueta de la coleccion es requerida"], unique: true },
        fields: { type: Array, required: [true, "los campos son requeridos"]},
		state: {type: String, default: "Activo"}
    }, {
		timestamps: true,
        collection: 'custommodel'
    });

    CustomModel.plugin(pag);
    CustomModel.plugin(uniqueValidator, {"message":"El {PATH} es unico!, ya existe otro registro con este valor"});

module.exports = mongObj.model('CustomModel', CustomModel);