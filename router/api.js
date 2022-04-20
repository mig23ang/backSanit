let express = require('express');
let router = express.Router();

/**
 * System Settings controllers
 */
 router.use("/", require("../controller/counterController"));

/**
 * Pre operational controllers
 */
router.use("/", require("../controller/userController"));
router.use("/", require("../controller/roleController"));
router.use("/", require("../controller/modulesController"));
router.use("/", require("../controller/filesController"));

router.use("/", require("../controller/menuController"));
router.use("/", require("../controller/entiteController"));
router.use("/", require("../controller/placeController"));
router.use("/", require("../controller/productController"));
router.use("/", require("../controller/uniteController"));

/**
 * Operational controllers
 */
router.use("/", require("../controller/remisionController"));
router.use("/", require("../controller/supplyController"));
router.use("/", require("../controller/lotController"));
router.use("/", require("../controller/mixController"));
router.use("/", require("../controller/refineController"));
router.use("/", require("../controller/orderController"));

/**
 * Special controllers
 */
router.use("/", require("../controller/fieldController"));
router.use("/", require("../controller/transactionController"));


router.get("/",function(req,resp,callback){
	resp.json({"Test":"Dev 2.1"});
});

module.exports = router;