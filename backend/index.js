const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/lib/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { app, server } = require("./src/lib/socket");

const authRoutes = require("./src/routes/auth.route");
const messageRoutes = require("./src/routes/message.route");
const groupRoutes = require("./src/routes/group.route");

dotenv.config();  

app.use(  
  cors({  
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);


app.use(cookieParser());  
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDB();
});
