const mongoose = require("mongoose");

/**
 * 
 * @param {String} operator : eq, nin ....
 * @param {String} property : collection property
 * @param {String} condition : the condition that is compared with the operator
 * @returns 
 */
function getFilter(operator, property, condition){
    let filter  = {};
    switch (operator){
        case "eq":
            filter[property] = {"$eq" : condition};
            break;
        case "/*":
            filter[property] = {"$regex" :  new RegExp(condition,'i')};
            break;
        case "*/":
            filter[property] = {"$regex" :  new RegExp(condition,'i')};
            break;
        case "/*/":
            let options = condition.split(";");
            let regArr = [];
            for (i=0; i<options.length; i++){
                regArr.push(new RegExp(options[i],'i'));
            }
            filter[property] = {"$in" : regArr};
            break;
        case "neq":
            filter[property] = {"$ne" :  condition};
            break;
        
    }
    //console.log(filter);
    let ans = [
        {
            $match : 
                {
                    $and : [
                        {"state" : {$ne : "Eliminado"}},
                        filter
                    ]
                }
        }
    ];
    //console.log(ans);
    return ans;
}

function getAggregation(fieldList){
    let aggregation = [];
    try{
        for (i=0; i<fieldList.length; i++){
            let current = fieldList[i]["field"];
            //console.log(current);
            if ((current["type"]=="select" || current["type"]=="multiselect") && current["relation"] && current["property"]){   
                                               
                aggregation.push(
                    {
                        $lookup : {
                            from : current["relation"],
                            
                            let : {"relId" : "$"+current["_id"]},
                            pipeline: [
                                {
                                    $match : {
                                        "$expr" : {
                                            "$eq" : ["$_id", "$$relId"]
                                        }
                                    }
                                } 
                            ],
                            as : "field"+current["_id"]                             
                        }
                    }
                );
                aggregation.push(
                    {
                        $unwind : {
                            path : "$"+"field"+current["_id"], preserveNullAndEmptyArrays: true
                        }
                    }
                );                 
            }
        }
        return aggregation;
    }catch(e){
        return [];
    }
    

}

module.exports = {
    getFilter,
    getAggregation
};