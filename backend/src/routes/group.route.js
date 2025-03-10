const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createGroup,
  getGroups,
  sendGroupMessage,
  getGroupMessages,
  updateGroup,
  getUnreadGroupMessages
} = require("../controllers/group.controller");
const upload = require("../lib/multerConfig");

router.post("/", authMiddleware, upload.single("profilePic"), createGroup);
router.get("/", authMiddleware, getGroups);
router.post("/send/:groupId", authMiddleware, upload.single("image"), sendGroupMessage);
router.get("/:groupId", authMiddleware, getGroupMessages);
router.put("/:groupId", authMiddleware, upload.single("profilePic"), updateGroup);
router.get("/unread/:userId", authMiddleware, getUnreadGroupMessages); 


module.exports = router;