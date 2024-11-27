const UserController = require("./users/UsersController");
const AuthController = require("./auth/AuthController");
const EmailController = require("./email/EmailController");
const ContractController = require("./contract/contract.controller");
const PaymentController = require("./payment/payment.controller");

module.exports = {
  UserController,
  AuthController,
  EmailController,
  ContractController,
  PaymentController,
};
