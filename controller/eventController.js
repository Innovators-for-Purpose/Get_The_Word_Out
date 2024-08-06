const Event = require("../models/Event.js");


exports.getALLEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.render('event-list', { events: events });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.singleEvent = async (req, res) => {
  try {
    const { id } = req.body;
    const event = await Event.findAll({where: {id: id}});
    res.status(201).json({ success: true, event});
  } catch (error) {
    console.error("Error getting event data in controller:", error);
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
    console.log(event);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Error creating event in controller:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.body;
    await Event.destroy({where: {id: id}});
    res.status(202).json({ success: true });
  } catch (error) {
    console.error("Error deleting event in controller:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};






