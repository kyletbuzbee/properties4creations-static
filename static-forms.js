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
