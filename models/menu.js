const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;

//We will define the Schema of the user type data
let Menu = new SchemaObj(
    {
        _id: { type: objId, auto: true },		
		label: { type: String, required: true},
		linkTo: {type: String},
        level: {type: String},
		iconSrc: {type: String},
		idparent: {type: SchemaObj.Types.ObjectId, ref: 'menu'},
        reference: {type: String},
		order: {type: String}		
    }, {
		timestamps: true,
        collection: 'menu'
    });

module.exports = mongObj.model('Menu', Menu);