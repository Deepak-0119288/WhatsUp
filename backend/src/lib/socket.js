const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const User = require("../models/user.model");
const Messages = require("../models/message.model");
const Group = require("../models/group.model");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: [process.env.FRONTEND_URL],
          methods: ["GET", "POST"],
          credentials: true, 
   },
});

const userSocket = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId || userId === "undefined") {
    console.log("Socket connection rejected: Invalid or missing userId", { socketId: socket.id });
    socket.disconnect();
    return;
  }

  userSocket[userId] = socket.id;
  console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { lastOnline: null },
      { new: true }
    );
    if (!updatedUser) {
      console.error(`User not found for ID: ${userId}`);
      delete userSocket[userId];
      socket.disconnect();
      return;
    }

    const undeliveredIndividualMessages = await Messages.find({
      receiverId: userId,
      delivered: false,
      groupId: null,
    });
    if (undeliveredIndividualMessages.length > 0) {
      await Messages.updateMany(
        { receiverId: userId, delivered: false, groupId: null },
        { delivered: true },
        { multi: true }
      );
      for (const msg of undeliveredIndividualMessages) {
        msg.delivered = true;
        const senderSocketId = getReceiverId(msg.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDelivered", msg);
        }
        io.to(socket.id).emit("newMessage", msg);
      }
    }

    const userGroups = await Group.find({ members: userId }).distinct("_id");
    const undeliveredGroupMessages = await Messages.find({
      groupId: { $in: userGroups },
      delivered: false,
      senderId: { $ne: userId },
    });
    if (undeliveredGroupMessages.length > 0) {
      for (const msg of undeliveredGroupMessages) {
        const group = await Group.findById(msg.groupId);
        const membersExceptSender = group.members.filter(
          (m) => m.toString() !== msg.senderId.toString()
        );
        const anyMemberOnline = membersExceptSender.some(
          (m) => userSocket[m.toString()]
        );

        if (anyMemberOnline && !msg.delivered) {
          msg.delivered = true;
          await msg.save();
        }

        const senderSocketId = getReceiverId(msg.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDelivered", msg);
        }
        io.to(socket.id).emit("newMessage", msg);
      }
    }

    const [individualMessages, groupMessages] = await Promise.all([
      Messages.find({ receiverId: userId, read: false, groupId: null }),
      Messages.find({
        groupId: { $in: userGroups },
        read: false,
        readBy: { $ne: userId },
      }).populate("senderId", "name profilePic"),
    ]);

    individualMessages.forEach((msg) => {
      io.to(socket.id).emit("newMessage", msg);
    });
    groupMessages.forEach((msg) => {
      io.to(socket.id).emit("newMessage", msg);
    });

    io.emit("getOnlineUsers", Object.keys(userSocket));
  } catch (error) {
    console.error("Error in socket connection:", error);
    delete userSocket[userId];
    socket.disconnect();
  }

  socket.on("requestOnlineUsers", () => {
    io.to(socket.id).emit("getOnlineUsers", Object.keys(userSocket));
  });

  socket.on("markMessagesAsRead", async ({ chatId, isGroup }) => {
    if (!isGroup) {
      const messages = await Messages.find({
        receiverId: userId,
        senderId: chatId,
        read: false,
        groupId: null,
      });

      for (const msg of messages) {
        msg.read = true;
        await msg.save();
        const senderSocketId = getReceiverId(msg.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageRead", msg);
        }
        io.to(socket.id).emit("messageRead", msg);
      }
    } else {
      const group = await Group.findById(chatId);
      if (!group || !group.members) return;

      const messages = await Messages.find({
        groupId: chatId,
        read: false,
        senderId: { $ne: userId },
      });

      for (const msg of messages) {
        if (!msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
          await msg.save();
        }

        const membersExceptSender = group.members.filter(
          (m) => m.toString() !== msg.senderId.toString()
        );
        const allRead = membersExceptSender.every((memberId) =>
          msg.readBy.includes(memberId)
        );

        if (allRead) {
          msg.read = true;
          await msg.save();
        }

        group.members.forEach((memberId) => {
          const socketId = getReceiverId(memberId.toString());
          if (socketId) {
            io.to(socketId).emit("messageRead", msg);
          }
        });
      }
    }
  });

  socket.on("typing", async ({ chatId, isGroup, senderId, username }) => {
    if (isGroup) {
      const group = await Group.findById(chatId);
      if (!group) return;

      group.members.forEach((memberId) => {
        const socketId = getReceiverId(memberId.toString());
        if (socketId && memberId.toString() !== senderId) {
          io.to(socketId).emit("typing", { chatId, senderId, username, isGroup });
        }
      });
    } else {
      const receiverSocketId = getReceiverId(chatId);
      if (receiverSocketId && chatId !== senderId) {
        io.to(receiverSocketId).emit("typing", { chatId, senderId, username, isGroup });
      }
    }
  });

  socket.on("stopTyping", async ({ chatId, isGroup, senderId }) => {
    if (isGroup) {
      const group = await Group.findById(chatId);
      if (!group) return;

      group.members.forEach((memberId) => {
        const socketId = getReceiverId(memberId.toString());
        if (socketId && memberId.toString() !== senderId) {
          io.to(socketId).emit("stopTyping", { chatId, senderId, isGroup });
        }
      });
    } else {
      const receiverSocketId = getReceiverId(chatId);
      if (receiverSocketId && chatId !== senderId) {
        io.to(receiverSocketId).emit("stopTyping", { chatId, senderId, isGroup });
      }
    }
  });

  socket.on("disconnect", async () => {
    if (!userId || !userSocket[userId]) return;

    delete userSocket[userId];
    console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { lastOnline: new Date() },
        { new: true }
      );

      if (!updatedUser) {
        console.error(`User not found on disconnect for ID: ${userId}`);
        return;
      }

      io.emit("getOnlineUsers", Object.keys(userSocket));
      io.emit("userLastOnlineUpdated", {
        userId: updatedUser._id,
        lastOnline: updatedUser.lastOnline,
      });
    } catch (error) {
      console.error(`Error during disconnect for user ${userId}:`, error);
    }
  });
});

function getReceiverId(userId) {
  return userSocket[userId];
}

module.exports = { io, app, server, getReceiverId };