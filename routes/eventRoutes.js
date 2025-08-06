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

router.post('/generateThumbnail', eventController.generateAiThumbnail);
router.post('/eventForm', upload.single('thumbnail'), eventController.createEvent);
router.post('/autofill-preview', upload.single('thumbnail'), eventController.getAutofillPreview);
router.get('/', eventController.getALLEvents);
router.get('/:id', eventController.getEventDetails);
router.get('/event/:id', eventController.getEventDetails);
router.post("/event", eventController.singleEvent);
router.post("/event/:id", eventController.getEventDetails);
router.delete("/delete-event", eventController.deleteEvent);
router.get('/', eventController.getALLEvents);
router.get('/:id/thumbnail', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event || !event.thumbnail) {
            return res.status(404).send('Thumbnail not found.');
        }

        res.set('Content-Type', 'image/jpeg');

        res.send(event.thumbnail);
    } catch (error) {
        console.error('Error serving thumbnail for event ID:', req.params.id, error);
        res.status(500).send('Server error serving thumbnail.');
    }
});

module.exports = router;