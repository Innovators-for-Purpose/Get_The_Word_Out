const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Event Router: ${req.method} ${req.url}`);
    next();
});

router.post('/create', upload.single('thumbnail'), eventController.createEvent);

router.get('/', eventController.getALLEvents);
router.get('/:id', eventController.getEventDetails);
router.post("/singleEvent", eventController.singleEvent);
router.post("/event/:id", eventController.getEventDetails);
router.delete("/delete-event", eventController.deleteEvent);

module.exports = router;