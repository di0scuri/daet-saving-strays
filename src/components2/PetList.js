import React, { useEffect, useState } from "react";
import Header1 from "./Header1";
import "./PetList.css";
import { db, realtimeDB } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { ref as dbRef, set, push, get, remove } from "firebase/database";

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPetId, setCurrentPetId] = useState(null);
  const [newPet, setNewPet] = useState({
    name: "",
    breed: "",
    age: "",
    description: "",
    image: null,
  });
  const [imageFile, setImageFile] = useState(null);

  // Real-time fetching of pets
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pets"), async (snapshot) => {
      const petsData = [];
      for (const doc of snapshot.docs) {
        const petData = { id: doc.id, ...doc.data() };

        // Fetch image from Realtime Database
        if (petData.imageRef) {
          const imageSnapshot = await get(dbRef(realtimeDB, `pet-images/${petData.imageRef}`));
          petData.image = imageSnapshot.val()?.imageData || "";
        }
        petsData.push(petData);
      }
      setPets(petsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPet = () => {
    setShowModal(true);
    setIsEditMode(false);
    setNewPet({ name: "", breed: "", age: "", description: "", image: null });
  };

  const handleEditPet = (pet) => {
    setShowModal(true);
    setIsEditMode(true);
    setCurrentPetId(pet.id);
    setNewPet({
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      description: pet.description,
      image: pet.image,
    });
  };

  const handleDeletePet = async (petId, imageRef) => {
    try {
      await deleteDoc(doc(db, "pets", petId));

      // Remove the image from Realtime Database
      if (imageRef) {
        await remove(dbRef(realtimeDB, `pet-images/${imageRef}`));
      }
    } catch (error) {
      console.error("Error deleting pet: ", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setNewPet({ ...newPet, image: reader.result });
    };
  };

  const handleSavePet = async () => {
    if (!imageFile && !isEditMode) return;

    try {
      let imageRefKey = null;

      if (imageFile) {
        const imageDbRef = push(dbRef(realtimeDB, "pet-images"));
        await set(imageDbRef, { imageData: newPet.image });
        imageRefKey = imageDbRef.key;
      }

      if (isEditMode && currentPetId) {
        // Update existing pet
        const petDocRef = doc(db, "pets", currentPetId);
        await updateDoc(petDocRef, {
          name: newPet.name,
          breed: newPet.breed,
          age: newPet.age,
          description: newPet.description,
          ...(imageFile && { imageRef: imageRefKey }),
        });
      } else {
        // Add new pet
        const petData = {
          name: newPet.name,
          breed: newPet.breed,
          age: newPet.age,
          description: newPet.description,
          imageRef: imageRefKey,
        };
        await addDoc(collection(db, "pets"), petData);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving pet: ", error);
    }
  };

  return (
    <div className="pet-list-container">
      <Header1 />

      {/* Pet Count */}
      <div className="pet-count">
        <h1 className="pet-count-number">{pets.length}</h1>
        <p className="pet-count-text">Number of Pets Listed for Adoption</p>
      </div>

      {/* Pet Grid */}
      <div className="pet-grid">
        {pets.map((pet) => (
          <div key={pet.id} className="pet-card">
            <img src={pet.image} alt={pet.name} className="pet-image" />
            <p>
              <strong>Name:</strong> {pet.name}
            </p>
            <p>
              <strong>Breed:</strong> {pet.breed}
            </p>
            <p>
              <strong>Age:</strong> {pet.age}
            </p>
            <p>
              <strong>Description:</strong> {pet.description}
            </p>
            <div className="pet-buttons">
              <button className="pl-edit-btn" onClick={() => handleEditPet(pet)}>
                Edit
              </button>
              <button
                className="pl-delete-btn"
                onClick={() => handleDeletePet(pet.id, pet.imageRef)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add Pet Card */}
        <div className="pl-add-pet-card" onClick={handleAddPet}>
          <div className="pl-add-icon">+</div>
          <p className="pl-add-text">Add Pet</p>
        </div>
      </div>

      {/* Add/Edit Pet Modal */}
      {showModal && (
        <div className="pl-modal-overlay">
          <div className="pl-modal">
            <button className="pl-close-btn" onClick={handleCloseModal}>
              X
            </button>
            <h2>{isEditMode ? "Edit Pet" : "Add Pet"}</h2>

            <div className="pl-modal-content">
              <label>
                Pet Name:
                <input
                  type="text"
                  value={newPet.name}
                  onChange={(e) =>
                    setNewPet({ ...newPet, name: e.target.value })
                  }
                />
              </label>
              <label>
                Age:
                <input
                  type="text"
                  value={newPet.age}
                  onChange={(e) =>
                    setNewPet({ ...newPet, age: e.target.value })
                  }
                />
              </label>
              <label>
                Breed:
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) =>
                    setNewPet({ ...newPet, breed: e.target.value })
                  }
                />
              </label>
              <label>
                Description:
                <textarea
                  value={newPet.description}
                  onChange={(e) =>
                    setNewPet({ ...newPet, description: e.target.value })
                  }
                />
              </label>
              <label>
                Add Pet Photos:
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {newPet.image && (
                  <div className="image-preview-box">
                  <p className="image-size-hint">Preview (Max: 150x150 pixels)</p>
                  <img src={newPet.image} alt="Preview" className="image-preview" />
                </div>
                )}
              </label>
              <button className="pl-save-btn" onClick={handleSavePet}>
                {isEditMode ? "Update Pet" : "Add Pet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetList;
