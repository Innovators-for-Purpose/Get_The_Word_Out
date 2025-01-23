const Event = require("../models/Event.js");


exports.getALLEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.render('event-list', { events: events });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
}



exports.getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (event) {
      res.render("event-view-page", { event });
    } else {
      res.status(404).render("error", { message: "Event not found" });
    }
  } catch (error) {
    console.error("Error getting event details in controller:", error);
    res.status(500).render("error", { message: "Server Error" });
  }
};

exports.singleEvent = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body);
    const event = await Event.findAll({where: {id: id}});
    res.status(201).json({ success: true, event});
  } catch (error) {
    console.error("Error getting event data in controller:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {thumbnail, title, uid, description, location, venue, time, category, age, date } = req.body;
    console.log("body",req.body)
    const event = await Event.create({
      thumbnail,
      title, 
      uid: 1,
      description, 
      location, 
      venue: "venue", 
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




