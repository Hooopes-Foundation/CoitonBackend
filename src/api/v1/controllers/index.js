const UserController = require("./users/UsersController");
const AuthController = require("./auth/AuthController");
const EmailController = require("./email/EmailController");
const ContractController = require("./contract/contract.controller");
const PaymentController = require("./payment/payment.controller");
const ProposalController = require("./proposal/proposal.controller");

module.exports = {
  UserController,
  AuthController,
  EmailController,
  ContractController,
  PaymentController,
  ProposalController,
};
