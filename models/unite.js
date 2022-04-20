const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let Unite = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        name: { type: String },
        code: { type: String },
        type: { type: String }    

    }, {
        timestamps: true,
        collection: 'unite'
    });

Unite.plugin(pag);

module.exports = mongObj.model('Unite', Unite);