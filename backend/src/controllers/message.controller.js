const User = require("../models/user.model");
const Messages = require("../models/message.model");
const { getReceiverId, io } = require("../lib/socket");

const getUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await User.find(
      { _id: { $ne: userId } },
      "_id name profilePic lastOnline"
    );  
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUser Controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user._id;

    const messages = await Messages.find({
      $or: [
        { senderId, receiverId: id },
        { senderId: id, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages Controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendMessages = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!text?.trim() && !imageUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      delivered: false,
      read: false,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverId(receiverId);
    if (receiverSocketId) {
      newMessage.delivered = true;
      await newMessage.save();
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    io.to(getReceiverId(senderId)).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUnreadMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Messages.find({
      receiverId: userId,
      read: false,
      groupId: null,
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getUnreadMessages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Note cannot be empty" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.note = { text, createdAt: new Date() };
    await user.save();

    const noteResponse = {
      userId: user._id,
      name: user.name,
      profilePic: user.profilePic,
      note: user.note,
    };

    io.emit("newNote", noteResponse);

    res.status(201).json(noteResponse);
  } catch (error) {
    console.error("Error in addNote Controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const users = await User.find(
      { note: { $exists: true, $ne: null } },
      "_id name profilePic note"
    ).lean();

    const allNotes = users
      .map((user) => ({
        userId: user._id,
        name: user.name,
        profilePic: user.profilePic,
        note: {
          text: user.note.text,
          createdAt: user.note.createdAt,
        },
      }))
      .sort((a, b) => new Date(b.note.createdAt) - new Date(a.note.createdAt));

    res.status(200).json(allNotes);
  } catch (error) {
    console.error("Error in getNotes Controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, getMessages, sendMessages, addNote, getNotes, getUnreadMessages };