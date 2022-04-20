const mongLot = require('mongoose');
const SchemaObj = mongLot.Schema;
var objId = SchemaObj.ObjectId;
const pag = require('mongoose-aggregate-paginate-v2');

let Lot = new SchemaObj(
    {
        
        _id: { type: objId, auto: true },
        lotCode: { type: String,  unique: true},        
        initialW: { type: Number, required: [true, "El peso es requerido" ]},
        actualW: { type: Number},
        finalW: { type: Number },
        uniteId: { type: SchemaObj.Types.ObjectId, ref: 'unite'},
        state: { type: String, default: "Registrado" },
        createdBy: { type: SchemaObj.Types.ObjectId, ref: 'user' },
        modifiedBy: { type: SchemaObj.Types.ObjectId, ref: 'user' },
        descripcion: { type: String},
    }, {
        timestamps: true,
        collection: 'lot'
    });

Lot.plugin(pag);

module.exports = mongLot.model('Lot', Lot);