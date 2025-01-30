const User = require("../models/User.js");

exports.getAllUsers = async (req, res) => {
    try {
      const all_users = await User.findAll();
      res.render("index", { users: all_users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Failed to fetch users.");
    }
  };

exports.createUser = async (req, res) => {
    try {
      const { firstName, lastName, uid, email, phone, contact, notify } = req.body;
      const isTherePreviousUser = await User.findOne( {where: { firstName }} )
      if (isTherePreviousUser) {
        return res.status(409).json({error: "User with that username already exists."});
      }
      const user = await User.create({
        firstName, 
        lastName, 
        uid, 
        email, 
        phone, 
        contact, 
        notify,
        token: null,
        session_blob: JSON.stringify({}),
      });
      
    } catch (theError) {
      console.error("Failed to create user:", theError);
      res.status(500).json({error: "Failed to create user"});
    }
};

exports.loginUser = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(400).json({error: "Invalid email or user not found."});
        return;
      };
      
    } catch (error) {
      console.error("Failed to login user:", error);
      res.status(500).send("Failed to login user.");
    }
  };