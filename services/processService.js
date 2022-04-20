const dbConfig = require("../config/appconfig");
const transaction = require("../models/transaction");

module.exports = {
    getTransactionStructure
}

/**
 * Get the strcuture of transaction (not the registered information)
 * @param {String} idTransaction 
 * @param {Function} callback 
 * @param {Response} response 
 */
function getTransactionStructure(idTransaction,callback,response){
    try{
        transaction.find({"_id":idTransaction},(err,data)=>{
            if (err){
                callback({"Error":err},response);
            }else{
                callback(data,response);
            }
        });
    }catch(e){

    }
}