// === GLOBAL DATA ===
const PRODUCTS = [
  {
    id: 1,
    name: "Razer DeathAdder V3 Pro",
    price: 1890000,
    icon: "🖱️",
    desc: "Mouse Wireless 90H Battery",
  },
  {
    id: 2,
    name: "Logitech G Pro X Keyboard",
    price: 2490000,
    icon: "⌨️",
    desc: "Mechanical Hotswap RGB",
  },
  {
    id: 3,
    name: "SteelSeries Arctis Nova 7",
    price: 2790000,
    icon: "🎧",
    desc: "Wireless 38H Gaming Headset",
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
    desc: "3440x1440 175Hz Curved",
  },
  {
    id: 6,
    name: "Corsair MM700 RGB",
    price: 890000,
    icon: "🛋️",
    desc: "Extended Mousepad RGB",
  },
];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let orders = JSON.parse(localStorage.getItem("orders") || "[]");
let currentUser = JSON.parse(localStorage.getItem("currentUser") || null);

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname.includes("index")
  ) {
    initMainApp();
  } else {
    initAuth();
  }
  initParticles();
});

// === AUTH FUNCTIONS ===
function initAuth() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const guestBtn = document.getElementById("guestBtn");

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href = "index.html";
    } else {
      alert("❌ Email atau password salah!");
    }
  });

  registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {
      name:
        formData.get("name") ||
        e.target.querySelector('input[placeholder*="Name"]').value,
      email:
        formData.get("email") ||
        e.target.querySelector('input[type="email"]').value,
      phone:
        formData.get("phone") ||
        e.target.querySelector('input[placeholder*="WhatsApp"]').value,
      password:
        formData.get("password") ||
        e.target.querySelector('input[type="password"]').value,
    };

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === user.email)) {
      alert("❌ Email sudah terdaftar!");
      return;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("✅ Akun berhasil dibuat!");
    window.location.href = "index.html";
  });

  guestBtn?.addEventListener("click", () => {
    const guestUser = {
      name: "Guest Gamer",
      email: "guest@pro.com",
      phone: "0812-3456-7890",
    };
    localStorage.setItem("currentUser", JSON.stringify(guestUser));
    window.location.href = "index.html";
  });
}

// === MAIN APP ===
function initMainApp() {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userName").textContent = currentUser.name;
  renderProducts();
  updateCartUI();

  // Cart modal
  document.getElementById("cartBtn").onclick = showCartModal;

  // Checkout
  document.getElementById("checkoutForm").onsubmit = handleCheckout;
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = PRODUCTS.map(
    (product) => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-icon">${product.icon}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.desc}</p>
            <div class="product-price">Rp ${product.price.toLocaleString()}</div>
            <button class="add-cart-btn" onclick="addToCart(${product.id})">
                ADD TO CART
            </button>
        </div>
    `,
  ).join("");
}

function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  cart.push({ ...product, qty: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  // Feedback
  const btn = event.target;
  const original = btn.textContent;
  btn.textContent = "✅ ADDED!";
  btn.style.background = "linear-gradient(45deg, #00ff88, #00cc66)";
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = "";
  }, 1500);
}

function updateCartUI() {
  document.getElementById("cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.qty,
    0,
  );
}

function showCartModal() {
  if (cart.length === 0) {
    alert("🛒 Keranjang kosong!");
    return;
  }

  const modal = document.getElementById("checkoutModal");
  const itemsHtml = cart
    .map(
      (item) => `
        <div class="cart-item">
            <span>${item.icon} ${item.name}</span>
            <span>Rp ${item.price.toLocaleString()} x${item.qty}</span>
        </div>
    `,
    )
    .join("");

  document.getElementById("cartItems").innerHTML = itemsHtml;
  document.getElementById("totalAmount").textContent =
    `Rp ${cart.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString()}`;

  modal.style.display = "block";
}

function handleCheckout(e) {
  e.preventDefault();
  const address = document.getElementById("shippingAddress").value;
  const payment = document.getElementById("paymentMethod").value;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = {
    id: "GG" + Date.now(),
    user: currentUser.name,
    items: [...cart],
    total,
    address,
    payment: payment.toUpperCase(),
    status: "Packing",
    date: new Date().toLocaleString("id-ID"),
    tracking: "Sedang diproses",
  };

  orders.unshift(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  localStorage.setItem("cart", "[]");
  updateCartUI();

  document.getElementById("checkoutModal").style.display = "none";
  showPackingAnimation(order);
}

function showPackingAnimation(order) {
  const modal = document.getElementById("packingModal");
  document.getElementById("orderTitle").textContent = `Order #${order.id}`;

  let progress = 0;
  const progressFill = document.getElementById("progressFill");
  const statusEl = document.getElementById("packingStatus");

  const statuses = [
    "📦 Memeriksa stok...",
    "✅ Stock OK! Membungkus...",
    "🎀 Menambahkan bubble wrap...",
    "📄 Print label pengiriman...",
    "🚚 Siap dikirim!",
  ];

  let statusIdx = 0;
  const interval = setInterval(() => {
    progress += 20;
    progressFill.style.width = progress + "%";

    statusEl.textContent = statuses[statusIdx];
    statusIdx++;

    if (progress >= 100) {
      clearInterval(interval);
      order.status = "Dikirim";
      order.tracking = "Dalam perjalanan (2-3 hari)";
      localStorage.setItem("orders", JSON.stringify(orders));

      setTimeout(() => {
        alert(
          `🎉 Pesanan #${order.id} berhasil! Estimasi tiba: 2-3 hari.\nTrack: ${order.tracking}`,
        );
        modal.style.display = "none";
      }, 1000);
    }
  }, 800);

  modal.style.display = "block";
}

// === UTILS ===
function scrollToShop() {
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}

function initParticles() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
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
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Close modals
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
  if (e.target.classList.contains("modal-close")) {
    e.target.closest(".modal").style.display = "none";
  }
});
