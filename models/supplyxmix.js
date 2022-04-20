const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let Supplyxmix = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        factor: { type: Number, required: true },        
        mixId: { type: SchemaObj.Types.ObjectId, ref: 'mix', required: true },
        supplyId: { type: SchemaObj.Types.ObjectId, ref: 'supply', required: true},
		createdBy: { type: SchemaObj.Types.ObjectId, ref : 'user'}
    }, {
        timestamps: true,
        collection: 'supplyxmix'
    });

    Supplyxmix.plugin(pag);

module.exports = mongObj.model('Supplyxmix', Supplyxmix);