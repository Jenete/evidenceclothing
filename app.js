// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore , collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
  // Retrieve data from Firebase and populate the product grid
  const productGrid = document.getElementById("product-grid");
  const db = getFirestore(app)
  // Assuming you have a "products" collection in your Firebase database
  const q = collection(db ,"products");
  const productsRef = await getDocs(q);
  // Listen for changes in the collection
  productGrid.innerHTML = ""; // Clear the product grid
  productsRef.forEach((doc) => {
      const productData = doc.data();
      const productElement = createProductElement(productData);
      productGrid.appendChild(productElement);
  });
  
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
    descElement.textContent = "Price: R400\t Size: M|S|XL";
    productElement.appendChild(descElement);

    const buttonElement = document.createElement("btn");
    buttonElement.textContent = "View item";
    buttonElement.classList.add("btn");
    buttonElement.classList.add("btn-dark");
    productElement.appendChild(buttonElement);
    
    productElement.addEventListener("click",()=>{
        document.getElementById("imageTitle").innerHTML = product.title;
        document.getElementById("image").src = product.imageUrl;
        document.getElementById("viewItem").click();

        
    })
    // You can add more details such as price, description, etc.
  
    return productElement;
  }

//   function closePopup() {
//     var popup = document.getElementById('popup');
//     popup.classList.remove('show');
//   }
//   document.getElementById("closePopup").addEventListener('click',()=> {closePopup;});
//  setInterval(function() {
//     var popup = document.getElementById('popup');
//     popup.classList.add('show');
//   },2000);

async function countVisits() {
  let userLocation = "Denied locator";
  console.log("Counting visits...");
  try {
    // Get the current user's location
    userLocation = await getUserLocation();

    
  } catch (error) {
    console.log('User denied geo location use manual count', error);
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

    console.log('Visit details saved successfully'+{
      location: userLocation,
      timestamp: timestamp
    });

  } catch (err) {
    console.log("Firebase error counting visits:\n"+err);
  }
}

// Function to get user's location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    // Implement your logic to retrieve user's location (example: using geolocation API)
    // Replace the following code with your actual implementation

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

// Call the countVisits function when the page loads or when the user performs an action
setTimeout(async ()=>{
  await countVisits();
},3000);
  