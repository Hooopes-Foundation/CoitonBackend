const { body } = require("express-validator");
const { Proposal } = require("../../database/models");
const {
  get_proposal_initiator,
} = require("../../controllers/contract/contract.controller");

exports.vote = [
  body("voter")
    .notEmpty()
    .withMessage("Invalid query")
    .bail()
    .custom(async (voter) => {
      const get_dao_member = await get_proposal_initiator(voter.trim());
      if (!get_dao_member.success) {
        throw new Error("CONTRACT_ERROR");
      }
      if (
        !get_dao_member.response.is_dao ||
        !get_dao_member.response.approved
      ) {
        throw new Error("NOT_A_VALID_DAO");
      }
    }),
  body("proposal_id")
    .notEmpty()
    .withMessage("Invalid query")
    .bail()
    .custom(async (proposal_id) => {
      const proposal = await Proposal.findOne({
        where: {
          id: proposal_id,
        },
      });

      if (!proposal) {
        throw new Error("INVALID_PROPOSAL");
      }

      if (!proposal.active) {
        throw new Error("PROPOSAL_NOT_ACTIVE");
      }
      if (proposal.implemented) {
        throw new Error("PROPOSAL_ALREADY_IMPLEMENTED");
      }
    }),
  body("vote")
    .notEmpty()
    .withMessage("Invalid query")
    .bail()
    .custom(async (vote) => {
      if (vote !== "true" && vote !== "false") {
        throw new Error("INVALID_QUERY");
      }
    }),
];

exports.initiate_proposal = [
  body("initiator")
    .notEmpty()
    .withMessage("Invalid query")
    .bail()
    .custom(async (initiator) => {
      const get_dao_member = await get_proposal_initiator(initiator.trim());
      if (!get_dao_member.success) {
        throw new Error("CONTRACT_ERROR");
      }
      if (
        !get_dao_member.response.is_dao ||
        !get_dao_member.response.approved
      ) {
        throw new Error("NOT_A_VALID_DAO");
      }
    }),
  body("title").notEmpty().withMessage("Invalid query").bail(),
];
