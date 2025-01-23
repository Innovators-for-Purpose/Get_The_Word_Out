const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventController.js");
const upload = require('../config/multerConfig');

router.get("/", eventController.getALLEvents);
router.post("/event",eventController.singleEvent);
router.post("/eventForm", upload.single('thumbnail'), eventController.createEvent);
router.get("/event/:id", eventController.getEventDetails);
router.get("/event/:id", eventController.getEventDetails);
router.delete("/delete-event", eventController.deleteEvent)

module.exports = router;