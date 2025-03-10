const express = require("express");

const {
  signup,
  login,
  logout,
  checkAuth,  
  updateProfile,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../lib/multerConfig");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);  

router.put(  
  "/upload",
  authMiddleware,  
  upload.single("profilePic"),  
  updateProfile
);

router.get("/check", authMiddleware, checkAuth);

module.exports = router;
