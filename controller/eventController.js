const Event = require("../models/Event.js");


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
  try {

    const { title, description, location, time, category, age, date, tags } = req.body;
    
    let thumbnail = null;
    if (req.file) {
      thumbnail = req.file.buffer;
    }

    // let tags = "hahaha tags here";

    const event = await Event.create({
      thumbnail,
      title, 
      uid: 1,
      description, 
      location, 
      venue: "venue", 
      time, 
      category: 1, 
      age: 1, 
      date,
      tags
    });

    res.status(201).json({ success: true, data: event, id: event.id });

  } catch (error) {
    console.error("Error creating event in controller:", error);
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
/**exports.editEvent = async (req, res) => {
  try {
    const {id, title, thumbnail, vid, description, location, venue, time, catagory, age, date} = req.body;
    previewButton.addEventListener('click', (event) => {
      event.preventDefault();

      const previewFields = [
        {label: 'Event Title', value: document.getElementsByName('title')[0].value},
        {label: 'Event Description', value: document.getElementsByName('description')[0].value},
        {label: 'Date', value: document.getElementsByName('date')[0].value},
        {label: 'Time', value: document.getElementsByName('time')[0].value},
        {label: 'Location', value: document.getElementsByName('location')[0].value},
      ];

      if (form.checkValidity()) {
        previewContent.innerHTML = "";

        // Add image preview if file is selected
        const thumbnailFile = document.getElementsByName('thumbnail')[0].files[0];
        if (thumbnailFile) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(thumbnailFile);
          img.style.maxWidth = '200px'; // Optional: control preview size
          previewContent.appendChild(img);
        }


        // {
        //     label: 'Age Range',
        //     value: ageRangeMap[document.getElementsByName('age')[0].value]
        // },
        // {
        //     label: 'Category',
        //     value: categoryMap[document.getElementsByName('category')[0].value]
        // }
        ;

        if ("0" in document.getElementsByName('thumbnail')[0].files) {
          previewFields.push({
            label: 'Event Thumbnail',
            image: document.getElementsByName('thumbnail')[0].files[0],
            value: document.getElementsByName('thumbnail')[0].files[0].name,
            size: document.getElementsByName('thumbnail')[0].files[0].size,
            type: document.getElementsByName('thumbnail')[0].files[0].type
          })
        }
        console.log(previewFields);

        previewFields.forEach(field => {
          const previewItem = document.createElement('div');

          previewItem.classList.add('preview-item');
          previewItem.innerHTML = `
                        <strong>${field.label}:</strong>
                        <span>${field.value}</span>
                    `;
          previewContent.appendChild(previewItem);
        });

        previewModal.style.display = 'block';
      } else {
        form.reportValidity();
      }
    });

}
*/






