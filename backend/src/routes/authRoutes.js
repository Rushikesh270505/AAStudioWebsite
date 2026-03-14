const express = require("express");
const {
  register,
  login,
  staffLogin,
  forgotPassword,
  requestOtp,
  verifyOtp,
  loginWithOtp,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/staff-login", staffLogin);
router.post("/forgot-password", forgotPassword);
router.post("/login-with-otp", loginWithOtp);
router.get("/me", protect, getCurrentUser);

module.exports = router;
