const Group = require("../models/group.model");
const Messages = require("../models/message.model");
const { io, getReceiverId } = require("../lib/socket");

const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    let profilePicPath;

    if (req.file) {
      profilePicPath = `/uploads/${req.file.filename}`;
    }

    const parsedMemberIds = JSON.parse(memberIds);
    if (!parsedMemberIds.includes(req.user._id.toString())) {
      parsedMemberIds.push(req.user._id);
    }

    const group = await Group.create({
      name,
      members: parsedMemberIds,
      profilePic: profilePicPath,
      createdBy: req.user._id,
    });

    const populatedGroup = await Group.findById(group._id).populate(
      "members",
      "_id name profilePic"
    );

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    console.log("Group found:", group);
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Only the creator can delete this group" });
    }

    await Group.findByIdAndDelete(groupId);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error.message, error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({
      $or: [{ members: userId }, { createdBy: userId }],
    }).populate("members", "_id name profilePic");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!text?.trim() && !imageUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const newMessage = new Messages({
      senderId,
      groupId,
      text,
      image: imageUrl,
      delivered: false,
      read: false,
      readBy: [senderId],
    });

    await newMessage.save();

    const populatedMessage = await Messages.findById(newMessage._id).populate(
      "senderId",
      "name profilePic"
    );

    let deliveredToAny = false;
    group.members.forEach((memberId) => {
      const socketId = getReceiverId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("newMessage", populatedMessage);
        if (memberId.toString() !== senderId.toString()) {
          deliveredToAny = true;
        }
      }
    });

    if (deliveredToAny) {
      populatedMessage.delivered = true;
      await populatedMessage.save();
      const senderSocketId = getReceiverId(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", populatedMessage);
      }
    }

    const senderSocketId = getReceiverId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Messages.find({ groupId }).populate(
      "senderId",
      "name profilePic"
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUnreadGroupMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groups = await Group.find({ members: userId }).distinct('_id');
    const messages = await Messages.find({
      groupId: { $in: groups },
      read: false,
      readBy: { $ne: userId },
    }).populate("senderId", "name profilePic");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getUnreadGroupMessages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, memberIds } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can update the group" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (memberIds) {
      const parsedMemberIds = JSON.parse(memberIds);
      if (!parsedMemberIds.includes(req.user._id.toString())) {
        parsedMemberIds.push(req.user._id);
      }
      updates.members = parsedMemberIds;
    }
    if (req.file) {
      updates.profilePic = `/uploads/${req.file.filename}`;
    }

    const updatedGroup = await Group.findByIdAndUpdate(groupId, updates, {
      new: true,
    }).populate("members", "_id name profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Failed to update group" });
  }
};

module.exports = { createGroup, getGroups, sendGroupMessage, getGroupMessages, updateGroup, getUnreadGroupMessages, deleteGroup };