/**
 * P4C Static Application Bundle
 * Combined client-side functionality for static HTML version
 * Includes Forms, Modals, and core interactivity
 */

/**
 * P4C Static Forms
 * Client-side form handling for static HTML version
 * Handles validation, submission, and form interactions
 */

P4C.Forms = {
    activeForm: null,
    formValidationResults: new Map(),

    // Initialize form functionality
    init: function() {
        console.log('📝 Initializing P4C Forms...');

        // Bind form event handlers
        this.bindFormEvents();

        console.log('✅ P4C Forms initialized');
    },

    // Bind form-related event handlers
    bindFormEvents: function() {
        // Handle form submissions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));

        // Handle form input changes for validation
        document.addEventListener('input', this.handleInputChange.bind(this));
        document.addEventListener('blur', this.handleFieldBlur.bind(this));

        // Handle form-specific buttons
        document.addEventListener('click', function(e) {
            const button = e.target.closest('[data-form-action]');
            if (button) {
                e.preventDefault();
                const action = button.getAttribute('data-form-action');
                const formId = button.getAttribute('data-form-id');
                P4C.Forms.handleFormAction(action, formId);
            }
        });
    },

    // Handle form submission
    handleFormSubmit: function(e) {
        e.preventDefault();
        const form = e.target;

        console.log(`📤 Submitting form: ${form.id || form.name}`);

        // Validate form
        if (this.validateForm(form)) {
            this.submitForm(form);
        } else {
            console.log('❌ Form validation failed');
        }
    },

    // Handle input changes
    handleInputChange: function(e) {
        const field = e.target;
        if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
            this.validateField(field);
        }
    },

    // Handle field blur
    handleFieldBlur: function(e) {
        const field = e.target;
        this.validateField(field);
    },

    // Handle form actions
    handleFormAction: function(action, formId) {
        const form = document.getElementById(formId);

        switch (action) {
            case 'clear':
                if (form) form.reset();
                break;
            case 'reset':
                if (form) form.reset();
                break;
            case 'preview':
                this.previewForm(form);
                break;
        }
    },

    // Validate entire form
    validateForm: function(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Store validation result
        this.formValidationResults.set(form.id || form.name, isValid);

        return isValid;
    },

    // Validate individual field
    validateField: function(field) {
        const required = field.hasAttribute('required');
        const value = field.value.trim();
        let isValid = true;

        // Clear previous error
        this.clearFieldError(field);

        // Check required fields
        if (required && value === '') {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Type-specific validation
        switch (field.type) {
            case 'email':
                isValid = this.validateEmail(value);
                if (!isValid) this.showFieldError(field, 'Please enter a valid email address');
                break;

            case 'tel':
                isValid = this.validatePhone(value);
                if (!isValid) this.showFieldError(field, 'Please enter a valid phone number');
                break;

            case 'password':
                isValid = this.validatePassword(value);
                if (!isValid) this.showFieldError(field, 'Password must be at least 8 characters');
                break;
        }

        // Custom validation rules
        if (field.hasAttribute('data-min-length')) {
            const minLength = parseInt(field.getAttribute('data-min-length'));
            if (value.length < minLength) {
                this.showFieldError(field, `Minimum ${minLength} characters required`);
                isValid = false;
            }
        }

        if (field.hasAttribute('data-max-length')) {
            const maxLength = parseInt(field.getAttribute('data-max-length'));
            if (value.length > maxLength) {
                this.showFieldError(field, `Maximum ${maxLength} characters allowed`);
                isValid = false;
            }
        }

        // Update field styling
        this.updateFieldStyling(field, isValid);

        return isValid;
    },

    // Email validation
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Phone validation
    validatePhone: function(phone) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phone);
    },

    // Password validation
    validatePassword: function(password) {
        return password.length >= 8;
    },

    // Show field error
    showFieldError: function(field, message) {
        field.classList.add('field-error');

        // Create or update error message
        let errorElement = field.parentNode.querySelector('.field-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    },

    // Clear field error
    clearFieldError: function(field) {
        field.classList.remove('field-error');

        const errorElement = field.parentNode.querySelector('.field-error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    },

    // Update field styling
    updateFieldStyling: function(field, isValid) {
        field.classList.toggle('field-valid', isValid);
        field.classList.toggle('field-invalid', !isValid);
    },

    // Submit form (Updated for real AJAX submission)
    submitForm: function(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // 1. Visual Loading State
        this.setFormLoading(form, true);

        // 2. Collect Data
        const formData = new FormData(form);

        // 3. Determine Endpoint (Default to Formspree)
        const action = form.getAttribute('action') || 'https://formspree.io/f/xdkjlgwk';

        // 4. Send Data via Fetch (AJAX)
        fetch(action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                this.handleFormSuccess(form);
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Submission failed');
                });
            }
        })
        .catch(error => {
            console.error('Form Error:', error);
            this.handleFormError(form, error);
        })
        .finally(() => {
            this.setFormLoading(form, false, originalBtnText);
        });
    },

    // Send form data to server (Removed - replaced with fetch in submitForm)
    sendFormData: function(form, formData) {
        // Legacy method removed
    },

    // Set form loading state
    setFormLoading: function(form, isLoading) {
        const submitBtn = form.querySelector('[type="submit"]');
        const inputs = form.querySelectorAll('input, select, textarea');

        if (isLoading) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                submitBtn.classList.add('btn-loading');
            }

            inputs.forEach(input => input.disabled = true);
        } else {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                submitBtn.classList.remove('btn-loading');
            }

            inputs.forEach(input => input.disabled = false);
        }
    },

    // Handle form submission success
    handleFormSuccess: function(form, response) {
        // Show success message
        if (P4C.Modals) {
            P4C.Modals.showSuccess('Form submitted successfully!', 3000);
        }

        // Reset form
        form.reset();

        // Clear validation states
        this.clearFormValidation(form);

        // Trigger success callback if defined
        const successCallback = form.getAttribute('data-on-success');
        if (successCallback && window[successCallback]) {
            window[successCallback](response);
        }
    },

    // Handle form submission error
    handleFormError: function(form, error) {
        // Show error message
        if (P4C.Modals) {
            P4C.Modals.showError('Form submission failed. Please try again.');
        }
    },

    // Clear form validation
    clearFormValidation: function(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            this.clearFieldError(field);
            this.updateFieldStyling(field, true);
        });
    },

    // Preview form data
    previewForm: function(form) {
        const formData = {};
        const fields = form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (field.name) {
                formData[field.name] = field.value;
            }
        });

        console.log('📋 Form preview:', formData);

        // Show preview modal
        const previewHTML = Object.entries(formData)
            .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
            .join('');

        if (P4C.Modals) {
            P4C.Modals.showSuccess(`<strong>Form Preview:</strong><br>${previewHTML}`, 5000);
        }
    }
};

/**
 * P4C Static Modals
 * Client-side modal management for static HTML version
 * Handles portals, authentication, and interactive overlays
 */

P4C.Modals = {
    activeModal: null,
    modalStates: {},

    // Initialize modal functionality
    init: function() {
        console.log('📱 Initializing P4C Modals...');

        // Bind modal event handlers
        this.bindModalEvents();

        console.log('✅ P4C Modals initialized');
    },

    // Bind modal trigger events
    bindModalEvents: function() {
        // Bind buttons with data-modal attribute
        document.addEventListener('click', function(e) {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                const modalId = modalTrigger.getAttribute('data-modal');
                e.preventDefault();
                P4C.Modals.open(modalId);
                return;
            }

            // Handle portal-specific buttons
            const portalButton = e.target.closest('[id*="portal"]');
            if (portalButton && portalButton.id) {
                e.preventDefault();
                P4C.Modals.handlePortalAction(portalButton.id);
                return;
            }

            // Handle close buttons
            if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
                e.preventDefault();
                P4C.Modals.closeAll();
                return;
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                P4C.Modals.closeAll();
            }
        });
    },

    // Open a modal by ID
    open: function(modalId) {
        if (!modalId) return;

        const modal = document.getElementById(modalId + '-modal');
        if (!modal) {
            console.warn(`Modal ${modalId} not found`);
            return;
        }

        // Close any currently open modal
        this.closeAll();

        // Show the modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add backdrop click handler
        setTimeout(() => {
            modal.addEventListener('click', this.handleBackdropClick);
        }, 10);

        // Focus management
        const focusableElement = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
            focusableElement.focus();
        }

        this.activeModal = modalId;
        this.modalStates[modalId] = { open: true };

        console.log(`📱 Opened modal: ${modalId}`);
    },

    // Close a specific modal
    close: function(modalId) {
        if (!modalId) return;

        const modal = document.getElementById(modalId + '-modal');
        if (!modal) return;

        modal.style.display = 'none';
        modal.removeEventListener('click', this.handleBackdropClick);

        document.body.style.overflow = '';

        this.modalStates[modalId] = { open: false };
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    },

    // Close all modals
    closeAll: function() {
        const modals = document.querySelectorAll('[id*="-modal"]');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.removeEventListener('click', this.handleBackdropClick);
        });

        document.body.style.overflow = '';
        this.activeModal = null;

        Object.keys(this.modalStates).forEach(key => {
            this.modalStates[key].open = false;
        });
    },

    // Handle backdrop click
    handleBackdropClick: function(e) {
        if (e.target === this) {
            P4C.Modals.closeAll();
        }
    },

    // Toggle modal
    toggle: function(modalId) {
        if (this.modalStates[modalId]?.open) {
            this.close(modalId);
        } else {
            this.open(modalId);
        }
    },

    // Handle portal-specific actions
    handlePortalAction: function(buttonId) {
        switch (buttonId) {
            case 'search-toggle':
                this.toggle('global-search');
                break;

            case 'portal-toggle':
                this.open('portal');
                break;

            case 'portal-close':
                this.close('portal');
                break;

            case 'partner-portal':
                this.handlePortalLogin('partner');
                break;

            case 'veteran-portal':
                this.handlePortalLogin('veteran');
                break;
        }
    },

    // Handle portal login
    handlePortalLogin: function(portalType) {
        // Store portal type preference
        localStorage.setItem('preferred-portal', portalType);

        // Close portal selection modal
        this.close('portal');

        // Open actual login modal
        setTimeout(() => {
            this.openLoginModal(portalType);
        }, 300);
    },

    // Open login modal
    openLoginModal: function(portalType) {
        // For static version, we'll simulate authentication
        const loginModal = this.createLoginModal(portalType);
        document.body.appendChild(loginModal);
        this.open('portal-login');
    },

    // Create login modal dynamically
    createLoginModal: function(portalType) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'portal-login-modal';
        modalDiv.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center';

        modalDiv.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl p-6 m-4 w-full max-w-md">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center capitalize">
                    ${portalType} Portal Login
                </h2>

                <form id="portal-login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center text-sm">
                            <input type="checkbox" id="remember-me" class="mr-2" />
                            Remember me
                        </label>
                        <button type="button" class="text-sm text-blue-600 hover:text-blue-800">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        id="login-submit"
                    >
                        Sign In
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        Don't have an account?
                        <button id="portal-register" class="text-blue-600 hover:text-blue-800 ml-1 font-medium">
                            Request Access →
                        </button>
                    </p>
                </div>

                <button
                    id="login-close"
                    data-modal-close
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        return modalDiv;
    },

    // Show success message
    showSuccess: function(message, duration = 3000) {
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-[100] animate-fade-in';
        successToast.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(successToast);

        setTimeout(() => {
            successToast.remove();
        }, duration);
    },

    // Show error message
    showError: function(message, duration = 5000) {
        const errorToast = document.createElement('div');
        errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-[100] animate-fade-in';
        errorToast.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>${message}</span>
                <button onclick="this.parentElement.remove()" class="ml-2 hover:text-gray-200">
                    ✕
                </button>
            </div>
        `;

        document.body.appendChild(errorToast);

        setTimeout(() => {
            errorToast.remove();
        }, duration);
    },

    // Animate modal content
    animateModal: function(modalId, direction = 'in') {
        const modal = document.getElementById(modalId + '-modal');
        if (!modal) return;

        const content = modal.querySelector('.modal-content') || modal;

        if (direction === 'in') {
            content.style.transform = 'translateY(-20px) scale(0.95)';
            content.style.opacity = '0';

            setTimeout(() => {
                content.style.transition = 'all 0.3s ease-out';
                content.style.transform = 'translateY(0) scale(1)';
                content.style.opacity = '1';
            }, 10);
        } else {
            content.style.transform = 'translateY(0) scale(1)';
            content.style.opacity = '1';

            setTimeout(() => {
                content.style.transition = 'all 0.2s ease-in';
                content.style.transform = 'translateY(-10px) scale(0.95)';
                content.style.opacity = '0';
            }, 10);
        }
    }
};
