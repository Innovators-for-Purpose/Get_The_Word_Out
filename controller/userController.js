const User = require("../models/User.js");


exports.createUser = async (req, res) => {
    //const amountOfAvalScenarios = await Quiz.count();
    //const theScenario = Math.floor(Math.random() * amountOfAvalScenarios) + 1;
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