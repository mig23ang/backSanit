const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

//We will define the Schema of the user type data
let RolXmodule = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        moduleId: { type: SchemaObj.Types.ObjectId, ref: 'sysmodule', required: true },
        roleId: { type: SchemaObj.Types.ObjectId, ref: 'role', required: true },
        modes: { type: String, required: true },
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user' }
    }, {
        timestamps: true,
        collection: 'rolxmodule'
    });

RolXmodule.plugin(pag);

module.exports = mongObj.model('RolXmodule', RolXmodule);