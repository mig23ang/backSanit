let Counter = require('../models/counter');

module.exports = {
    getDocNum,
    setCounterDocNum,
    registryCounterDocNum    
};

/**
 * Get the number updating the db counter and returning the count
 * @docType: name of the type registered on counter that wants the counter doc
 * 
 */
function getDocNum(docName, callback){
    try{
        Counter.findOne({"docName":docName},(err,data)=>{
            //console.log(data);
            if (err){
                //console.log("resolving to callback with error finding");
                callback({"Error":err,"code":"501"},null);
            }else{
                //console.log(data);
                if (!data){
                    //console.log("resolving to callback with not found");
                    callback({"Error":"No data was found","code":"401"},null);
                }else{
                    let currentCounter = data;
                    //console.log(currentCounter);
                    Counter.updateOne({"_id": currentCounter["_id"]},{"counter": (currentCounter["counter"]+1)},(err,data)=>{
                        //console.log(currentCounter);
                        if (err){
                            //console.log("resolving to callback with error updating");
                            callback({"Error":err,"code":"501"},null);
                        }else{
                            let ans = currentCounter["prefix"]  + (currentCounter["counter"]+1) + currentCounter["sufix"];
                            //console.log(ans);
                            callback(null,ans);
                        }
                    });
                }
                
            }
        });
    }catch(e){
        //console.log("resolving to callback with error trying");
        callback({"Error":e,"code":"500"},null);
    }
    
}

/**
 * set the counter to specified value
 */
function setCounterDocNum(){

}

/**
 * Create a counter with specified values, that represents de Counter model:
 * @counter: value to start the counter
 * @type: identifier code o name to operate the counter
 * @prefix: if counter must return a count with prefix
 * @sufix: if counter must return a count with sufix
 * @pattern: y counter must contain som patter like 00000+counter ....
 */
function registryCounterDocNum(counterObj, callback, response){
    //console.log(counterObj);
    try{
        Counter.create(counterObj,(err,data)=>{
            if (err){
                callback({"Error":err},response);
            }else{
                callback(data,response);
            }
        });
    }catch(e){
        callback({"Error":e},response);
    }
}