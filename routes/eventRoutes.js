const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventController.js");

//router.get("/", eventController.getALLEvents);
router.post("/eventForm", eventController.createEvent);



module.exports = router;