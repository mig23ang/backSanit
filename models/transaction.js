const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Transaction = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        name: { type: String, required: true, unique: true},
        label: { type: String, ref: 'remision', required: [true,"El nombre de la transacción es requerida"] },        
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user'}
    }, {
        timestamps: true,
        collection: 'transaction'
    });

    Transaction.plugin(pag);
    Transaction.plugin(uniqueValidator);

module.exports = mongObj.model('Transaction', Transaction);