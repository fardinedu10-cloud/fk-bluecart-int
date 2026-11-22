// ========================================
// BLUECART - FAKE STORE API PROJECT
// ========================================

const API_URL = "https://fakestoreapi.com";

// Main data
let products = [];
let cart = [];

// Product elements
const productContainer = document.getElementById("productContainer");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

// Cart elements
const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");

// Product details elements
const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const productDetails = document.getElementById("productDetails");

// Success modal elements
const successModal = document.getElementById("successModal");
const closeSuccess = document.getElementById("closeSuccess");
const successTitle = document.getElementById("successTitle");
const successMessage = document.getElementById("successMessage");

// API status
const apiStatus = document.getElementById("apiStatus");


// ========================================
// 1. GET ALL PRODUCTS
// GET /products
// ========================================

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
        errorMessage.classList.remove("hidden");

    } finally {
        loadingMessage.classList.add("hidden");
    }
}


// ========================================
// 2. DISPLAY CATEGORIES
// ========================================

function displayCategories() {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const categories = [...new Set(
        products.map(product => product.category)
    )];

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}


// ========================================
// 3. DISPLAY PRODUCT CARDS
// ========================================

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
                <p class="product-category">
                    ${product.category}
                </p>

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

                <button
                    class="add-cart-button details-button"
                    onclick="getProductDetails(${product.id})"
                >
                    View Details
                </button>
            </div>
        `;

        productContainer.appendChild(card);
    });
}


// ========================================
// 4. FILTER PRODUCTS
// ========================================

// Filter products by category and search text
function filterProducts() {
    const selectedCategory = categoryFilter.value;
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredProducts = products.filter(product => {
        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.title.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    displayProducts(filteredProducts);
}


// Category filter
categoryFilter.addEventListener("change", filterProducts);


// Search products
searchInput.addEventListener("input", filterProducts);


// ========================================
// 5. GET SINGLE PRODUCT
// GET /products/:id
// ========================================

async function getProductDetails(productId) {
    try {
        const response = await fetch(
            `${API_URL}/products/${productId}`
        );

        if (!response.ok) {
            throw new Error("Could not load product details.");
        }

        const product = await response.json();

        productDetails.innerHTML = `
            <div class="details-layout">
                <img
                    class="details-image"
                    src="${product.image}"
                    alt="${product.title}"
                >

                <div>
                    <p class="details-category">
                        ${product.category}
                    </p>

                    <h3 class="details-title">
                        ${product.title}
                    </h3>

                    <p class="details-price">
                        $${product.price.toFixed(2)}
                    </p>

                    <p class="details-description">
                        ${product.description}
                    </p>

                    <p class="details-rating">
                        Rating: ${product.rating.rate} / 5
                        (${product.rating.count} reviews)
                    </p>

                    <button
                        class="primary-button"
                        onclick="addToCart(${product.id}); closeProductDetails();"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        productModal.classList.remove("hidden");

    } catch (error) {
        showSuccessModal(
            "Error",
            "Could not load the product details."
        );
    }
}


// ========================================
// 6. ADD PRODUCT TO CART
// ========================================

function addToCart(productId) {
    const product = products.find(
        product => product.id === productId
    );

    if (!product) {
        return;
    }

    const existingProduct = cart.find(
        item => item.id === productId
    );

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

    // No browser alert.
    showSuccessModal(
        "Added to Cart!",
        `${product.title} was successfully added to your cart.`
    );
}


// ========================================
// 7. UPDATE CART COUNT
// ========================================

function updateCartCount() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
}


// ========================================
// 8. SHOW CART
// ========================================

cartButton.addEventListener("click", function () {
    displayCart();
    cartModal.classList.remove("hidden");
});


// ========================================
// 9. DISPLAY CART
// ========================================

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


// ========================================
// 10. REMOVE FROM CART
// ========================================

function removeFromCart(productId) {
    cart = cart.filter(
        item => item.id !== productId
    );

    updateCartCount();
    displayCart();
}


// ========================================
// 11. CREATE CART
// POST /carts
// ========================================

async function createCartOnAPI() {
    const apiCart = {
        userId: 1,
        products: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }))
    };

    const response = await fetch(`${API_URL}/carts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apiCart)
    });

    return response.json();
}


// ========================================
// 12. CHECKOUT
// Uses POST /carts
// ========================================

checkoutButton.addEventListener("click", async function () {
    if (cart.length === 0) {
        showSuccessModal(
            "Cart is Empty",
            "Please add a product before checkout."
        );
        return;
    }

    try {
        await createCartOnAPI();

        cart = [];
        updateCartCount();
        displayCart();
        cartModal.classList.add("hidden");

        showSuccessModal(
            "Order Successful!",
            "Your demo order was successfully created using the Cart API."
        );

    } catch (error) {
        console.error(error);

        showSuccessModal(
            "Checkout Error",
            "The demo order could not be created."
        );
    }
});


// ========================================
// 13. GET ALL CARTS
// GET /carts
// ========================================

async function loadCartsFromAPI() {
    try {
        const response = await fetch(`${API_URL}/carts`);

        if (!response.ok) {
            throw new Error("Could not load carts.");
        }

        const carts = await response.json();

        showAPIStatus(
            `GET /carts successful. ${carts.length} carts received.`
        );

    } catch (error) {
        showAPIStatus("GET /carts failed.");
    }
}


// ========================================
// 14. GET SINGLE CART
// GET /carts/:id
// ========================================

async function getCartById(cartId) {
    try {
        const response = await fetch(
            `${API_URL}/carts/${cartId}`
        );

        if (!response.ok) {
            throw new Error("Could not load cart.");
        }

        const cartData = await response.json();

        showAPIStatus(
            `GET /carts/${cartId} successful. User ID: ${cartData.userId}.`
        );

    } catch (error) {
        showAPIStatus(`GET /carts/${cartId} failed.`);
    }
}


// ========================================
// 15. UPDATE CART
// PUT /carts/:id
// ========================================

async function updateDemoCart() {
    const updatedCart = {
        userId: 1,
        products: [
            {
                id: 2,
                quantity: 2
            }
        ]
    };

    try {
        const response = await fetch(
            `${API_URL}/carts/1`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedCart)
            }
        );

        await response.json();

        showAPIStatus(
            "PUT /carts/1 successful. Cart updated."
        );

    } catch (error) {
        showAPIStatus("PUT /carts/1 failed.");
    }
}


// ========================================
// 16. DELETE CART
// DELETE /carts/:id
// ========================================

async function deleteDemoCart() {
    try {
        const response = await fetch(
            `${API_URL}/carts/1`,
            {
                method: "DELETE"
            }
        );

        await response.json();

        showAPIStatus(
            "DELETE /carts/1 successful. Cart deleted."
        );

    } catch (error) {
        showAPIStatus("DELETE /carts/1 failed.");
    }
}


// ========================================
// 17. CREATE PRODUCT
// POST /products
// ========================================

async function createDemoProduct() {
    const newProduct = {
        title: "New BlueCart Product",
        price: 29.99
    };

    try {
        const response = await fetch(
            `${API_URL}/products`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newProduct)
            }
        );

        const data = await response.json();

        showAPIStatus(
            `POST /products successful. New product ID: ${data.id}.`
        );

    } catch (error) {
        showAPIStatus("POST /products failed.");
    }
}


// ========================================
// 18. UPDATE PRODUCT
// PUT /products/:id
// ========================================

async function updateDemoProduct() {
    const updatedProduct = {
        title: "Updated BlueCart Product",
        price: 39.99
    };

    try {
        const response = await fetch(
            `${API_URL}/products/1`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedProduct)
            }
        );

        await response.json();

        showAPIStatus(
            "PUT /products/1 successful. Product updated."
        );

    } catch (error) {
        showAPIStatus("PUT /products/1 failed.");
    }
}


// ========================================
// 19. DELETE PRODUCT
// DELETE /products/:id
// ========================================

async function deleteDemoProduct() {
    try {
        const response = await fetch(
            `${API_URL}/products/1`,
            {
                method: "DELETE"
            }
        );

        await response.json();

        showAPIStatus(
            "DELETE /products/1 successful. Product deleted."
        );

    } catch (error) {
        showAPIStatus("DELETE /products/1 failed.");
    }
}


// ========================================
// 20. API STATUS MESSAGE
// ========================================

function showAPIStatus(message) {
    apiStatus.textContent = message;
}


// ========================================
// 21. SUCCESS MODAL
// ========================================

function showSuccessModal(title, message) {
    successTitle.textContent = title;
    successMessage.textContent = message;
    successModal.classList.remove("hidden");
}

closeSuccess.addEventListener("click", function () {
    successModal.classList.add("hidden");
});


// ========================================
// 22. CLOSE CART
// ========================================

closeCart.addEventListener("click", function () {
    cartModal.classList.add("hidden");
});


// ========================================
// 23. CLOSE PRODUCT DETAILS
// ========================================

function closeProductDetails() {
    productModal.classList.add("hidden");
}

closeProductModal.addEventListener("click", closeProductDetails);


// ========================================
// 24. CLOSE MODALS BY CLICKING OUTSIDE
// ========================================

cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.classList.add("hidden");
    }
});

productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
        productModal.classList.add("hidden");
    }
});

successModal.addEventListener("click", function (event) {
    if (event.target === successModal) {
        successModal.classList.add("hidden");
    }
});


// ========================================
// START PROJECT
// ========================================

getProducts();
