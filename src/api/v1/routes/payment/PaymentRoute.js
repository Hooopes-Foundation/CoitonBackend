const router = require("express").Router();
const { PaymentController } = require("../../controllers");

router.post("/", PaymentController.buy_token);

module.exports = router;
