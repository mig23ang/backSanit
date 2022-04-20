const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
//Save the format in Upper o CamelCase the names of the roles
//We will define the Schema of the user type data
let Role = new SchemaObj(
    {
        _id: { type: objId, auto: true },
		roleName: {type: String, required: [true, "El nombre del rol es requerido!"], unique: true}, 
		description: { type: String},
		state: {type: String, default: "Activo"}
    }, {
        strict: true,
		timestamps: true,
        collection: 'role'
    });

Role.plugin(pag);
Role.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado!' });

module.exports = mongObj.model('Role', Role);