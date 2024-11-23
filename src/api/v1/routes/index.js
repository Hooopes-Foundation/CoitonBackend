const router = require("express").Router();

//All the routes that where created
const AuthRoute = require("./auth/AuthRoute");
const UserRoute = require("./user/UserRoute");
const EmailRoute = require("./email/EmailRoute");

router.use("/auth", AuthRoute);
router.use("/users", UserRoute);
router.use("/email", EmailRoute);

module.exports = router;
