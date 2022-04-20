const mongObj = require('mongoose');
const SchemaObj = mongObj.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

//We will define the Schema of the user type data
let Order = new SchemaObj(
    {
        _id: { type: objId, auto: true },
        code: { type: String, unique: true },
        customerId: { type: SchemaObj.Types.ObjectId, ref: 'entite', required : [true,"El Cliente es requerido"] },
        orderDate: { type: String},
        placeId: { type: SchemaObj.Types.ObjectId, ref: 'place', required: [true, "La dirección es requerida"] },
        description: { type: String },
        totalUnites: { type: Number},
        state : { type: String, default: "Registrado"},
        urlPhoto: {type: String},
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user'},
        modifiedBy: { type: SchemaObj.Types.ObjectId, ref: 'user'}
    }, {
        timestamps: true,
        collection: 'order'
    });

Order.plugin(pag);
Order.plugin(uniqueValidator, {"message":"ya se encuentra un registro con  {PATH} registrado!"});

module.exports = mongObj.model('Order', Order);