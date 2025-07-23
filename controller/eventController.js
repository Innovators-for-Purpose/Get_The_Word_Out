const Event = require("../models/Event.js");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey:"AIzaSyBrqrCbjVXIkSCXYnTRTXiNjRzwkaZT5Q8"});

async function getEventInfoFromGeminiVision(imageBuffer, mimeType) {
  try {
    const base64Image = imageBuffer.toString('base64');

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


    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ],
      }],
    });

    // CRITICAL FIX: Directly access content from candidates array
    let aiResponseText;
    if (result && result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0 && result.candidates[0].content.parts[0].text) {
      aiResponseText = result.candidates[0].content.parts[0].text;
    } else {
      console.error("Gemini API response structure unexpected. Could not find text in candidates.");
      console.error("Full Gemini API result object (unexpected structure):", JSON.stringify(result, null, 2));
      throw new Error("Gemini API call failed: Unexpected response structure from model.");
    }
    // END CRITICAL FIX

    console.log("AI raw response text:", aiResponseText);

    let parsedData = {};
    try {
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
    console.error('Full Gemini API Error Object (from catch block):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error('Failed to get AI response or parse JSON: ' + error.message);
  }
}

exports.getAutofillPreview = async (req, res) => {
  console.log("--- getAutofillPreview function started ---");
  console.log("req.file status:", req.file ? "File exists (size: " + req.file.size + " bytes)" : "No file found");

  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: "No image file uploaded for autofill preview." });
    }

    const thumbnailBuffer = req.file.buffer;
    const thumbnailMimeType = req.file.mimetype;
    console.log("Sending image to Gemini for analysis (for preview)...");

    const aiData = await getEventInfoFromGeminiVision(thumbnailBuffer , thumbnailMimeType);
    console.log("AI extracted data for preview (raw AI output):", aiData);

    if (aiData.date) {
      const parsedDate = new Date(aiData.date);
      if (!isNaN(parsedDate.getTime())) {
        aiData.date = parsedDate.toISOString().split('T')[0];
      } else {
        console.warn(`[getAutofillPreview] AI returned unparseable date: "${aiData.date}". Setting to null.`);
        aiData.date = null;
      }
    } else {
      aiData.date = null;
    }

    aiData.startTime = aiData.startTime || null;
    aiData.endTime = aiData.endTime || null;

    res.status(200).json({ success: true, data: aiData });

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

  let thumbnailData = null;

  try {
    if (req.file && req.file.buffer) {
      thumbnailData = req.file.buffer;
      console.log("Thumbnail buffer received for DB storage.");
    }
    else{
      console.log("No image file uploaded");
    }

    const {
      title,
      description,
      location,
      venue,
      category,
      age,
      date,
      startTime,
      endTime,
      tags,
      uid
    } = req.body;

    const finalTitle = title || "Untitled Event";
    const finalDescription = description || "No description provided.";
    const finalVenue = venue || "To Be Determined";
    const finalUid = uid || 1;

    let finalLocation = "Unknown Location";
    if (typeof location === 'object' && location !== null) {
      if (location.city || location.state || location.zip) {
        finalLocation = `${location.city || ''}${location.state ? ', ' + location.state : ''}${location.zip ? ' ' + location.zip : ''}`.trim();
      }
    } else if (location) {
      finalLocation = location;
    }

    let finalDate = null;
    if (date) {
      try {
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          finalDate = parsed.toISOString().split('T')[0];
        } else {
          console.warn(`[createEvent] Invalid date string received: "${date}". Defaulting to current date.`);
          finalDate = new Date().toISOString().split('T')[0];
        }
      } catch (e) {
        console.error(`[createEvent] Error parsing date "${date}":`, e.message);
        finalDate = new Date().toISOString().split('T')[0];
      }
    } else {
      console.warn(`[createEvent] Date not provided. Defaulting to current date.`);
      finalDate = new Date().toISOString().split('T')[0];
    }

    const finalStartTime = startTime || "00:00";
    const finalEndTime = endTime || "23:59";

    const categoryMap = {
      "STEAM": "STEAM", "Music": "Music", "Art": "Art",
      "Entertainment": "Entertainment", "Technology": "Technology",
      "Conference": "Technology",
      "Community Service": "Other"
    };
    const finalCategory = categoryMap[category] || "Other";

    const ageMap = {
      "Kids/1-7": "Kids/1-7", "Pre-teen/7-12": "Pre-teen/7-12", "Teen/13-17": "Teen/13-17",
      "Young Adults/18-25": "Young Adults/18-25", "Adults/25-65": "Adults/25-65", "Senior/65+": "Senior/65+",
      "All Ages": "Adults/25-65",
      "18+": "Young Adults/18-25",
      "N/A": "Adults/25-65"
    };
    const finalAge = ageMap[age] || "Adults/25-65";

    const finalTags = (tags && Array.isArray(tags)) ? tags : (tags ? [tags] : null);

    console.log("Attempting to create event in DB with final data:");
    console.log({
      thumbnail: thumbnailData ? 'BUFFER_EXISTS' : null,
      title: finalTitle,
      uid: finalUid,
      description: finalDescription,
      location: finalLocation,
      venue: finalVenue,
      time: finalStartTime,
      category: finalCategory,
      age: finalAge,
      date: finalDate,
      tags: finalTags,
      startTime: finalStartTime,
      endTime: finalEndTime
    });

    const event = await Event.create({
      thumbnail: thumbnailData,
      title: finalTitle,
      uid: finalUid,
      description: finalDescription,
      location: finalLocation,
      venue: finalVenue,
      time: finalStartTime,
      category: finalCategory,
      age: finalAge,
      date: finalDate,
      tags: finalTags,
      startTime: finalStartTime,
      endTime: finalEndTime,
    });

    console.log("Event created in DB successfully. ID:", event.id);

    res.status(201).json({ success: true, event: event.toJSON(), id: event.id });

  } catch (outerError) {
    console.error("--- FATAL ERROR IN createEvent function ---");
    console.error("Error details:", outerError.message);
    console.error("Error stack:", outerError.stack);
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