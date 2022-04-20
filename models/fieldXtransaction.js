const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let FieldxTransaction = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        transactionId: { type: SchemaObj.Types.ObjectId, ref: 'sysmodule', required: true },
        fieldId: { type: SchemaObj.Types.ObjectId, ref: 'role', required: true },
        required: { type: Boolean},
        updatable: { type: Boolean},
        showable: { type: Boolean},
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user' },
        modifiedBy: { type: SchemaObj.Types.ObjectId, ref: 'user' }
    }, {
        timestamps: true,
        collection: 'fieldxtransaction'
    });

    FieldxTransaction.plugin(pag);

module.exports = mongObj.model('FieldxTransaction', FieldxTransaction);