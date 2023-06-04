
if (localStorage.getItem("code")){

}
else{
    while (prompt("Enter security code").toLowerCase()!="evidence23");
    localStorage.setItem("code", true);
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore , collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

let dataItem = {
    price: "",
    description: "",
    imageUrl: "",
    title: "",
    set: false,
    id: "",
}
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB77d5fX4Mq6w0tRiIl9_03IpWegyxDZrE",
    authDomain: "app-v1-6f6fb.firebaseapp.com",
    projectId: "app-v1-6f6fb",
    storageBucket: "app-v1-6f6fb.appspot.com",
    messagingSenderId: "616453324690",
    appId: "1:616453324690:web:9611d4d03821afef934b4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const storageRef = ref(storage, "images");
// Function to retrieve data from Firebase and populate the product grid
// async function getData() {
//     const productGrid = document.getElementById("product-grid");
//     productGrid.innerHTML = ""; // Clear the product grid

//     try {
//     const querySnapshot = await getDocs(collection(db, "products"));

//     querySnapshot.forEach((doc) => {
//         const productData = doc.data();
//         const productElement = createProductElement(productData);
//         productGrid.appendChild(productElement);
//     });
//     } catch (error) {
//     console.log("Error retrieving data:", error);
//     }
// }

// Function to upload data to Firebase
async function uploadData(data) {
    try {
    await addDoc(collection(db, "products"), data);
    console.log("Data uploaded successfully");
    } catch (error) {
    console.log("Error uploading data:", error);
    }
}

// Function to update data in Firebase
async function updateData(docId, newData) {
    try {
    await updateDoc(doc(db, "products", docId), newData);
    console.log("Data updated successfully");
    } catch (error) {
    console.log("Error updating data:", error);
    }
}

// Function to create a product element
function createProductElement(product) {
    const productElement = document.createElement("div");
    productElement.classList.add("product");

    // Create and append other elements

    return productElement;
}

document.getElementById("doneButton").addEventListener('click',async (event)=>{
    event.preventDefault();
    
    const uploadForm = document.getElementById("uploadForm");
    const pictureInput = document.getElementById("picture");
    const itemTitleInput = document.getElementById("itemTitle");
    const descriptionInput = document.getElementById("description");
    const priceInput = document.getElementById("price");
    

    // Get the values from the form inputs
    const picture = pictureInput.files[0];
    const itemTitle = itemTitleInput.value;
    const description = descriptionInput.value;
    const price = priceInput.value;
    // Validate the fields
    if (!picture || !itemTitle || !description || !price) {
        // Display an error message or perform some action indicating validation failure
        alert("Please fill in all fields");
        return; // Exit the function if validation fails
    }
    const progressBar = document.getElementById("progressBar");
    
    let submit = confirm("Add the item to database?");
    if(submit){
        
        
        let data = null;
        try{    
            const formElements = uploadForm.querySelectorAll("input, textarea, select, button");
            formElements.forEach((element) => {
            element.disabled = true;
            })
        // Upload the image to Firebase Storage
            const storagePath = `${Date.now()}_${picture.name}`;
            const imageRef = ref(storageRef, storagePath);
            await uploadBytes(imageRef, picture);

            const uploadTask = uploadBytesResumable(imageRef, picture);

            // Update progress bar during the upload
            uploadTask.on("state_changed", (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.value = progress;
            });

            // Wait for the upload to complete
            await uploadTask;
            // Create the data object with the image URL
            const imageUrl = await getDownloadURL(imageRef);
            const title = itemTitle;
            data = {
                imageUrl,
                title,
                description,
                price,
            };

            // Save the data to Firestore
            await addDoc(collection(db, "products"), data);
            // Display success message or perform any additional actions
            console.log("Image uploaded and data saved successfully!");
            // Do something with the data
            console.log(data);
        }catch(err){
            alert("Something went wrong... Check your internet connection and try again.");
            console.log("Error: "+err);
            return;
        }
        
        
        // You can send the data to the server or perform any other operation
        if(data) {dataItem.id = data.itemTitle;
        dataItem.imageUrl = data.imageUrl;
        dataItem.price = data.price;
        dataItem.set = true;
        dataItem.description = data.description;
        dataItem.title = data.itemTitle;
        
        alert("Submitted successfully! \n\nClick on ViewOnline to check it out.");
        document.getElementById('imagePreview').style.display = 'none';
        displayPreviewModal(data);}
        progressBar.value = 0;
        // Reset the form
        uploadForm.reset();
        const formElements = uploadForm.querySelectorAll("input, textarea, select, button");
        formElements.forEach((element) => {
        element.disabled = false;
        })
    }
})
const uploadForm = document.getElementById("uploadForm");
const modal = document.getElementById("previewModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
// Close the modal when the close button is clicked
document.getElementById("closeModalButton").addEventListener("click", closeModal);

// Close the modal when the user clicks outside the modal
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
//
document.getElementById("viewButton").addEventListener("click", (event) => {
    let submit = confirm("Leave this page?");
    if(submit){
    window.open("./index.html");}
  });

function displayPreviewModal(data) {
     // Set the modal content
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalPrice.textContent = `Price: ${data.price}`;

    // Set the image source after loading to prevent caching
    modalImage.onload = function () {
        modal.style.display = "block"; // Open the modal after the image has loaded
    };
    modalImage.src = data.imageUrl;
  }
  
  function closeModal() {
    // Close the modal and reset the form
    modal.style.display = "none";
    uploadForm.reset();
  }
  // Hide the loading screen when the page is fully loaded
  window.addEventListener("load", function() {
    this.setTimeout(()=>{
        var loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.display = "none";
    },3000)
    
  });