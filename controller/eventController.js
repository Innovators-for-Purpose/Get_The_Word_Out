const Event = require("../models/Event.js");
const { GoogleGenAI } = require("@google/genai");
const path = require('path');
const fs = require('fs');


const ai = new GoogleGenAI({ apiKey: AIzaSyDR4s4yOiGvgJwPhv9ZHNjW3evu66yvwww });

async function getEventInfoFromGeminiVision(imageBuffer,mimeType) {
  try {
    const base64Image = imageBuffer.toString('base64');
    console.log("Base64 Image length:", base64Image.length);
    console.log("Base64 Image start (first 50 chars):", base64Image.substring(0, 50));
    //const mimeType = 'image/jpeg';

    const prompt = `
    You are an AI assistant designed to extract event details from an image of an event poster.
    Your response must be a JSON object with the following exact keys and data types.
    If a field is not present or cannot be determined, provide null for its value.
    Do NOT include any additional text or formatting outside the JSON.

    {
        "title": "string or null",
        "description": "string or null",
        "location": {
            "city": "string or null",
            "state": "string or null",
            "zip": "string or null"
        },
        "venue": "string or null",
        "date": "YYYY-MM-DD string or (eg. Thursday ,20th) or null",
        "startTime": "HH:MM (24-hour) string or null",
        "endTime": "HH:MM (24-hour) string or null",
        "category": "string or null",
        "ageSuitability": "string (e.g., 'All Ages', '18+', 'Adults') or null",
        "tags": "array of strings or null"
    }
    `;

    console.log("Sending image to Gemini for analysis...");

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Using gemini-1.5-flash as previously recommended for speed/cost
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ],
      }],
    });

    const aiResponseText = result.response.text();
    console.log("AI raw response text:", aiResponseText);

    let parsedData = {};
    try {
      // Attempt to find and parse JSON within markdown fences
      const jsonStartIndex = aiResponseText.indexOf('```json');
      const jsonEndIndex = aiResponseText.lastIndexOf('```');

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        const jsonString = aiResponseText.substring(jsonStartIndex + '```json'.length, jsonEndIndex).trim();
        parsedData = JSON.parse(jsonString);
      } else {

        console.warn("AI response did not contain expected '```json' markdown block. Attempting direct JSON parse.");
        parsedData = JSON.parse(aiResponseText);
      }
    } catch (parseError) {
      console.error("Error parsing AI response text as JSON:", parseError.message);

      const cleanedText = aiResponseText.replace(/```json\n|\n```/g, '').trim();
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (reparseError) {
        console.error("Failed to re-parse cleaned AI response as JSON:", reparseError.message);
        throw new Error("AI response was not valid JSON and could not be cleaned.");
      }
    }

    return parsedData;

  } catch (error) {
    console.error('Full Gemini API Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error('Failed to get AI response or parse JSON: ' + error.message);
  }
}


function parseEventDate(dateString) {
  if (!dateString) {
    return null;
  }

  const cleanedDateString = String(dateString) // Ensure it's a string
      .trim()
      .replace(/(\d+)(st|nd|rd|th)/g, '$1'); // e.g., "20th" -> "20"

  let parsedDate = null;


  if (cleanedDateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    parsedDate = new Date(cleanedDateString + 'T00:00:00');
  }

  else if (cleanedDateString.match(/^\d{2}-\d{2}$/)) {
    const currentYear = new Date().getFullYear();
    parsedDate = new Date(`${currentYear}-${cleanedDateString}T00:00:00`);
  }

  else {
    try {
      parsedDate = new Date(cleanedDateString);
    } catch (e) {
      console.warn(`Error trying to parse date string "${cleanedDateString}":`, e.message);
      parsedDate = null;
    }
  }


  if (parsedDate && !isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }

  console.warn(`Failed to parse and format date string "${dateString}" (cleaned: "${cleanedDateString}") to YYYY-MM-DD.`);
  return null;
}


exports.getAutofillPreview = async (req, res) => {
  console.log("--- getAutofillPreview function started ---");
  console.log("req.file status:", req.file ? "File exists (size: " + req.file.size + " bytes)" : "No file found");

  try {
    if (!req.file || !req.file.buffer) { // Ensure buffer exists
      return res.status(400).json({ success: false, error: "No image file uploaded for autofill preview." });
    }

    const thumbnailBuffer = req.file.buffer; // Get the image buffer for AI
    console.log("Sending image to Gemini for analysis (for preview)...");

    const aiData = await getEventInfoFromGeminiVision(thumbnailBuffer); // Perform AI analysis
    console.log("AI extracted data for preview (raw AI output):", aiData);

    res.status(200).json({ success: true, data: aiData }); // Send AI data back to frontend

  } catch (error) {
    console.error("--- ERROR IN getAutofillPreview function ---");
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, error: "AI Autofill Preview Error: " + error.message });
  }
};


exports.createEvent = async (req, res) => {
  console.log("--- createEvent function started ---");
  console.log("req.file status:", req.file ? "File exists (size: " + req.file.size + " bytes)" : "No file found");
  console.log("req.body content:", req.body);

  let thumbnailFilename = null; // Initialize here

  try {

    if (req.file && req.file.buffer) { // Check if a file was uploaded and has content

      const uniqueFilename = `${Date.now()}-${req.file.originalname}`;


      const uploadDir = path.join(__dirname, '../public/images'); // <--- CORRECTED TO 'image'
      const uploadPath = path.join(uploadDir, uniqueFilename);     // Full path including filename

      // 3. Ensure the directory exists. Create it recursively if it doesn't.
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Ensured directory exists: ${uploadDir}`);

      // 4. Manually save the buffer (file content) to disk
      fs.writeFileSync(uploadPath, req.file.buffer);
      console.log(`Thumbnail saved to: ${uploadPath}`);

      // 5. Store this generated filename for the database
      thumbnailFilename = uniqueFilename;
    }
    // --- END: MANUAL FILE SAVING LOGIC ---

    const { title, description, location, venue, category, age, date, tags, startTime, endTime, uid } = req.body;

    // --- Date Parsing: Corrected to handle Date object or null ---
    let finalDate = null;
    if (date) {
      try {
        const parsed = new Date(date); // Attempt to create Date object
        if (!isNaN(parsed.getTime())) { // Check if it's a valid date
          finalDate = parsed; // Store as Date object
        } else {
          console.warn(`[createEvent] Invalid date string received: "${date}". Storing as null.`);
        }
      } catch (e) {
        console.error(`[createEvent] Error parsing date "${date}":`, e.message);
      }
    }

    // Ensure values are null if not provided, for notNull violation handling
    const finalStartTime = startTime || null;
    const finalEndTime = endTime || null;
    const finalUid = uid || 1;
    const finalTitle = title || null; // Added for not null violation if title is required
    const finalDescription = description || null; // Added for not null violation if description is required
    const finalVenue = venue || null;
    const finalCategory = category || null;
    const finalAge = age || null; // Age can be null if not provided
    const finalTags = (tags && Array.isArray(tags)) ? tags : (tags ? [tags] : null); // Ensure tags is an array or null

    // Handle location, which might come as an object from AI or a string from manual input
    const finalLocation = typeof location === 'object' && location !== null && (location.city || location.state || location.zip)
        ? `${location.city || ''}${location.state ? ', ' + location.state : ''}${location.zip ? ' ' + location.zip : ''}`.trim()
        : (location || null);

    console.log("Attempting to create event in DB with final data:");
    console.log({
      thumbnail: thumbnailFilename, // THIS WILL NOW BE YOUR GENERATED FILENAME
      title: finalTitle,
      uid: finalUid,
      description: finalDescription,
      location: finalLocation,
      venue: finalVenue,
      category: finalCategory,
      age: finalAge,
      date: finalDate, // Now a Date object or null
      tags: finalTags, // Now an array or null
      startTime: finalStartTime,
      endTime: finalEndTime
    });

    const event = await Event.create({
      thumbnail: thumbnailFilename,
      title: finalTitle,
      uid: finalUid,
      description: finalDescription,
      location: finalLocation,
      venue: finalVenue,
      category: finalCategory,
      age: finalAge,
      date: finalDate,
      tags: finalTags,
      startTime: finalStartTime,
      endTime: finalEndTime
    });

    console.log("Event created in DB successfully. ID:", event.id);

    res.status(201).json({ success: true, event: event.toJSON(), id: event.id });

  } catch (outerError) {
    console.error("--- FATAL ERROR IN createEvent function ---");
    console.error("Error details:", outerError.message);
    console.error("Error stack:", outerError.stack);

    if (thumbnailFilename && fs.existsSync(path.join(__dirname, '../public/images', thumbnailFilename))) {
      try {
        fs.unlinkSync(path.join(__dirname, '../public/images', thumbnailFilename));
        console.warn(`Cleaned up partially saved file: ${thumbnailFilename}`);
      } catch (cleanupError) {
        console.error(`Error cleaning up file ${thumbnailFilename}:`, cleanupError.message);
      }
    }
    res.status(500).json({ success: false, error: "Server Error: " + outerError.message });
  }
};


exports.getALLEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.render('event-list', { events: events });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

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

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.body;
    await Event.destroy({where: {id: id}});
    res.status(202).json({ success: true });
  } catch (error) {
    console.error("Error deleting event in controller:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};