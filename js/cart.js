/**
 * FOODIE - SHOPPING CART & WHATSAPP CHECKOUT SYSTEM
 * Handles add-to-cart, quantity changes, file upload preview, and order compilation
 */

document.addEventListener('DOMContentLoaded', () => {
  initCart();
});

function initCart() {
  // Cart state
  let cart = [];
  const WHATSAPP_RECEPTIONIST_NUMBER = '923001234567'; // Receptionist phone number (92 followed by 10 digits)

  // DOM Elements
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartCountBadges = document.querySelectorAll('.cart-count');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const checkoutForm = document.getElementById('checkoutForm');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');
  const paymentProviderName = document.getElementById('paymentProviderName');
  const paymentAccountNumber = document.getElementById('paymentAccountNumber');
  const paymentAccountName = document.getElementById('paymentAccountName');
  const proofUploadGroup = document.getElementById('proofUploadGroup');
  const paymentProofInput = document.getElementById('paymentProof');
  const proofPreviewContainer = document.getElementById('proofPreviewContainer');
  const orderSuccessModal = document.getElementById('orderSuccessModal');
  const orderSuccessClose = document.getElementById('orderSuccessClose');

  // Checkout inputs & error messages
  const chkName = document.getElementById('chkName');
  const chkPhone = document.getElementById('chkPhone');
  const chkCity = document.getElementById('chkCity');
  const chkArea = document.getElementById('chkArea');
  const chkStreet = document.getElementById('chkStreet');

  const chkNameError = document.getElementById('chkNameError');
  const chkPhoneError = document.getElementById('chkPhoneError');
  const chkCityError = document.getElementById('chkCityError');
  const chkAreaError = document.getElementById('chkAreaError');
  const chkStreetError = document.getElementById('chkStreetError');
  const chkProofError = document.getElementById('chkProofError');

  // Bind cart toggles
  const cartHeaderBtn = document.getElementById('cartHeaderBtn');
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', toggleCart);
  if (cartHeaderBtn) cartHeaderBtn.addEventListener('click', toggleCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Bind add to cart triggers (for dynamically rendered or static buttons)
  bindAddToCartButtons();

  // Watch for DOM changes to menu grid filtering (re-bind if needed, though event delegation is safer)
  document.body.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-order')) {
      const card = e.target.closest('.menu-card');
      if (card) {
        const title = card.querySelector('.menu-card-title').textContent;
        // Parse price from element: get text from price-current and strip 'Rs. ' and commas
        const priceText = card.querySelector('.price-current').textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
        const imgUrl = card.querySelector('.menu-card-img').src;
        
        addToCart({ title, price, imgUrl });
      }
    }

  });

  // Handle payment method changes
  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', (e) => {
      const method = e.target.value;
      if (method === 'easypaisa' || method === 'jazzcash') {
        onlinePaymentDetails.style.display = 'block';
        proofUploadGroup.style.display = 'block';
        paymentProofInput.setAttribute('required', 'required');
        
        if (method === 'easypaisa') {
          paymentProviderName.textContent = 'EasyPaisa';
          paymentAccountNumber.textContent = '0300-1234567';
          paymentAccountName.textContent = 'Muhammad Ali';
        } else {
          paymentProviderName.textContent = 'JazzCash';
          paymentAccountNumber.textContent = '0311-1234567';
          paymentAccountName.textContent = 'Muhammad Ali';
        }
      } else {
        // COD (Cash on Delivery)
        onlinePaymentDetails.style.display = 'none';
        proofUploadGroup.style.display = 'none';
        paymentProofInput.removeAttribute('required');
        clearProofPreview();
        clearError(paymentProofInput, chkProofError);
      }
    });
  }

  // Handle proof image upload preview
  if (paymentProofInput) {
    paymentProofInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          proofPreviewContainer.innerHTML = `
            <div style="position: relative; width: 100px; height: 100px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; margin-top: var(--spacing-xs);">
              <img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
              <button type="button" id="removeProofBtn" style="position: absolute; top: 2px; right: 2px; background: rgba(211, 47, 47, 0.8); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</button>
            </div>
          `;
          document.getElementById('removeProofBtn').addEventListener('click', clearProofPreview);
        };
        reader.readAsDataURL(file);
      } else {
        clearProofPreview();
      }
    });
  }

  // --- Inline Field Validations ---
  function showError(inputEl, errorEl) {
    if (!inputEl || !errorEl) return;
    const group = inputEl.closest('.form-group');
    if (group) group.classList.add('invalid');
    errorEl.style.display = 'flex';
  }

  function clearError(inputEl, errorEl) {
    if (!inputEl || !errorEl) return;
    const group = inputEl.closest('.form-group');
    if (group) group.classList.remove('invalid');
    errorEl.style.display = 'none';
  }

  function validateName() {
    const isValid = chkName.value.trim().length >= 3;
    if (isValid) {
      clearError(chkName, chkNameError);
    } else {
      showError(chkName, chkNameError);
    }
    return isValid;
  }

  function validatePhone() {
    const phoneVal = chkPhone.value.replace(/[\s-]/g, '');
    const isValid = /^((\+92)|(0092)|(0))?3\d{9}$/.test(phoneVal);
    if (isValid) {
      clearError(chkPhone, chkPhoneError);
    } else {
      showError(chkPhone, chkPhoneError);
    }
    return isValid;
  }

  function validateCity() {
    const isValid = chkCity.value !== "";
    if (isValid) {
      clearError(chkCity, chkCityError);
    } else {
      showError(chkCity, chkCityError);
    }
    return isValid;
  }

  function validateArea() {
    const isValid = chkArea.value.trim().length >= 3;
    if (isValid) {
      clearError(chkArea, chkAreaError);
    } else {
      showError(chkArea, chkAreaError);
    }
    return isValid;
  }

  function validateStreet() {
    const isValid = chkStreet.value.trim().length >= 5;
    if (isValid) {
      clearError(chkStreet, chkStreetError);
    } else {
      showError(chkStreet, chkStreetError);
    }
    return isValid;
  }

  function validateProof() {
    const payment = paymentMethodSelect.value;
    if (payment === 'easypaisa' || payment === 'jazzcash') {
      const isValid = paymentProofInput.files && paymentProofInput.files.length > 0;
      if (isValid) {
        clearError(paymentProofInput, chkProofError);
      } else {
        showError(paymentProofInput, chkProofError);
      }
      return isValid;
    }
    clearError(paymentProofInput, chkProofError);
    return true;
  }

  // Bind real-time validation listeners
  if (chkName) {
    chkName.addEventListener('blur', validateName);
    chkName.addEventListener('input', validateName);
  }
  if (chkPhone) {
    chkPhone.addEventListener('blur', validatePhone);
    chkPhone.addEventListener('input', validatePhone);
  }
  if (chkCity) {
    chkCity.addEventListener('change', validateCity);
    chkCity.addEventListener('blur', validateCity);
  }
  if (chkArea) {
    chkArea.addEventListener('blur', validateArea);
    chkArea.addEventListener('input', validateArea);
  }
  if (chkStreet) {
    chkStreet.addEventListener('blur', validateStreet);
    chkStreet.addEventListener('input', validateStreet);
  }
  if (paymentProofInput) {
    paymentProofInput.addEventListener('change', validateProof);
  }

  // Handle Order Submit
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (cart.length === 0) {
        alert('Your cart is empty. Please add some delicious food items first!');
        return;
      }

      // Run all validations
      const isNameValid = validateName();
      const isPhoneValid = validatePhone();
      const isCityValid = validateCity();
      const isAreaValid = validateArea();
      const isStreetValid = validateStreet();
      const isProofValid = validateProof();

      if (!isNameValid || !isPhoneValid || !isCityValid || !isAreaValid || !isStreetValid || !isProofValid) {
        // Focus first invalid element
        const firstInvalid = checkoutForm.querySelector('.form-group.invalid .form-input, .form-group.invalid .form-select');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const name = chkName.value.trim();
      const phone = chkPhone.value.trim();
      const city = chkCity.value;
      const area = chkArea.value.trim();
      const street = chkStreet.value.trim();
      const payment = paymentMethodSelect.value;

      // Construct complete address from structured components
      const address = `${street}, ${area}, ${city}`;

      // Process WhatsApp compilation
      const paymentMethodLabel = payment === 'cod' ? 'Cash on Delivery (COD)' : payment === 'easypaisa' ? 'EasyPaisa Online' : 'JazzCash Online';
      const formattedTotal = calculateTotal();
      
      let itemLines = '';
      cart.forEach(item => {
        itemLines += `- ${item.quantity}x ${item.title} (Rs. ${item.price * item.quantity})\n`;
      });

      // Construct receipt string
      const orderMessage = `*New Foodie Order!* 🍔🍕\n` +
                           `------------------------------------\n` +
                           `*Customer Details:*\n` +
                           `• Name: ${name}\n` +
                           `• Phone: ${phone}\n` +
                           `• Delivery Address: ${address}\n` +
                           `• Payment Method: ${paymentMethodLabel}\n\n` +
                           `*Order Items:*\n` +
                           `${itemLines}\n` +
                           `*Total Subtotal:* Rs. ${formattedTotal}\n` +
                           `------------------------------------\n` +
                           `*(Please verify transfer receipt. Proof of payment screenshot attached.)*`;

      const encodedText = encodeURIComponent(orderMessage);
      const whatsappUrl = `https://wa.me/${WHATSAPP_RECEPTIONIST_NUMBER}?text=${encodedText}`;

      // Open whatsapp link
      window.open(whatsappUrl, '_blank');

      // Close cart and show custom order completed popup
      closeCart();
      showOrderSuccess();
      
      // Clear Cart state
      cart = [];
      updateCartUI();
      checkoutForm.reset();
      clearProofPreview();

      // Clear validation styling/errors
      clearError(chkName, chkNameError);
      clearError(chkPhone, chkPhoneError);
      clearError(chkCity, chkCityError);
      clearError(chkArea, chkAreaError);
      clearError(chkStreet, chkStreetError);
      clearError(paymentProofInput, chkProofError);
      
      onlinePaymentDetails.style.display = 'none';
      proofUploadGroup.style.display = 'none';
    });
  }

  if (orderSuccessClose) {
    orderSuccessClose.addEventListener('click', () => {
      orderSuccessModal.classList.remove('active');
    });
  }

  // --- Cart Helpers ---

  function toggleCart() {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartDrawer.classList.contains('active') ? 'hidden' : '';
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function clearProofPreview() {
    if (paymentProofInput) paymentProofInput.value = '';
    if (proofPreviewContainer) proofPreviewContainer.innerHTML = '';
  }

  function bindAddToCartButtons() {
    // Buttons are intercepted globally via event listeners to accommodate category changes
  }

  function addToCart(product) {
    const existingProduct = cart.find(item => item.title === product.title);
    
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        title: product.title,
        price: product.price,
        imgUrl: product.imgUrl,
        quantity: 1
      });
    }

    updateCartUI();
    showToast(`${product.title} added to cart!`);
    
    // Animate the cart toggle button
    if (cartToggleBtn) {
      cartToggleBtn.classList.add('animate-wiggle');
      setTimeout(() => cartToggleBtn.classList.remove('animate-wiggle'), 500);
    }
  }

  function updateCartUI() {
    // 1. Update count badges
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems === 0 ? 'none' : 'flex';
    });

    // 2. Render item list
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xl) var(--spacing-md); color: var(--color-text-muted);">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" style="margin: 0 auto var(--spacing-sm); opacity: 0.3;">
            <path d="M17.21 9l-4.38-6.56c-.18-.28-.5-.44-.83-.44s-.65.16-.83.44L6.79 9H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h.12l1.62 8.12c.16.81.87 1.38 1.7 1.38h13.12c.83 0 1.54-.57 1.7-1.38L21.88 12H22c-.55 0-1-.45-1-1v-1c0-.55-.45-1-1-1h-2.79zM12 4.4L15.07 9H8.93L12 4.4zM12 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
          <p>Your cart is empty</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Add items from our menu to start ordering!</p>
        </div>
      `;
      cartSubtotal.textContent = 'Rs. 0';
      return;
    }

    cart.forEach((item, index) => {
      const itemRow = document.createElement('div');
      itemRow.classList.add('cart-item');
      itemRow.innerHTML = `
        <!-- TODO: replace with client photography -->
        <img src="${item.imgUrl}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <span class="cart-item-price">Rs. ${item.price}</span>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn dec-qty" data-index="${index}">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button type="button" class="qty-btn inc-qty" data-index="${index}">+</button>
          </div>
        </div>
        <button type="button" class="cart-item-remove" data-index="${index}" aria-label="Remove item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      `;

      cartItemsContainer.appendChild(itemRow);
    });

    // Bind item modifiers
    const decBtns = cartItemsContainer.querySelectorAll('.dec-qty');
    const incBtns = cartItemsContainer.querySelectorAll('.inc-qty');
    const removeBtns = cartItemsContainer.querySelectorAll('.cart-item-remove');

    decBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }
        updateCartUI();
      });
    });

    incBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        cart[index].quantity += 1;
        updateCartUI();
      });
    });

    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.closest('.cart-item-remove');
        const index = parseInt(target.getAttribute('data-index'), 10);
        cart.splice(index, 1);
        updateCartUI();
      });
    });

    // Update Subtotal display
    cartSubtotal.textContent = `Rs. ${calculateTotal()}`;
  }

  function calculateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return total.toLocaleString('en-US');
  }

  // Toast System
  function showToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.classList.add('toast-notification');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2500);
  }

  // Show order success modal
  function showOrderSuccess() {
    if (orderSuccessModal) {
      orderSuccessModal.classList.add('active');
    } else {
      alert('Order Placed Successfully! Opening WhatsApp to send receipt details...');
    }
  }
}
