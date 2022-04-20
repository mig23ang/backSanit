const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let ProductXorder = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        orderId: { type: SchemaObj.Types.ObjectId, ref: 'order', required: true },
        refId: { type: SchemaObj.Types.ObjectId, ref: 'refine', required: true },
        factor: { type: Number},
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user' }
    }, {
        timestamps: true,
        collection: 'productxorder'
    });

    ProductXorder.plugin(pag);

module.exports = mongObj.model('ProductXorder', ProductXorder);