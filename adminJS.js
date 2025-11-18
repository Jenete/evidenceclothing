// Admin code for Deskly / Evidence Clothing
// Requires: admin.html + admin.css

// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// ---- CONFIG ----

const ADMIN_CODE = "evidence23";

// Firebase config
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
const storageRootRef = ref(storage, "images");

// ---- DOM ELEMENTS ----

const loadingScreen = document.getElementById("loading-screen");

const authPanel = document.getElementById("authPanel");
const mainPanel = document.getElementById("mainPanel");
const loginForm = document.getElementById("loginForm");
const adminCodeInput = document.getElementById("adminCode");
const authError = document.getElementById("authError");

const uploadForm = document.getElementById("uploadForm");
const imageInput = document.getElementById("picture");
const titleInput = document.getElementById("itemTitle");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const progressBar = document.getElementById("progressBar");
const imagePreview = document.getElementById("imagePreview");
const imagePlaceholder = document.getElementById("imagePlaceholder");
const submitLabel = document.getElementById("submitLabel");
const formTitle = document.getElementById("formTitle");
const cancelEditButton = document.getElementById("cancelEditButton");

const productListEl = document.getElementById("productList");
const viewButton = document.getElementById("viewButton");
const logoutButton = document.getElementById("logoutButton");

// Modal
const previewModal = document.getElementById("previewModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const closeModalButton = document.getElementById("closeModalButton");

// State
let currentEditId = null;
let currentEditImageUrl = null;

// ---- BOOTSTRAP APP ----

document.addEventListener("DOMContentLoaded", () => {
  // Loading
  setTimeout(() => {
    if (loadingScreen) loadingScreen.style.display = "none";
  }, 1500);

  // Check localStorage for previous login
  if (localStorage.getItem("code") === "true") {
    showMainPanel();
    fetchProducts();
  } else {
    showAuthPanel();
  }

  // Events
  loginForm.addEventListener("submit", handleLogin);
  uploadForm.addEventListener("submit", handleSubmitProduct);
  imageInput.addEventListener("change", handleImagePreview);
  cancelEditButton.addEventListener("click", resetFormState);

  viewButton.addEventListener("click", () => {
    const confirmLeave = confirm("Open the public shop page in a new tab?");
    if (confirmLeave) {
      window.open("./index.html", "_blank");
    }
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("code");
    resetFormState();
    clearProductList();
    showAuthPanel();
  });

  // Modal events
  closeModalButton.addEventListener("click", () => {
    previewModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === previewModal) {
      previewModal.style.display = "none";
    }
  });
});

// ---- AUTH LOGIC ----

function showAuthPanel() {
  authPanel.classList.remove("hidden");
  mainPanel.classList.add("hidden");
  adminCodeInput.value = "";
}

function showMainPanel() {
  authPanel.classList.add("hidden");
  mainPanel.classList.remove("hidden");
}

function handleLogin(e) {
  e.preventDefault();
  authError.textContent = "";

  const enteredCode = adminCodeInput.value.trim().toLowerCase();
  if (!enteredCode) {
    authError.textContent = "Please enter a security code.";
    return;
  }

  if (enteredCode === ADMIN_CODE) {
    localStorage.setItem("code", "true");
    showMainPanel();
    fetchProducts();
  } else {
    authError.textContent = "Incorrect code. Try again.";
  }
}

// ---- IMAGE PREVIEW ----

function handleImagePreview(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    imagePreview.src = "#";
    imagePreview.style.display = "none";
    imagePlaceholder.style.display = "flex";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreview.style.display = "block";
    imagePlaceholder.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// ---- CRUD: FETCH / LIST ----

async function fetchProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    clearProductList();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const card = createProductCard({ id, ...data });
      productListEl.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

function clearProductList() {
  productListEl.innerHTML = "";
}

function createProductCard(product) {
  const { id, title, description, price, imageUrl } = product;

  const card = document.createElement("div");
  card.classList.add("admin-product-card");

  const thumb = document.createElement("div");
  thumb.classList.add("admin-product-thumb");
  const img = document.createElement("img");
  img.src = imageUrl || "#";
  img.alt = title || "Product";
  thumb.appendChild(img);

  const info = document.createElement("div");
  info.classList.add("admin-product-info");

  const titleEl = document.createElement("h3");
  titleEl.textContent = title || "Untitled item";

  const priceEl = document.createElement("p");
  priceEl.classList.add("price");
  priceEl.textContent = price ? `R ${price}` : "No price set";

  const descEl = document.createElement("p");
  descEl.textContent = description || "No description.";

  const actions = document.createElement("div");
  actions.classList.add("admin-product-actions");

  const editBtn = document.createElement("button");
  editBtn.classList.add("btn-sm-primary");
  editBtn.innerHTML = `<i class="fa-solid fa-pen"></i> Edit`;
  editBtn.addEventListener("click", () => {
    loadProductIntoForm(product);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn-sm-danger");
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`;
  deleteBtn.addEventListener("click", () => handleDeleteProduct(id, title));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  info.appendChild(titleEl);
  info.appendChild(priceEl);
  info.appendChild(descEl);
  info.appendChild(actions);

  card.appendChild(thumb);
  card.appendChild(info);

  return card;
}

// ---- CRUD: CREATE / UPDATE ----

async function handleSubmitProduct(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const price = priceInput.value.trim();
  const pictureFile = imageInput.files[0];

  if (!title || !description || !price || (!pictureFile && !currentEditId)) {
    alert("Please fill in all fields. For new items, an image is required.");
    return;
  }

  let imageUrlToUse = currentEditImageUrl || null;

  try {
    setFormDisabled(true);

    // Upload image only if new file selected
    if (pictureFile) {
      const storagePath = `${Date.now()}_${pictureFile.name}`;
      const imageRef = ref(storageRootRef, storagePath);

      const uploadTask = uploadBytesResumable(imageRef, pictureFile);

      progressBar.value = 0;
      progressBar.style.display = "block";

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.value = progress;
          },
          (error) => reject(error),
          () => resolve()
        );
      });

      imageUrlToUse = await getDownloadURL(imageRef);
    }

    const data = { title, description, price, imageUrl: imageUrlToUse };

    if (currentEditId) {
      await updateDoc(doc(db, "products", currentEditId), data);
    } else {
      await addDoc(collection(db, "products"), data);
    }

    // Show preview modal
    showPreviewModal(data);

    // Reset state & reload list
    resetFormState();
    await fetchProducts();
  } catch (err) {
    console.error("Error saving product:", err);
    alert("Something went wrong. Check your connection and try again.");
  } finally {
    progressBar.value = 0;
    progressBar.style.display = "none";
    setFormDisabled(false);
  }
}

function setFormDisabled(disabled) {
  const elements = uploadForm.querySelectorAll("input, textarea, button");
  elements.forEach((el) => {
    el.disabled = disabled;
  });
}

function loadProductIntoForm(product) {
  currentEditId = product.id;
  currentEditImageUrl = product.imageUrl || null;

  titleInput.value = product.title || "";
  descriptionInput.value = product.description || "";
  priceInput.value = product.price || "";

  if (product.imageUrl) {
    imagePreview.src = product.imageUrl;
    imagePreview.style.display = "block";
    imagePlaceholder.style.display = "none";
  } else {
    imagePreview.style.display = "none";
    imagePlaceholder.style.display = "flex";
  }

  formTitle.innerHTML =
    '<i class="fa-solid fa-pen"></i> Edit Product';
  submitLabel.textContent = "Update Product";
  cancelEditButton.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetFormState() {
  currentEditId = null;
  currentEditImageUrl = null;
  uploadForm.reset();
  imagePreview.style.display = "none";
  imagePlaceholder.style.display = "flex";
  formTitle.innerHTML =
    '<i class="fa-solid fa-upload"></i> Add New Product';
  submitLabel.textContent = "Save Product";
  cancelEditButton.classList.add("hidden");
}

// ---- CRUD: DELETE ----

async function handleDeleteProduct(id, title = "") {
  const confirmDelete = confirm(
    `Delete this product?\n\n${title || "Untitled item"}`
  );
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "products", id));
    await fetchProducts();
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("Could not delete product. Try again.");
  }
}

// ---- MODAL PREVIEW ----

function showPreviewModal(data) {
  modalTitle.textContent = data.title || "Item";
  modalDescription.textContent = data.description || "";
  modalPrice.textContent = data.price ? `Price: R ${data.price}` : "";

  modalImage.onload = () => {
    previewModal.style.display = "flex";
  };
  modalImage.src = data.imageUrl || "#";
}
