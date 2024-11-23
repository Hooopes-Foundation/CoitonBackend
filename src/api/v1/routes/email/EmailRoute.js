const router = require("express").Router();
const { EmailController } = require("../../controllers");

router.post("/", EmailController.sendEmail);

module.exports = router;
