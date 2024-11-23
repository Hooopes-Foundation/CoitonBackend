const router = require("express").Router();
const { UserController } = require("../../controllers");
const { pagination, VerifyToken } = require("../../middlewares");
const UserValidator = require("../../validators/user/UserValidator");

// add verification on token middleware

router.get("/", VerifyToken, pagination, UserController.getAllUsers);
router.get("/name/:query", pagination, VerifyToken, UserController.searchUser);
router.get("/:id", VerifyToken, UserValidator.getUser, UserController.getUser);
router.put("/", VerifyToken, UserController.updateUser);

module.exports = router;
