import React, { useEffect, useState } from 'react';
import './AdoptionCards.css';
import adoptbg from '../assets/adoptbg.png';
import { db, realtimeDB } from '../config/firebase'; // Import Firestore and Realtime Database
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';

const AdoptionCards = () => {
  const [pets, setPets] = useState([]); // State for pets
  const [selectedId, setSelectedId] = useState(null); // Selected pet ID
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    address: '',
    dateOfVisit: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch pets and images
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pets'));
        const petsList = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const imageRef = data.imageRef; // Image reference for RTDB

          let imageData = 'https://via.placeholder.com/150'; // Default fallback image

          // Fetch imageData from Realtime Database if imageRef exists
          if (imageRef) {
            const imageSnapshot = await get(ref(realtimeDB, `pet-images/${imageRef}/imageData`));
            if (imageSnapshot.exists()) {
              imageData = imageSnapshot.val(); // Base64 image data
            }
          }

          petsList.push({
            id: doc.id,
            name: data.name || 'Unknown',
            description: data.description || 'No description available.',
            story: data.story || '',
            image: imageData, // Store Base64 image
          });
        }

        setPets(petsList);
      } catch (error) {
        console.error('Error fetching pets or images:', error);
      }
    };

    fetchPets();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.match(/^[A-Za-z]+$/)) {
      newErrors.firstName = 'First name must contain only letters.';
    }
    if (!formData.lastName.match(/^[A-Za-z]+$/)) {
      newErrors.lastName = 'Last name must contain only letters.';
    }
    if (!formData.emailAddress.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.emailAddress = 'Please enter a valid email address.';
    }
    if (!formData.address) {
      newErrors.address = 'Address cannot be empty.';
    }
    if (!formData.dateOfVisit) {
      newErrors.dateOfVisit = 'Date of visit cannot be empty.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert(Object.values(newErrors).join('\n'));
      return false;
    }
    return true;
  };

  // Form submission
  const handleConfirm = async () => {
    if (validateForm()) {
      try {
        const adopterData = {
          petId: selectedId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailAddress: formData.emailAddress,
          address: formData.address,
          dateOfVisit: formData.dateOfVisit,
          status: "pending",
        };

        await addDoc(collection(db, 'adopters'), adopterData);
        alert('Adoption form submitted successfully!');
        setIsModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          emailAddress: '',
          address: '',
          dateOfVisit: '',
        });
      } catch (error) {
        console.error('Error saving adoption data:', error);
        alert('Failed to save adoption details. Please try again.');
      }
    }
  };

  // Open modal
  const handleAdoptClick = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="adoption-header" style={{ backgroundImage: `url(${adoptbg})` }}>
        <h1>Adopt a Friend</h1>
        <p>Discover the joy of adopting a pet and give them a loving home.</p>
      </div>

      {/* Cards */}
      <div className="cards-container">
        {pets.map((pet) => (
          <div key={pet.id} className="card">
            <img
              src={pet.image}
              alt={pet.name}
              className="card-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150'; // Fallback image
              }}
            />
            <h3 className="card-name">{pet.name}</h3>
            <p className="card-description">{pet.description}</p>
            <p className="card-story">{pet.story}</p>
            <button onClick={() => handleAdoptClick(pet.id)} className="adopt-button">
              Adopt Me
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <img
                src={selectedId ? pets.find((pet) => pet.id === selectedId)?.image : ''}
                alt="Selected Pet"
                className="modal-image"
              />
              <div>
                <h2>{selectedId ? pets.find((pet) => pet.id === selectedId)?.name : ''}</h2>
                <p>{selectedId ? pets.find((pet) => pet.id === selectedId)?.description : ''}</p>
              </div>
            </div>

            <h2 className="modal-title">Adoption Form</h2>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="text"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date of Visit</label>
              <input
                type="date"
                value={formData.dateOfVisit}
                onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
              />
            </div>

            <button className="confirm-btn" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdoptionCards;



