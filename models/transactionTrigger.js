const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
//
//We will define the Schema of the user type data
let Trigger = new SchemaObj(
    {
        //id podria quitarse
        _id: { type: objId, auto: true },
		transactionId: {type: SchemaObj.Types.ObjectId, ref: 'transaction', required: [true,"La transacción es requerida"]}, 
        fieldId: { type:  SchemaObj.Types.ObjectId, ref: 'customfield'},
        trigger: { type: String, required: [true, "El tipo de acción es requerido"]},
        action: { type: String, required: [true, "la acción es requerida"] },
        target: { type: String, required: [true, "la clase objetivo es requerida"]},
        fieldTarget: { type: String, required: [true, "El campo es requerido"]},
        value: { type: String, required: [true, "El valor del trigger es requerido"]},		
		state: {type: String, default: "Activo"},
        createdBy : {type: SchemaObj.Types.ObjectId, ref: 'user'}		
    }, {
        strict: true,
		timestamps: true,
        collection: 'trigger'
    });

    Trigger.plugin(pag);

module.exports = mongObj.model('Trigger', Trigger);