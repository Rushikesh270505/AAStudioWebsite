const express = require("express");
const {
  listInvoices,
  createInvoice,
  updateInvoiceStatus,
} = require("../controllers/invoiceController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, listInvoices);
router.post("/", protect, authorize("architect", "admin"), createInvoice);
router.patch("/:id/status", protect, authorize("architect", "admin"), updateInvoiceStatus);

module.exports = router;
