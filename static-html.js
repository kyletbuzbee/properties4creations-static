/**
 * P4C Static HTML Framework
 * Main JavaScript library that enables full Next.js app behavior in static HTML
 * Mimics all interactive features including maps, search, forms, and navigation
 */

// Global P4C namespace
const P4C = window.P4C || {};

// Core properties and state
P4C.config = {
    // App configuration
    appName: 'Properties 4 Creations',
    currentPage: null,
    baseURL: window.location.origin,

    // Feature flags
    enableMaps: true,
    enableSearch: true,
    enableForms: true,
    enableModals: true,
    enableAnalytics: true,

    // Map configuration
    mapConfig: {
        center: [30.2672, -97.7431], // Austin, TX
        zoom: 10,
        tileServer: 'https://tiles.openfreemap.org/tiles/{z}/{x}/{y}.png'
    },

    // Search configuration
    searchConfig: {
        debounceMs: 300,
        maxResults: 8,
        searchData: []
    }
};

// State management
P4C.state = {
    // Modal states
    modals: {
        search: { open: false },
        portal: { open: false },
        login: { open: false }
    },

    // Search state
    search: {
        query: '',
        results: [],
        loading: false
    },

    // Map state
    map: {
        instances: new Map(),
        markers: []
    },

    // Form state
    forms: new Map()
};

// DOM utilities
P4C.Utils = {
    // Event delegation helpers
    on: function(element, event, selector, handler) {
        element.addEventListener(event, function(e) {
            if (e.target.matches(selector) || e.target.closest(selector)) {
                handler.call(e.target, e);
            }
        });
    },

    // DOM manipulation helpers
    show: function(element) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (element) element.style.display = '';
    },

    hide: function(element) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (element) element.style.display = 'none';
    },

    toggle: function(element) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    },

    addClass: function(element, className) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (element) element.classList.add(className);
    },

    removeClass: function(element, className) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (element) element.classList.remove(className);
    },

    toggleClass: function(element, className) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (element) element.classList.toggle(className);
    },

    // AJAX helper for static forms
    ajax: function(options) {
        const xhr = new XMLHttpRequest();
        const { method = 'GET', url, data, success, error } = options;

        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (success) success(JSON.parse(xhr.responseText), xhr.status);
            } else {
                if (error) error(xhr);
            }
        };

        xhr.onerror = function() {
            if (error) error(xhr);
        };

        if (data && typeof data === 'object') {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }

        return xhr;
    },

    // Animation utilities
    animate: function(element, properties, duration = 300, callback) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element) return;

        const startValues = {};
        const endValues = {};

        // Parse properties
        for (const prop in properties) {
            const start = window.getComputedStyle(element)[prop];
            startValues[prop] = parseFloat(start) || 0;
            endValues[prop] = properties[prop];
        }

        let startTime;
        function animateFrame(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Linear easing for now (could be enhanced)
            const currentValues = {};
            for (const prop in properties) {
                currentValues[prop] = startValues[prop] + (endValues[prop] - startValues[prop]) * progress;
                element.style[prop] = currentValues[prop] + 'px';
            }

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                if (callback) callback();
            }
        }

        requestAnimationFrame(animateFrame);
    }
};

// Initialize P4C framework
P4C.init = function() {
    // Detect current page
    this.detectCurrentPage();

    // Initialize core features
    this.initGlobalEventHandlers();

    if (this.config.enableSearch) this.Search.init();
    if (this.config.enableMaps) this.Maps.init();
    if (this.config.enableModals) this.Modals.init();
    if (this.config.enableForms) this.Forms.init();

    // Add loading complete class to body
    document.body.classList.add('p4c-loaded');

    console.log('🚀 P4C Static Framework initialized successfully');
};

// Detect current page from filename
P4C.detectCurrentPage = function() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    this.currentPage = filename;

    console.log('📄 Current page:', this.currentPage);
};

// Initialize global event handlers
P4C.initGlobalEventHandlers = function() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (P4C.config.enableSearch) {
                P4C.Modals.toggle('search');
            }
        }

        // Escape key handling
        if (e.key === 'Escape') {
            // Close any open modals
            Object.keys(P4C.state.modals).forEach(modalId => {
                if (P4C.state.modals[modalId].open) {
                    P4C.Modals.close(modalId);
                }
            });
        }
    });

    // Click outside modal handlers
    document.addEventListener('click', function(e) {
        Object.keys(P4C.state.modals).forEach(modalId => {
            const modal = document.getElementById(`${modalId}-modal`);
            if (modal && P4C.state.modals[modalId].open && !modal.contains(e.target)) {
                const modalContent = modal.querySelector('.modal-content') || modal;
                if (!modalContent.contains(e.target)) {
                    P4C.Modals.close(modalId);
                }
            }
        });
    });

    // Smooth scrolling for anchor links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Form shortcut prevention
    document.addEventListener('submit', function(e) {
        e.preventDefault();
        const form = e.target;
        if (P4C.config.enableForms && P4C.Forms) {
            P4C.Forms.handleSubmit(form);
        }
    });
};

// Browser compatibility checks
P4C.browserSupport = function() {
    const features = {
        es6: !!window.Promise,
        map: !!window.Map,
        fetch: !!window.fetch,
        localstorage: (function() {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch(e) { return false; }
        })()
    };

    const issues = Object.keys(features).filter(feature => !features[feature]);

    return {
        supported: issues.length === 0,
        issues: issues,
        features: features
    };
};

// Performance monitoring
P4C.performance = function() {
    return {
        loadTime: performance.now(),
        resources: performance.getEntriesByType('resource'),
        navigation: performance.getEntriesByType('navigation')[0]
    };
};

// Error handling
P4C.handleError = function(error, source) {
    console.error(`P4C Error in ${source}:`, error);

    // Could implement error reporting here
    if (this.config.enableAnalytics) {
        // Send error to analytics service
    }
};

// Make it global
window.P4C = P4C;

// Export for ES modules compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = P4C;
}
