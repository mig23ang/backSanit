const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Counter = new SchemaObj(
    {		
        counter: { type: Number} ,    
        docName: { type: String, required: [true,"the type is required"], unique: true },
        prefix: { type: String},
        sufix: { type: String},
        counterPattern: {type : String}
    }, {
		timestamps: true,
        collection: 'counter'
    });

    Counter.plugin(uniqueValidator, {"message":"the {PATH} is unique"});

module.exports = mongObj.model('Counter', Counter);