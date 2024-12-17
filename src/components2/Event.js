import React, { useState } from "react";
import "./Event.css";
import Header1 from "./Header1";

const Event = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSave = () => {
    console.log({
      title: eventTitle,
      date: eventDate,
      description: eventDescription,
      image: image,
    });
    alert("Event saved successfully!");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Create a URL for the selected image
    }
  };

  return (
    <div className="e-event-containers">
      <Header1 />
      <div className="e-event-container">
        {/* Header Tabs */}
        <div className="e-event-header">
          <button className="e-tab active">ADD EVENTS</button>
          <button className="e-tab">UPCOMING EVENTS</button>
          <button className="e-tab">PAST EVENTS</button>
          <button className="e-tab">VOLUNTEERS</button>
        </div>

        {/* Event Form */}
        <div className="e-event-form">
          <div className="e-event-icon">
            {image ? (
              <img src={image} alt="Event" className="e-event-image" />
            ) : (
              <label className="file-input-label">
                <input
                  type="file"
                  className="file-input"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                Choose Image
              </label>
            )}
          </div>
          <input
            type="text"
            placeholder="EVENT TITLE"
            className="e-event-input"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <input
            type="datetime-local"
            className="e-event-input"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <textarea
            placeholder="EVENT DESCRIPTION"
            className="e-event-textarea"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          ></textarea>
          <button className="e-save-btn" onClick={handleSave}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Event;
