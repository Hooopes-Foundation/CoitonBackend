require("dotenv").config();

const { mint_token } = require("../contract/contract.controller");
const { CheckBadRequest } = require("../../validations");
const { MessageResponse } = require("../../helpers");
const PAYSTACK_SEC_KEY = process.env.PAYSTACK_SEC_KEY;

const paystack = require("paystack")(PAYSTACK_SEC_KEY);
const buy_token = async (req, res, next) => {
  const errors = CheckBadRequest(req, res, next);
  if (errors) return next(errors);
  const { receipt, address } = req.body;

  try {
    const tx = await paystack.transaction.get(receipt);
    if (tx.status) {
      const amount = Number(tx.data.amount) / 100;

      const cal = Math.round(amount * Math.pow(10, 6));

      const mint_tx = await mint_token(address, cal);

      if (mint_tx.success) {
        MessageResponse.successResponse(
          res,
          "Transaction successful",
          201,
          mint_tx.tx
        );
      } else {
        MessageResponse.errorResponse(res, "Error occured", 422, {});
      }
    } else {
      MessageResponse.errorResponse(res, tx.message, 422, {});
    }

    console.log(tx);
  } catch (error) {
    console.log(error);
    MessageResponse.errorResponse(
      res,
      "internal server error",
      500,
      error.message
    );
  }
};

buy_token().catch(console.log);
