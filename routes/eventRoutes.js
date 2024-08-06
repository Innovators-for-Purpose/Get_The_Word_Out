const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventController.js");

router.get("/", eventController.getALLEvents);
router.post("/event",eventController.singleEvent);
router.post("/eventForm", eventController.createEvent);
router.delete("/delete-event", eventController.deleteEvent)

module.exports = router;    