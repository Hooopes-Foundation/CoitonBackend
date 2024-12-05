const router = require("express").Router();
const multer = require("multer");
const { ProposalController } = require("../../controllers");
const ProposalValidator = require("../../validators/proposal/ProposalValidator");
// Use memory storage to avoid saving the file
const storage = multer.memoryStorage();

// File filter to allow only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only CSV files are allowed"), false); // Reject file
  }
};

// Configure Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post(
  "/",
  upload.single("doc"),
  ProposalValidator.initiate_proposal,
  ProposalController.handleProposalUpload
);
router.get("/", ProposalController.get_proposals);
router.post("/vote", ProposalValidator.vote, ProposalController.vote);

module.exports = router;
