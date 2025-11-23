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
