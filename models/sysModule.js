const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let SysModule = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        code: { type: String, unique: true, required: true },
        tittle: { type: String, required: true, unique: true},
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user' }
    }, {
        timestamps: true,
        collection: 'sysmodule'
    });

SysModule.plugin(pag);

module.exports = mongObj.model('SysModule', SysModule);