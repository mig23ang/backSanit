const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let State = new SchemaObj(
    {		
        label: { type: String} ,    
        transactionId: { type: SchemaObj.Types.ObjectId, ref: 'transaction'},
        action: { type: String},
        sufix: { type: String},
        counterPattern: {type : String}
    }, {
		timestamps: true,
        collection: 'counter'
    });

    Counter.plugin(uniqueValidator, {"message":"the {PATH} is unique"});

module.exports = mongObj.model('Counter', Counter);