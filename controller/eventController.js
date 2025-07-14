const Event = require("../models/Event.js");
const { VertexAI } = require('@google-cloud/vertexai');

const project = 'gen-lang-client-0981002154';
const location = 'us-central-1';

const vertex_ai = new VertexAI({ project: project, location: location });
const gemini_model_vision = vertex_ai.getGenerativeModel({
  model: 'gemini-pro-vision',
});




async function getEventInfoFromGeminiVision(imageBuffer) {
  try {

    const base64Image = imageBuffer.toString('base64');
    console.log("Base64 Image length:", base64Image.length);
    console.log("Base64 Image start (first 50 chars):", base64Image.substring(0, 50));
    const mimeType = 'image/jpeg';


    const prompt = 'You are an AI assistant designed to extract event details from an image of an event poster. Identify the event\'s title, description, location (city, state, zip if available), venue, date, start time, and end time. If a field is not explicitly found, try to infer it based on context or leave it as null. For date, provide in YYYY-MM-DD format (e.g., 2023-07-08). For time, provide in HH:MM (24-hour) format (e.g., 18:00). If multiple dates/times are mentioned, choose the primary event date/time. For category, use broad terms like \'Music\', \'Sports\', \'Art\', \'Food & Drink\', \'Community\', \'Education\', \'Technology\' For age, use categories like \'All Ages\', \'18+\', \'21+\', \'Family-Friendly\', \'Kids\', \'Teens\', \'Adults\'.';

    const modelParams = {
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ],
      }],
    };

    console.log("Sending image to Gemini Pro Vision for analysis...");


    const result = await gemini_model_vision.generateContent(modelParams);


    console.log("Gemini Vision raw successful response:", JSON.stringify(result.response, null, 2));


    const responseText = result.response.candidates[0].content.parts[0].text;
    console.log("AI extracted event data:", responseText);


    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing AI response text as JSON:", parseError.message);
      console.error("Raw AI response text that failed to parse:", responseText);
      throw new Error("AI response was not valid JSON after extraction.");
    }

    return parsedData;

  }  catch (error) {

  console.error('Full Gemini Vision API Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));



    throw new Error('Failed to get AI response or parse JSON');
  }
}


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
  console.log("--- createEvent function started ---"); // LOG 1: Function entry
  console.log("req.file status:", req.file ? "File exists" : "No file found"); // LOG 2: Check req.file directly
  console.log("req.body content:", req.body); // LOG 3: Check req.body

  try { // Outer try-catch
    const { title, description, location, category, age, date, tags, startTime, endTime } = req.body;
    let thumbnail = null;
    let aiEventData = {};

    if (!req.file) {
      console.log("No file uploaded. Returning 400.");
      return res.status(400).json({ success: false, error: "No image provided for AI analysis. Please upload an image." });
    }

    thumbnail = req.file.buffer;
    console.log("Thumbnail buffer available. Size:", thumbnail.length, "bytes.");

    try { // Inner try-catch for AI processing
      console.log("Sending image to Gemini Pro Vision for analysis...");
      aiEventData = await getEventInfoFromGeminiVision(thumbnail);
      console.log("AI extracted event data:", aiEventData);

      if (aiEventData.error) {
        console.error("Gemini Vision returned an error (from AI data):", aiEventData.error);
        return res.status(500).json({ success: false, error: "AI processing failed: " + aiEventData.error });
      }

    } catch (aiProcessingError) {
      console.error("Caught error during AI processing (Gemini Vision API call):", aiProcessingError.message);
      if (aiProcessingError.message.includes('Authentication') || aiProcessingError.message.includes('permission') || aiProcessingError.message.includes('forbidden')) {
        console.error("HIGH SUSPICION: Authentication/Permission issue with Google Cloud credentials.");
        console.error("Please verify GOOGLE_APPLICATION_CREDENTIALS environment variable and Service Account roles.");
      }
      return res.status(500).json({ success: false, error: "AI analysis failed unexpectedly: " + aiProcessingError.message });
    }

    const finalTitle = aiEventData.title || title;
    const finalDescription = aiEventData.description || description;
    const finalLocation = aiEventData.location && (aiEventData.location.city || aiEventData.location.state || aiEventData.location.zip)
        ? `${aiEventData.location.city || ''}${aiExtractedEventData.location.state ? ', ' + aiExtractedEventData.location.state : ''}${aiExtractedEventData.location.zip ? ' ' + aiExtractedEventData.location.zip : ''}`.trim()
        : (location || null);
    const finalVenue = aiEventData.venue || null;
    const finalCategory = aiEventData.category || category;
    const finalAge = aiEventData.age || age;
    const finalTags = aiEventData.tags || tags;

    const finalDate = aiEventData.date ? new Date(aiEventData.date) : (date ? new Date(date) : null);
    const finalStartTime = aiEventData.startTime ? new Date(`2000-01-01T${aiEventData.startTime}:00`) : (startTime ? new Date(`2000-01-01T${startTime}:00`) : null);
    const finalEndTime = aiEventData.endTime ? new Date(`2000-01-01T${aiExtractedEventData.endTime}:00`) : (endTime ? new Date(`2000-01-01T${endTime}:00`) : null);

    console.log("Attempting to create event in DB with final data.");
    const event = await Event.create({
      thumbnail,
      title: finalTitle,
      uid: 1,
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

    res.status(201).json({ success: true, data: event, id: event.id });

  } catch (outerError) {
    console.error("--- FATAL ERROR IN createEvent function ---");
    console.error("Error details:", outerError.message);
    console.error("Error stack:", outerError.stack);
    res.status(500).json({ success: false, error: "Server Error: " + outerError.message });
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