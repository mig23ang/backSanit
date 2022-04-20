const camCase = require("camelcase");

function camelCaseSpaced(toCamel){
	console.log(toCamel);
	if (toCamel){
		let strIter = toCamel.split(" ");
		let ans = "";
		for (i=0; i<strIter.length; i++){
			ans += i==0 ? camCase(strIter[i],{pascalCase : true}) : " " + camCase(strIter[i],{pascalCase : true});
		}
		return ans;
	}else{
		return "";
	}
	
}

function camelCase(toCamel){
	return camCase(toCamel);
}

module.exports ={
    camelCaseSpaced,
	camelCase
};