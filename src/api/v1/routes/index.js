const router = require("express").Router();

//All the routes that where created
const AuthRoute = require("./auth/AuthRoute");
const UserRoute = require("./user/UserRoute");
const EmailRoute = require("./email/EmailRoute");
const PaymentRoute = require("./payment/PaymentRoute");

router.use("/auth", AuthRoute);
router.use("/users", UserRoute);
router.use("/email", EmailRoute);
router.use("/payment", PaymentRoute);

module.exports = router;
