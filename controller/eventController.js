const Event = require("../models/Event.js");


exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};


exports.createEvent = async (req, res) => {
  try {
    const { title,uid, description, location, venue, time, category, age, date } = req.body;
    console.log("body",req.body)
    const event = await Event.create({
      title, 
      uid,
      description, 
      location, 
      venue, 
      time, 
      category, 
      age, 
      date
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Error creating event in controller:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};







