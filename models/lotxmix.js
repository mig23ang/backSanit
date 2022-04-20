const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let Lotxmix = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        factor: { type: Number, required: true },        
        mixId: { type: SchemaObj.Types.ObjectId, ref: 'mix', required: true },
        lotId: { type: SchemaObj.Types.ObjectId, ref: 'lot', required: true},
		createdBy: { type: SchemaObj.Types.ObjectId, ref : 'user'}
    }, {
        timestamps: true,
        collection: 'lotxmix'
    });

    Lotxmix.plugin(pag);

module.exports = mongObj.model('Lotxmix', Lotxmix);