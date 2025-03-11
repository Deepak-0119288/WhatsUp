const jwt = require("jsonwebtoken");

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: "/", 
  });     

  return token; 
};
 
module.exports = generateToken; 