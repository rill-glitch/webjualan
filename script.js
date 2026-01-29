// ====================================
// GAMERGEAR PRO - SCRIPT UTAMA
// ====================================

// DATA PRODUK
const PRODUCTS = [
  {
    id: 1,
    name: "Razer DeathAdder V3 Pro",
    price: 1890000,
    icon: "🖱️",
    desc: "Mouse Wireless 90H",
  },
  {
    id: 2,
    name: "Logitech G Pro X Keyboard",
    price: 2490000,
    icon: "⌨️",
    desc: "Mechanical Hotswap",
  },
  {
    id: 3,
    name: "SteelSeries Arctis Nova 7",
    price: 2790000,
    icon: "🎧",
    desc: "Wireless 38H Headset",
  },
  {
    id: 4,
    name: "HyperX QuadCast S",
    price: 1690000,
    icon: "🎙️",
    desc: "RGB USB Microphone",
  },
  {
    id: 5,
    name: 'Alienware 34" QD-OLED',
    price: 18900000,
    icon: "🖥️",
    desc: "3440x1440 175Hz",
  },
  {
    id: 6,
    name: "Corsair MM700 RGB",
    price: 890000,
    icon: "🛋️",
    desc: "Extended Mousepad",
  },
];

// GLOBAL STATE
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let orders = JSON.parse(localStorage.getItem("orders") || "[]");

// INIT APP
document.addEventListener("DOMContentLoaded", function () {
  // CHECK HALAMAN APA
  if (document.getElementById("loginForm")) initLogin();
  if (document.getElementById("registerForm")) initRegister();
  if (document.getElementById("productsGrid")) initShop();

  initParticles();
  initMobileFix();
});

// ====================================
// LOGIN & REGISTER
// ====================================
function initLogin() {
  document.getElementById("loginForm").onsubmit = function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;

    // CEK USER DI LOCALSTORAGE
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u) => u.email === email && u.pass === pass);

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href = "index.html";
    } else {
      alert("❌ Email atau password salah!");
    }
  };

  document.getElementById("guestBtn").onclick = function () {
    const guest = {
      name: "Guest Gamer",
      email: "guest@pro.com",
      phone: "08123456789",
      pass: "guest",
    };
    localStorage.setItem("currentUser", JSON.stringify(guest));
    window.location.href = "index.html";
  };
}

function initRegister() {
  document.getElementById("registerForm").onsubmit = function (e) {
    e.preventDefault();
    const user = {
      name: document.getElementById("regName").value,
      email: document.getElementById("regEmail").value,
      phone: document.getElementById("regPhone").value,
      pass: document.getElementById("regPass").value,
    };

    // CEK SUDAH ADA BELUM
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === user.email)) {
      alert("❌ Email sudah terdaftar!");
      return;
    }

    // SIMPAN USER BARU
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("✅ Registrasi berhasil! Redirect ke toko...");
    window.location.href = "index.html";
  };
}

// ====================================
// SHOP FUNCTION
// ====================================
function initShop() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userName").textContent = user.name;
  renderProducts();
  updateCartCount();

  // EVENT LISTENER
  document.getElementById("cartBtn").onclick = showCartModal;
  document.getElementById("checkoutForm").onsubmit = handleCheckout;
  document.getElementById("shopBtn").onclick = function () {
    document
      .querySelector(".shop-section")
      .scrollIntoView({ behavior: "smooth" });
  };
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = PRODUCTS.map(
    (p) => `
        <div class="product-card">
            <div class="product-icon">${p.icon}</div>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.desc}</p>
            <div class="product-price">Rp ${p.price.toLocaleString()}</div>
            <button class="add-cart-btn" onclick="addToCart(${p.id})">ADD TO CART</button>
        </div>
    `,
  ).join("");
}

function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  cart.push({ ...product, qty: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // FEEDBACK
  event.target.textContent = "✅ ADDED!";
  event.target.style.background = "#00ff88";
  setTimeout(() => {
    event.target.textContent = "ADD TO CART";
    event.target.style.background = "";
  }, 1000);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
}

function showCartModal() {
  if (cart.length === 0) {
    alert("🛒 Keranjang kosong!");
    return;
  }

  const modal = document.getElementById("checkoutModal");
  document.getElementById("cartItems").innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <span>${item.icon} ${item.name}</span>
            <span>Rp ${item.price.toLocaleString()} x${item.qty}</span>
        </div>
    `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("totalAmount").textContent =
    `Rp ${total.toLocaleString()}`;

  modal.style.display = "block";
}

function handleCheckout(e) {
  e.preventDefault();
  const address = document.getElementById("shippingAddress").value;
  const payment = document.getElementById("paymentMethod").value;

  const order = {
    id: "GG" + Date.now(),
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    address,
    payment: payment.toUpperCase(),
    status: "Packing",
    date: new Date().toLocaleString("id-ID"),
  };

  orders.unshift(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  localStorage.setItem("cart", "[]");
  updateCartCount();

  document.getElementById("checkoutModal").style.display = "none";
  showPackingAnimation(order);
}

function showPackingAnimation(order) {
  const modal = document.getElementById("packingModal");
  document.getElementById("orderTitle").textContent = `Order #${order.id}`;

  let progress = 0;
  const statuses = [
    "📦 Checking stock...",
    "✅ Stock OK!",
    "🎀 Wrapping...",
    "📄 Printing label...",
    "🚚 Ready to ship!",
  ];
  let statusIdx = 0;

  const interval = setInterval(() => {
    progress += 20;
    document.getElementById("progressFill").style.width = progress + "%";
    document.getElementById("packingStatus").textContent = statuses[statusIdx];
    statusIdx++;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        alert(`🎉 Order #${order.id} berhasil! Estimasi 2-3 hari.`);
        modal.style.display = "none";
      }, 500);
    }
  }, 600);

  modal.style.display = "block";
}

// ====================================
// UTILITIES
// ====================================
function initParticles() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.5 + 0.2})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

function initMobileFix() {
  // CLOSE MODAL
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("modal") ||
      e.target.classList.contains("modal-close")
    ) {
      document
        .querySelectorAll(".modal")
        .forEach((m) => (m.style.display = "none"));
    }
  });
}

// RESIZE CANVAS
window.addEventListener("resize", function () {
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
