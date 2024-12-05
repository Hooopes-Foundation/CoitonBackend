const { CheckBadRequest } = require("../../validations");
const { MessageResponse } = require("../../helpers");
const { Proposal, ProposalVote } = require("../../database/models");

const csv = require("csv-parser");
const {
  get_dao_members,
  store_real_estate_index,
} = require("../contract/contract.controller");
const { sendMail } = require("../../helpers/email/EmailConfig");

const INDEX_KEYS_MAPPING = {
  region: "Region",
  index_value: "Index Value (Current)",
  month_over_month_change: "% Change (Month-over-Month)",
  year_over_year_change: "% Change (Year-over-Year)",
  median_price: "Median Price ($)",
  trend: "Trend",
};

exports.handleProposalUpload = async (req, res, next) => {
  const errors = CheckBadRequest(req, res, next);
  if (errors) return next(errors);
  const { initiator, title } = req.body;

  try {
    if (!req.file) {
      MessageResponse.errorResponse(
        res,
        "No file uploaded or invalid file type",
        400,
        {}
      );
      return;
    }

    const csvData = [];
    const fileBuffer = req.file.buffer;

    // Parse CSV data from buffer
    const stream = require("stream");
    const readableFile = new stream.PassThrough();
    readableFile.end(fileBuffer);

    readableFile
      .pipe(csv())
      .on("data", (row) => {
        csvData.push(row);
      })
      .on("end", async () => {
        try {
          if (csvData.length) {
            const keys = Object.keys(csvData[0]);
            let success = true;
            const INDEX_KEYS = Object.values(INDEX_KEYS_MAPPING);
            for (let i = 0; i < keys.length; i++) {
              const element = keys[i];
              const check = INDEX_KEYS.find(
                (fd) => fd.toLowerCase() === element.trim().toLowerCase()
              );
              if (!check) {
                success = false;
                break;
              }
            }

            if (success) {
              await Proposal.create({
                initiator,
                title,
                index: JSON.stringify(csvData),
              });

              MessageResponse.successResponse(
                res,
                "CSV processed successfully",
                201,
                csvData
              );
            } else {
              MessageResponse.errorResponse(
                res,
                "File does not meet format standard",
                400,
                { standard_format: INDEX_KEYS, provided_format: keys }
              );
            }

            return;
          }

          MessageResponse.errorResponse(res, "Empty file content", 400, {});
          return;
        } catch (error) {
          console.log(error);
          MessageResponse.errorResponse(
            res,
            "internal server error",
            500,
            error.message
          );
        }
      })
      .on("error", (err) => {
        MessageResponse.errorResponse(
          res,
          "Error processing CSV file",
          500,
          err.message
        );
      });
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

exports.get_proposals = async (req, res, next) => {
  const errors = CheckBadRequest(req, res, next);
  if (errors) return next(errors);
  const { active, implemented } = req.query;

  try {
    if (active || implemented) {
      let where = {};
      if (active) {
        where = {
          ...where,
          active: active === "true" ? true : false,
        };
      }
      if (implemented) {
        where = {
          ...where,
          implemented: implemented === "true" ? true : false,
        };
      }
      const proposals = await Proposal.findAll({
        where,
        include: [
          {
            model: ProposalVote,
            as: "votes", // Use the alias defined in the association
          },
        ],
      });
      MessageResponse.successResponse(res, "Data fetched", 201, proposals);
      return;
    }

    const proposals = await Proposal.findAll();
    MessageResponse.successResponse(res, "Data fetched", 201, proposals);
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

exports.vote = async (req, res, next) => {
  const errors = CheckBadRequest(req, res, next);
  if (errors) return next(errors);
  const { voter, proposal_id } = req.body;

  try {
    const has_voted = await ProposalVote.findOne({
      where: {
        voter,
        proposal: proposal_id,
      },
    });

    if (has_voted) {
      MessageResponse.errorResponse(res, "ALREADY_VOTED", 400, {});
      return;
    }
    const dao_members = await get_dao_members();
    if (dao_members.success) {
      MessageResponse.errorResponse(res, "Contract Error", 500, {});
      return;
    }
    const vote = await ProposalVote.create({
      ...req.body,
      proposal: proposal_id,
    });

    const votes = await ProposalVote.findAll({
      where: {
        proposal: proposal_id,
      },
    });

    let up_votes = 0;
    let down_votes = 0;
    for (let i = 0; i < votes.length; i++) {
      const element = votes[i];
      if (element.vote) {
        up_votes = up_votes + 1;
      } else {
        down_votes = down_votes + 1;
      }
    }

    const proposal = await Proposal.findOne({
      where: {
        id: proposal_id,
      },
    });

    if (down_votes >= 3) {
      const emails = dao_members.response
        .filter((ft) => ft.is_dao && ft.approved)
        .map((mp) => mp.details.email)
        .filter((ft) => Boolean(ft));

      if (emails.length) {
        sendMail(
          emails.join(","),
          ``,
          disapproved_proposal_email_construct({
            title: proposal.title,
            total_votes: up_votes + down_votes,
            for: up_votes,
            against: down_votes,
          })`Announcement: Proposal "${proposal.title}" Not Approved`
        );
      }
      await proposal.update({ active: false, implemented: false });
    }

    if (up_votes >= 3) {
      let data = [];
      const parsed_indices = JSON.parse(proposal.index);
      for (let i = 0; i < parsed_indices.length; i++) {
        const real_estate_index = parsed_indices[i];
        const construct = {
          region: real_estate_index[INDEX_KEYS_MAPPING["region"]],
          index_value: real_estate_index[INDEX_KEYS_MAPPING["index_value"]],
          month_over_month_change:
            real_estate_index[INDEX_KEYS_MAPPING["month_over_month_change"]],
          year_over_year_change:
            real_estate_index[INDEX_KEYS_MAPPING["year_over_year_change"]],
          median_price: real_estate_index[INDEX_KEYS_MAPPING["median_price"]],
          trend: real_estate_index[INDEX_KEYS_MAPPING["trend"]],
        };

        data.push({
          index: construct,
          proposer: proposal.initiator,
          timestamp: 0,
        });
      }

      await store_real_estate_index(data);
      const emails = dao_members.response
        .filter((ft) => ft.is_dao && ft.approved)
        .map((mp) => mp.details.email)
        .filter((ft) => Boolean(ft));

      if (emails.length) {
        sendMail(
          emails.join(","),
          ``,
          approved_proposal_email_construct({
            title: proposal.title,
            total_votes: up_votes + down_votes,
            for: up_votes,
            against: down_votes,
          })`Announcement: Proposal "${proposal.title}" Approved`
        );
      }
      await proposal.update({ active: false, implemented: true });
    }

    MessageResponse.successResponse(res, "Voted", 201, vote);
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

const approved_proposal_email_construct = (proposal_details) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal Implementation Announcement</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      color: #333;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 1px solid #ddd;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      color: #28a745;
    }
    .content {
      margin-bottom: 20px;
    }
    .content h2 {
      color: #333;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .content p {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      margin-top: 20px;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>Proposal Approved and Implemented</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Dear Dao Member,</h2>
      <p>We are thrilled to announce that the proposal titled <strong>"${proposal_details.title}"</strong> has been <strong>approved</strong> and is now officially implemented following the successful voting process.</p>

      <h3>Voting Results:</h3>
      <ul>
        <li>Total Votes: <strong>${proposal_details.total_votes}</strong></li>
        <li>Votes For: <strong>${proposal_details.for}</strong></li>
        <li>Votes Against: <strong>${proposal_details.against}</strong></li>
      </ul>

      <p>Thank you for your participation and support in bringing this initiative to life. We are confident that this implementation will provide significant value and further strengthen our community.</p>

      <p>If you have any questions or feedback, feel free to reply to this email.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for being an integral part of our journey.</p>
      <p>&copy; 2024 Your COiTON | All rights reserved.</p>
    </div>
  </div>
</body>
</html>

`;
};

const disapproved_proposal_email_construct = (proposal_details) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal Rejection Announcement</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      color: #333;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 1px solid #ddd;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      color: #dc3545;
    }
    .content {
      margin-bottom: 20px;
    }
    .content h2 {
      color: #333;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .content p {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      margin-top: 20px;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>Proposal Not Approved</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Dear Dao Member,</h2>
      <p>We regret to inform you that the proposal titled <strong>"${proposal_details.title}"</strong> has not been approved for implementation following the voting process.</p>

      <h3>Voting Results:</h3>
      <ul>
        <li>Total Votes: <strong>${proposal_details.total_votes}</strong></li>
        <li>Votes For: <strong>${proposal_details.for}</strong></li>
        <li>Votes Against: <strong>${proposal_details.against}</strong></li>
      </ul>

      <p>While this proposal did not receive the required support, we remain committed to exploring new initiatives that will benefit all members.</p>

      <p>Thank you for your engagement and participation. Your input is valuable to our community.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>We look forward to your continued involvement in future proposals.</p>
      <p>&copy; 2024 Your COiTON | All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
