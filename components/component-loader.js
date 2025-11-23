/**
 * P4C Component Loader
 * Dynamically loads header and footer components into pages
 */

// Create P4C namespace if it doesn't exist
if (typeof P4C === 'undefined') {
  window.P4C = {};
}

/**
 * ComponentLoader - Manages dynamic component loading
 * @namespace P4C.ComponentLoader
 */
P4C.ComponentLoader = {
  /**
   * Initialize component loader
   * Loads header and footer components and sets up interactivity
   * @function init
   */
  init: function() {
    console.log('🔄 Loading P4C Components...');
    this.loadHeader();
    this.loadFooter();
    console.log('✅ P4C Components loaded');
  },

  /**
   * Load header component dynamically
   * Fetches header.html and inserts into DOM
   * @async
   * @function loadHeader
   */
  loadHeader: async function() {
    try {
      const headerPlaceholder = document.getElementById('header-placeholder');
      const targetElement = headerPlaceholder || document.body;
      const insertPosition = headerPlaceholder ? 'beforeend' : 'afterbegin';

      const response = await fetch('components/header.html');
      if (!response.ok) {
        throw new Error(`Failed to load header: ${response.status}`);
      }

      const headerHTML = await response.text();
      targetElement.insertAdjacentHTML(insertPosition, headerHTML);

      // Reinitialize header interactivity
      this.reinitializeHeaderInteractivity();
    } catch (error) {
      console.error('Error loading header component:', error);
    }
  },

  /**
   * Load footer component dynamically
   * Fetches footer.html and inserts into DOM
   * Updates copyright year to current year
   * @async
   * @function loadFooter
   */
  loadFooter: async function() {
    try {
      const footerPlaceholder = document.getElementById('footer-placeholder');
      const targetElement = footerPlaceholder || document.body;
      const insertPosition = footerPlaceholder ? 'beforeend' : 'beforeend';

      const response = await fetch('components/footer.html');
      if (!response.ok) {
        throw new Error(`Failed to load footer: ${response.status}`);
      }

      const footerHTML = await response.text();
      targetElement.insertAdjacentHTML(insertPosition, footerHTML);

      // Update copyright year
      const currentYearElement = document.getElementById('current-year');
      if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
      }
    } catch (error) {
      console.error('Error loading footer component:', error);
    }
  },

  /**
   * Reinitialize header interactivity for dynamically loaded content
   * Reattaches event listeners to header elements
   * @function reinitializeHeaderInteractivity
   */
  reinitializeHeaderInteractivity: function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', 
          mobileMenu.classList.contains('active') ? 'true' : 'false');
      });
    }

    // Close mobile menu when clicking outside
    if (mobileMenu) {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-toggle')) {
          mobileMenu.classList.remove('active');
          if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }

    // Search button toggle
    const searchButton = document.querySelector('[data-toggle="search"]');
    const searchContainer = document.querySelector('.search-container');
    if (searchButton && searchContainer) {
      searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        searchContainer.classList.toggle('active');
        const searchInput = searchContainer.querySelector('input');
        if (searchInput && searchContainer.classList.contains('active')) {
          searchInput.focus();
        }
      });
    }

    // Portal button toggle
    const portalButton = document.querySelector('[data-toggle="portal"]');
    const portalMenu = document.querySelector('.portal-menu');
    if (portalButton && portalMenu) {
      portalButton.addEventListener('click', (e) => {
        e.stopPropagation();
        portalMenu.classList.toggle('active');
        portalButton.setAttribute('aria-expanded', 
          portalMenu.classList.contains('active') ? 'true' : 'false');
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (searchContainer && !e.target.closest('.search-container') && !e.target.closest('[data-toggle="search"]')) {
        searchContainer.classList.remove('active');
      }
      if (portalMenu && !e.target.closest('.portal-menu') && !e.target.closest('[data-toggle="portal"]')) {
        portalMenu.classList.remove('active');
      }
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (searchContainer) searchContainer.classList.remove('active');
        if (portalMenu) portalMenu.classList.remove('active');
      }
    });
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    P4C.ComponentLoader.init();
  });
} else {
  P4C.ComponentLoader.init();
}
