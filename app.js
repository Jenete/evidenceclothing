// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// Retrieve data from Firebase and populate the product grid
const productGrid = document.getElementById("product-grid");

async function fetchProducts() {
  try {
    const q = collection(db, "products");
    const productsRef = await getDocs(q);

    productGrid.innerHTML = ""; // Clear the product grid
    productsRef.forEach((doc) => {
      const productData = doc.data();
      const productElement = createProductElement(productData);
      productGrid.appendChild(productElement);
    });

  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Function to create a product element
function createProductElement(product) {
  const productElement = document.createElement("div");
  productElement.classList.add("product");

  const imageElement = document.createElement("img");
  imageElement.src = product.imageUrl;
  productElement.appendChild(imageElement);

  const titleElement = document.createElement("h3");
  titleElement.textContent = product.title;
  productElement.appendChild(titleElement);

  const descElement = document.createElement("p");
  descElement.textContent = product.description;
  productElement.appendChild(descElement);

  const priceElement = document.createElement("h3");
  priceElement.textContent = `${product.price}`;
  productElement.appendChild(priceElement);

  const buttonElement = document.createElement("button");
  buttonElement.textContent = "View Item";
  buttonElement.classList.add("btn");
  buttonElement.classList.add("btn-dark");
  productElement.appendChild(buttonElement);

  productElement.addEventListener("click", () => {
    document.getElementById("imageTitle").innerHTML = product.title;
    document.getElementById("image").src = product.imageUrl;
    document.getElementById("description").innerHTML = product.description;
    document.getElementById("viewItem").click();
  });

  return productElement;
}

// Function to count visits
async function countVisits() {
  let userLocation = "Unknown location";

  try {
    // Get the current user's location
    userLocation = await getUserLocation();
  } catch (error) {
    console.error('Error retrieving user location:', error);
  }

  try {
    // Get the current timestamp
    const timestamp = serverTimestamp();

    // Increment the visit count in the 'visits' collection
    const visitRef = doc(db, 'visits', 'visitCount');
    const visitDoc = await getDoc(visitRef);

    if (visitDoc.exists()) {
      const count = visitDoc.data().count + 1;
      await updateDoc(visitRef, { count });
    } else {
      await setDoc(visitRef, { count: 1 });
    }

    // Save the visit details in a separate collection called 'visits'
    const visitDetailsRef = collection(db, 'visits');
    await addDoc(visitDetailsRef, {
      location: userLocation,
      timestamp: timestamp
    });

    console.log('Visit details saved successfully:', {
      location: userLocation,
      timestamp: timestamp
    });

  } catch (error) {
    console.error("Firebase error counting visits:", error);
  }
}

// Function to get user's location (example implementation)
function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        resolve({ latitude, longitude });
      },
      error => {
        reject(error);
      }
    );
  });
}

// Call functions on page load or user action
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  await countVisits();
});

// Hide the loading screen when the page is fully loaded
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "none";
});
