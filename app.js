// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
    let i = 0;
    productsRef.forEach((docSnap) => {
      const productData = docSnap.data();
      const productElement = createProductElement(productData, i);
      productGrid.appendChild(productElement);
      i++;
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Function to create a product element
function createProductElement(product, index = 0) {
  const productElement = document.createElement("div");
  productElement.classList.add("product");

  // Staggered animation delay
  productElement.style.animationDelay = `${index * 0.07}s`;

  const imageElement = document.createElement("img");
  imageElement.src = product.imageUrl || "";
  imageElement.alt = product.title || "Product image";
  productElement.appendChild(imageElement);

  const titleElement = document.createElement("h3");
  titleElement.textContent = product.title || "Item";
  productElement.appendChild(titleElement);

  const descElement = document.createElement("p");
  descElement.textContent = product.description || "";
  productElement.appendChild(descElement);

  const priceElement = document.createElement("h3");
  priceElement.textContent = product.price ? `R ${product.price}` : "";
  productElement.appendChild(priceElement);

  const buttonElement = document.createElement("button");
  buttonElement.textContent = "View Item";
  buttonElement.classList.add("btn", "btn-dark");
  productElement.appendChild(buttonElement);

  // When card is clicked, open modal
  productElement.addEventListener("click", () => {
    document.getElementById("imageTitle").innerHTML = product.title || "Item";
    document.getElementById("image").src = product.imageUrl || "";
    document.getElementById("description").innerHTML = product.description || "";

    // trigger bootstrap modal
    const triggerButton = document.getElementById("viewItem");
    if (triggerButton) {
      triggerButton.click();
    }
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
    console.error("Error retrieving user location:", error);
  }

  try {
    const timestamp = serverTimestamp();
    const visitRef = doc(db, "visits", "visitCount");
    const visitDoc = await getDoc(visitRef);

    if (visitDoc.exists()) {
      const count = (visitDoc.data().count || 0) + 1;
      await updateDoc(visitRef, { count });
    } else {
      await setDoc(visitRef, { count: 1 });
    }

    const visitDetailsRef = collection(db, "visits");
    await addDoc(visitDetailsRef, {
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
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        resolve({ latitude, longitude });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// Simple popup show
function initPopup() {
  const popup = document.getElementById("popup");
  if (!popup) return;

  // Show after a delay
  setTimeout(() => {
    popup.classList.add("active");
  }, 8000);

  // Hide on click anywhere on overlay
  popup.addEventListener("click", () => {
    popup.classList.remove("active");
  });
}

// Call functions on page load or user action
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  await countVisits();
  initPopup();
});

// Hide the loading screen when the page is fully loaded
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (!loadingScreen) return;
  loadingScreen.classList.add("hidden");
});
