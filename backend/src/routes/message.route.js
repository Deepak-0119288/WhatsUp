const express = require("express");
const {
  getUsers,
  getMessages,
  sendMessages,
  addNote,
  getNotes,
  getUnreadMessages
} = require("../controllers/message.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../lib/multerConfig");

const router = express.Router();

router.get("/users", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getMessages);
router.post("/send/:id", authMiddleware, upload.single("image"), sendMessages);
router.get("/unread/:userId", authMiddleware, getUnreadMessages); 

router.post("/notes", authMiddleware, addNote); 
router.get("/notes/all", authMiddleware, getNotes); 


module.exports = router;  