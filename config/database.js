module.exports = {
  dbName: "sanitcol",

  // ===============================================
  // Producción
  // ===============================================

  //strCon: "mongodb+srv://miguel:mocoso@cluster0.1a38u.mongodb.net/sanitcol?retryWrites=true&w=majority"
  strCon: "mongodb://miguel:mocoso@cluster0-shard-00-00.1a38u.mongodb.net:27017,cluster0-shard-00-01.1a38u.mongodb.net:27017,cluster0-shard-00-02.1a38u.mongodb.net:27017/sanitcol?ssl=true&replicaSet=atlas-12qfq6-shard-0&authSource=admin&retryWrites=true&w=majority"
  // ===============================================
  // Pruebas
  // ===============================================

  //strCon: 'mongodb://localhost:27017/NIRGOTECH'
};