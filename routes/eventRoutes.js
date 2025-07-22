const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventController');
const multer = require('multer');
const path = require('path');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs');

router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Event Router: ${req.method} ${req.url}`);
    next();
});

router.post('/eventForm', upload.single('thumbnail'), eventController.createEvent);
router.post('/create', upload.single('thumbnail'), eventController.createEvent);

router.get('/', eventController.getALLEvents);
router.get('/:id', eventController.getEventDetails);
router.post("/event", eventController.singleEvent);
router.post("/event/:id", eventController.getEventDetails);
router.delete("/delete-event", eventController.deleteEvent);
router.get('/', eventController.getALLEvents);

module.exports = router;