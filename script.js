// Fake Store API
const API_URL = "https://fakestoreapi.com";

// Store products and cart in JavaScript
let products = [];
let cart = [];

// Select HTML elements
const productContainer = document.getElementById("productContainer");
const categoryFilter = document.getElementById("categoryFilter");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");


// =========================
// GET PRODUCTS
// =========================

async function getProducts() {
    try {
        loadingMessage.classList.remove("hidden");
        errorMessage.classList.add("hidden");

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Could not load products.");
        }

        products = await response.json();

        displayCategories();
        displayProducts(products);

    } catch (error) {
        console.error(error);
        loadingMessage.classList.add("hidden");
        errorMessage.classList.remove("hidden");

    } finally {
        loadingMessage.classList.add("hidden");
    }
}


// =========================
// DISPLAY CATEGORIES
// =========================

function displayCategories() {
    const categories = [...new Set(products.map(product => product.category))];

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}


// =========================
// DISPLAY PRODUCTS
// =========================

function displayProducts(productList) {
    productContainer.innerHTML = "";

    if (productList.length === 0) {
        productContainer.innerHTML = `
            <p class="message">No products found.</p>
        `;
        return;
    }

    productList.forEach(product => {
        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `
            <img
                class="product-image"
                src="${product.image}"
                alt="${product.title}"
            >

            <div class="product-info">
                <p class="product-category">${product.category}</p>

                <h3 class="product-title">
                    ${product.title}
                </h3>

                <p class="product-price">
                    $${product.price.toFixed(2)}
                </p>

                <button
                    class="add-cart-button"
                    onclick="addToCart(${product.id})"
                >
                    Add to Cart
                </button>
            </div>
        `;

        productContainer.appendChild(card);
    });
}


// =========================
// FILTER PRODUCTS
// =========================

categoryFilter.addEventListener("change", function () {
    const selectedCategory = this.value;

    if (selectedCategory === "all") {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(
            product => product.category === selectedCategory
        );

        displayProducts(filteredProducts);
    }
});


// =========================
// ADD TO CART
// =========================

function addToCart(productId) {
    const product = products.find(product => product.id === productId);

    if (!product) {
        return;
    }

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }

    updateCartCount();

    alert("Product added to cart!");
}


// =========================
// UPDATE CART COUNT
// =========================

function updateCartCount() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
}


// =========================
// SHOW CART
// =========================

cartButton.addEventListener("click", function () {
    displayCart();
    cartModal.classList.remove("hidden");
});


// =========================
// CLOSE CART
// =========================

closeCart.addEventListener("click", function () {
    cartModal.classList.add("hidden");
});


// Close modal when clicking outside
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.classList.add("hidden");
    }
});


// =========================
// DISPLAY CART
// =========================

function displayCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p class="message">Your cart is empty.</p>
        `;

        cartTotal.textContent = "0.00";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div class="cart-item-title">
                <strong>${item.title}</strong>
                <br>
                Quantity: ${item.quantity}
                <br>
                $${(item.price * item.quantity).toFixed(2)}
            </div>

            <button
                class="remove-button"
                onclick="removeFromCart(${item.id})"
            >
                Remove
            </button>
        `;

        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = total.toFixed(2);
}


// =========================
// REMOVE FROM CART
// =========================

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    updateCartCount();
    displayCart();
}


// =========================
// CHECKOUT
// =========================

checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    alert("Checkout completed for this demo.");

    cart = [];
    updateCartCount();
    displayCart();
});


// =========================
// START PROJECT
// =========================

getProducts();
