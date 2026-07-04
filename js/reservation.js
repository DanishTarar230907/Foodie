/**
 * FOODIE - RESERVATION FORM CONTROLLER
 * Client-side validation, error animations, and local success confirmation
 */

document.addEventListener('DOMContentLoaded', () => {
  initReservationForm();
});

function initReservationForm() {
  const form = document.getElementById('reservationForm');
  const card = document.querySelector('.reservation-card');
  
  if (!form || !card) return;

  const inputs = {
    name: document.getElementById('resName'),
    phone: document.getElementById('resPhone'),
    branch: document.getElementById('resBranch'),
    date: document.getElementById('resDate'),
    time: document.getElementById('resTime'),
    guests: document.getElementById('resGuests')
  };

  // --- Validation Rules ---
  const validators = {
    name: (val) => {
      if (!val.trim()) return 'Name is required.';
      if (val.trim().length < 3) return 'Name must be at least 3 characters.';
      return null;
    },
    phone: (val) => {
      if (!val.trim()) return 'Phone number is required.';
      // Matches Pakistani formats: +92 3xx xxxxxxx, 03xx xxxxxxx, or 10-11 digits
      const phoneRegex = /^((\+92)|(0092)|(0))?3\d{9}$/;
      const cleanVal = val.replace(/[\s-]/g, ''); // strip spaces/dashes
      if (!phoneRegex.test(cleanVal)) {
        return 'Enter a valid Pakistani mobile number (e.g. 03001234567).';
      }
      return null;
    },
    branch: (val) => {
      if (!val || val === '') return 'Please select a branch location.';
      return null;
    },
    date: (val) => {
      if (!val) return 'Reservation date is required.';
      
      const selectedDate = new Date(val);
      const today = new Date();
      // Set hours/mins to zero for date-only comparison
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return 'Date cannot be in the past.';
      }
      return null;
    },
    time: (val) => {
      if (!val || val === '') return 'Please select a preferred time.';
      return null;
    },
    guests: (val) => {
      if (!val || val === '') return 'Please select number of guests.';
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return 'Must be at least 1 guest.';
      return null;
    }
  };

  // --- Core Validation Function ---
  function validateField(fieldName) {
    const input = inputs[fieldName];
    const validator = validators[fieldName];
    if (!input || !validator) return true;

    const errorMsg = validator(input.value);
    const parent = input.closest('.form-group');

    if (errorMsg) {
      // Set invalid class
      parent.classList.add('invalid');
      
      // Update or create error label
      let errorLabel = parent.querySelector('.form-error-msg');
      if (!errorLabel) {
        errorLabel = document.createElement('div');
        errorLabel.classList.add('form-error-msg');
        parent.appendChild(errorLabel);
      }
      
      errorLabel.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>${errorMsg}</span>
      `;
      return false;
    } else {
      // Clear invalid class
      parent.classList.remove('invalid');
      const errorLabel = parent.querySelector('.form-error-msg');
      if (errorLabel) {
        errorLabel.remove();
      }
      return true;
    }
  }

  // Bind Blur Events (Trigger validation when focus leaves a field)
  Object.keys(inputs).forEach(key => {
    const input = inputs[key];
    
    input.addEventListener('blur', () => {
      validateField(key);
    });

    // Clear error inline state as user updates field values
    input.addEventListener('input', () => {
      const parent = input.closest('.form-group');
      if (parent.classList.contains('invalid')) {
        parent.classList.remove('invalid');
        const errorLabel = parent.querySelector('.form-error-msg');
        if (errorLabel) errorLabel.remove();
      }
    });

    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => validateField(key));
    }
  });

  // --- Form Submission Handler ---
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop page reload

    let isFormValid = true;
    let firstInvalidField = null;

    // Run validations on all fields
    Object.keys(inputs).forEach(key => {
      const isValid = validateField(key);
      if (!isValid) {
        isFormValid = false;
        if (!firstInvalidField) {
          firstInvalidField = inputs[key];
        }
      }
    });

    if (!isFormValid) {
      // Focus on first invalid input field to help user
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    // Success State logic (renders local confirmation page)
    const formData = {
      name: inputs.name.value.trim(),
      phone: inputs.phone.value.trim(),
      branch: inputs.branch.options[inputs.branch.selectedIndex].text,
      date: inputs.date.value,
      time: inputs.time.options[inputs.time.selectedIndex].text,
      guests: inputs.guests.value
    };

    // Format date nicely
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(formData.date).toLocaleDateString('en-US', dateOptions);

    // Swap card body with custom Success Screen
    card.innerHTML = `
      <div class="reservation-success-state">
        <div class="success-check-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <h3 class="success-title">Table Reserved!</h3>
        <p class="success-desc">
          Hello <strong>${formData.name}</strong>, your booking at our <strong>Foodie ${formData.branch}</strong> branch has been successfully confirmed.
        </p>
        
        <div class="branch-card" style="width: 100%; text-align: left; margin-bottom: 20px;">
          <div class="branch-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div class="branch-info" style="width: 100%;">
            <div class="branch-name" style="font-size: 0.95rem; margin-bottom: 4px;">Reservation Summary</div>
            <div class="branch-details" style="line-height: 1.5; color: var(--color-text-muted);">
              <strong>Date:</strong> ${formattedDate}<br>
              <strong>Time:</strong> ${formData.time}<br>
              <strong>Guests:</strong> ${formData.guests} Persons<br>
              <strong>Phone:</strong> ${formData.phone}
            </div>
          </div>
        </div>

        <button id="btnNewRes" class="btn btn-primary" style="width: 100%;">Book Another Table</button>
      </div>
    `;

    // Bind event back for new reservations
    document.getElementById('btnNewRes').addEventListener('click', () => {
      // Reload page state to reset reservation form
      window.location.reload();
    });
  });
}
