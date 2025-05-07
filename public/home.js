document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".cards");
    const searchInput = document.querySelector(".nav-search-input");

    // Render products from products.js
    function renderProducts(list) {
        container.innerHTML = "";
        list.forEach(product => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <figure>
                    <img src="${product.image}" alt="${product.name}">
                </figure>
                <figcaption>
                    <h3>${product.name}</h3>
                    Rs ${product.price} + shipping
                    <h5>${product.discount}% off</h5>
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </figcaption>
            `;
            container.appendChild(card);
        });

        // Attach event listeners after rendering
        document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                addToCart(id);
            });
        });
    }

    renderProducts(products);

    // Live search
    searchInput.addEventListener("input", () => {
        const keyword = searchInput.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
        renderProducts(filtered);
    });

    // Cart icon click opens cart popup
    document.querySelector('.cart').addEventListener('click', (e) => {
        e.preventDefault();
        showCartPopup();
    });
});

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart.`);
}

function showCartPopup() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    let popup = document.createElement('div');
    popup.classList.add('cart-popup');
    popup.style.position = 'fixed';
    popup.style.top = '20%';
    popup.style.right = '20px';
    popup.style.background = '#fff';
    popup.style.border = '1px solid #ccc';
    popup.style.padding = '20px';
    popup.style.zIndex = 1000;
    popup.style.maxHeight = '300px';
    popup.style.overflowY = 'auto';

    let html = `<h3>Your Cart</h3>`;
    if (cart.length === 0) {
        html += `<p>Cart is empty.</p>`;
    } else {
        html += `<ul>`;
        cart.forEach(item => {
            html += `<li>${item.name} - ${item.qty} × Rs ${item.price}</li>`;
        });
        html += `</ul>`;
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        html += `<p><strong>Total: Rs ${total}</strong></p>`;
    }
    html += `<button id="close-cart-popup">Close</button>`;
    html += `<button id="reset-cart-popup" style="margin-left:10px;">Reset Cart</button>`;
    html += `<button id="checkout-cart-popup" style="margin-left:10px;">Checkout</button>`;

    popup.innerHTML = html;

    // Remove any existing popup before appending a new one
    const oldPopup = document.querySelector(".cart-popup");
    if (oldPopup) oldPopup.remove();

    document.body.appendChild(popup);

    // Close event listener
    document.getElementById('close-cart-popup').addEventListener('click', () => {
        popup.remove();
    });

    document.getElementById('reset-cart-popup').addEventListener('click', () => {
        localStorage.removeItem('cart');
        popup.remove();
        alert("Cart has been reset.");
    });

    document.getElementById('reset-cart-popup').addEventListener('click', () => {
        localStorage.removeItem('cart');
        popup.remove();
        alert("Cart has been reset.");
    });

    document.getElementById('checkout-cart-popup').addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const orderDetails = cart.map(item => `${item.name} x ${item.qty}`).join("\n");
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        const confirmCheckout = confirm(
            `You're about to purchase:\n\n${orderDetails}\n\nTotal: Rs ${total}\n\nConfirm checkout?`
        );

        if (confirmCheckout) {
            localStorage.removeItem('cart');
            popup.remove();
            alert("Thank you for your purchase!");
        }
    });
}
