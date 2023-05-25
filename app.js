// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore , collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
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

  