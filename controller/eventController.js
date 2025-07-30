const Event = require("../models/Event.js");
const { GoogleGenAI } = require("@google/genai");
const multer = require('multer'); // Import multer
const upload = multer(); // Initialize multer for memory storage

const ai = new GoogleGenAI({ apiKey:"AIzaSyBrqrCbjVXIkSCXYnTRTXiNjRzwkaZT5Q8"});
console.log("Does ai have getGenerativeModel?", typeof ai.getGenerativeModel);

const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const { helpers } = require('@google-cloud/aiplatform');

const projectID = 'autofill-466017';
const Location = 'us-central1';

const clientOptions = {
  apiEndpoint: `${Location}-aiplatform.googleapis.com`,
};
const predictionServiceClient = new PredictionServiceClient(clientOptions);

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
        "date": "YYYY-MM-DD string or (eg. Thursday ,20th ) or null",
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

    let aiResponseText;
    if (result && result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0 && result.candidates[0].content.parts[0].text) {
      aiResponseText = result.candidates[0].content.parts[0].text;
    } else {
      console.error("Gemini API response structure unexpected. Could not find text in candidates.");
      console.error("Full Gemini API result object (unexpected structure):", JSON.stringify(result, null, 2));
      throw new Error("Gemini API call failed: Unexpected response structure from model.");
    }

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

exports.generateAiThumbnail = async (req, res) => {
  console.log("Thumbnail Generation started!");
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ success: false, error: 'Description is required for AI thumbnail generation.' });
  }

  try {
    const userPrompt = `Generate a very concise, detailed descriptive prompt for an image generation AI, based on the following event description. Focus on key text elements, colors, mood, and style and . the image is flyer and has all the elements provided(eg.Ai Summit,boston, 9pm to 3am ,july 25, #transformingai).

Event Description: "${description}"


    Example Output: ""A professional and modern flyer for a business technology conference.
    The dominant color scheme is deep blue and white, with a subtle background image of a city skyline from an elevated perspective, blurred to keep focus on the text.
    Key Text Elements (Prominently displayed, bold, and in a clean, sans-serif font):
    "TECH ROUND" (large, white, at the top)"2029" (extremely large, white, central, overlapping the background slightly)

    "THE LATEST IN BUSINESS GROWTH TECHNOLOGY  " (smaller, white, right-aligned next to "2029")

    Sub-sections (on solid blue background blocks with white text):nBlock 1 (below main title):
    "The year's biggest business technology conference is back for the 6th time! Discover new technologies for growing your business. Meet industry leaders and make lasting business connections!"
    (Smaller, clear text)Block 2 (central, largest): "Tuesday April 6 - Friday April 9" (large, bold) and "9AM-7PM DAILY" (slightly smaller, bold) Block 3 (lower):
     "REGISTRATION:" (bold) and "$500 PER PERSON" (very large, bold).Block 4 (bottom): "The Elliot House Hotel" "216 Gladwell Boulevard" "Crested Butte, Colorado" (Standard text, left-aligned).
     Smallest text at the very bottom: "Register @ eventlite.com/techround | facebook.com/techround | techround@events.com"`;
    console.log(`Sending text prompt to Gemini 2.5 Flash for image description: "${description}"`);


    const geminiResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
    });
    let aiGeneratedImagePrompt = null;
    if (geminiResult && geminiResult.candidates && geminiResult.candidates.length > 0 && geminiResult.candidates[0].content && geminiResult.candidates[0].content.parts && geminiResult.candidates[0].content.parts.length > 0 && geminiResult.candidates[0].content.parts[0].text) {
      aiGeneratedImagePrompt = geminiResult.candidates[0].content.parts[0].text;
    }


    if (!aiGeneratedImagePrompt) {
      console.error("Gemini API response structure unexpected. Could not find text prompt for image generation.");
      throw new Error("Gemini API call failed: Unexpected response structure from model for text prompt.");
    }


    console.log("Gemini generated image prompt:", aiGeneratedImagePrompt);

    console.log("Sending prompt to Vertex AI Imagen for image generation...");

    const endpoint = `projects/${projectID}/locations/${Location}/publishers/google/models/imagen-4.0-generate-preview-06-06`;// For Imagen 2

    const instance = helpers.toValue({
      prompt: aiGeneratedImagePrompt,

    });

    const parameters = helpers.toValue({
      sampleCount: 1,
      aspectRatio: "1:1",
    });

    const request = {
      endpoint,
      instances: [instance],
      parameters,
    };

    const [response] = await predictionServiceClient.predict(request);

    let generatedImgBase64 = null;
    let generatedImgMimeType = null;

    if (response.predictions && response.predictions.length > 0) {
      const prediction = helpers.fromValue(response.predictions[0]);
      if (prediction.bytesBase64Encoded) {
        generatedImgBase64 = prediction.bytesBase64Encoded;
        generatedImgMimeType = 'image/png'; // Imagen 2 typically outputs PNGs
      }
    }

    if (generatedImgBase64) {
      console.log("Vertex AI Imagen image generated successfully!");
      res.status(200).json({
        success: true,
        imageData: generatedImgBase64,
        mimeType: generatedImgMimeType,
        aiPrompt: aiGeneratedImagePrompt
      });
    } else {
      console.error("Vertex AI Imagen did not return an image. Full response:", JSON.stringify(response, null, 2));
      res.status(500).json({ success: false, error: 'Vertex AI Imagen did not return an image.', details: "No image data found in Vertex AI response." });
    }

  } catch (error) {
    console.error('Full Error during AI image generation process (Vertex AI):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({ success: false, error: 'Server error during AI thumbnail generation.', details: error.message });
  }
};

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
  console.log("req.file status:", req.file ? `File exists (size: ${req.file.size} bytes, mimetype: ${req.file.mimetype})` : "No file found");
  console.log("req.body content:", req.body);

  let thumbnailBuffer = null;
  let thumbnailMimeType = null;

  try {
    // Multer populates req.file when a file is uploaded
    if (req.file && req.file.buffer) {
      thumbnailBuffer = req.file.buffer; // Store the binary buffer
      thumbnailMimeType = req.file.mimetype; // Store the MIME type
      console.log(`[createEvent] Thumbnail buffer and mimetype received for DB storage. MimeType: ${thumbnailMimeType}`);
    } else {
      console.log("[createEvent] No image file uploaded via multer for this event creation.");
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
      thumbnailData: thumbnailBuffer ? 'BUFFER_EXISTS' : null,
      thumbnailMimeType: thumbnailMimeType,
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
      thumbnailData: thumbnailBuffer,    // Save the buffer to the new field
      thumbnailMimeType: thumbnailMimeType, // Save the MIME type to the new field
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
      console.log(`[getEventDetails] Fetched event ID ${id}. Thumbnail URL available: ${!!event.thumbnailUrl}`); // Check if thumbnailUrl is present
      res.render("event-view-page", { event });
    } else {
      // Corrected error handling: ensure 'error' view exists or send JSON
      console.warn(`[getEventDetails] Event ID ${id} not found.`);
      // You should have an 'error.ejs' file in your views directory for this to work
      res.status(404).render("error", { message: "Event not found" });
    }
  } catch (error) {
    console.error("Error getting event details in controller:", error);
    res.status(500).render("error", { message: "Server Error: " + error.message }); // Added error message for clarity
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