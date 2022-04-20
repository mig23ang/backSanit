const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let MixXref = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        mixId : {type: SchemaObj.Types.ObjectId, ref: 'mix'},
        refId : {type: SchemaObj.Types.ObjectId, ref: 'refine'},
        factor: { type: Number, required: true }, 
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user'}
    }, {
        timestamps: true,
        collection: 'mixxref'
    });

MixXref.plugin(pag);

module.exports = mongObj.model('MixXref', MixXref);