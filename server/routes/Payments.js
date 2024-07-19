const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/payment");
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");
router.post("/capturePayment", auth, isStudent, capturePayment);
// router.post("/verifySignature", verifySignature);

router.post("/verifySignature",auth,isStudent, verifySignature);

module.exports = router;