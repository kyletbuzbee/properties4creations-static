// Unified Header Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isOpen = mobileMenu.classList.contains('max-h-0');
            
            if (isOpen) {
                mobileMenu.classList.remove('max-h-0', 'opacity-0', 'invisible', '-translate-y-2');
                mobileMenu.classList.add('max-h-96', 'opacity-100', 'visible', 'translate-y-0');
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
                mobileMenuToggle.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
            } else {
                mobileMenu.classList.add('max-h-0', 'opacity-0', 'invisible', '-translate-y-2');
                mobileMenu.classList.remove('max-h-96', 'opacity-100', 'visible', 'translate-y-0');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>';
            }
        });

        // Close mobile menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('max-h-0', 'opacity-0', 'invisible', '-translate-y-2');
                mobileMenu.classList.remove('max-h-96', 'opacity-100', 'visible', 'translate-y-0');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>';
            });
        });
    }

    // Global Search Keyboard Shortcut (⌘K or Ctrl+K)
    document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });

    // Search Toggle Buttons
    const headerSearchToggle = document.getElementById('header-search-toggle');
    const mobileSearchToggle = document.getElementById('mobile-search-toggle');

    if (headerSearchToggle) {
        headerSearchToggle.addEventListener('click', openSearch);
    }
    if (mobileSearchToggle) {
        mobileSearchToggle.addEventListener('click', function() {
            openSearch();
            // Close mobile menu
            if (mobileMenu) {
                mobileMenu.classList.add('max-h-0', 'opacity-0', 'invisible', '-translate-y-2');
                mobileMenu.classList.remove('max-h-96', 'opacity-100', 'visible', 'translate-y-0');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function openSearch() {
        // Trigger global search modal (implement via static-search.js or similar)
        if (window.P4C && window.P4C.openSearch) {
            window.P4C.openSearch();
        }
    }

    // Portal Toggle Buttons
    const headerPortalToggle = document.getElementById('header-portal-toggle');
    const mobilePortalToggle = document.getElementById('mobile-portal-toggle');

    if (headerPortalToggle) {
        headerPortalToggle.addEventListener('click', openPortalModal);
    }
    if (mobilePortalToggle) {
        mobilePortalToggle.addEventListener('click', function() {
            openPortalModal();
            // Close mobile menu
            if (mobileMenu) {
                mobileMenu.classList.add('max-h-0', 'opacity-0', 'invisible', '-translate-y-2');
                mobileMenu.classList.remove('max-h-96', 'opacity-100', 'visible', 'translate-y-0');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function openPortalModal() {
        if (window.P4C && window.P4C.openPortal) {
            window.P4C.openPortal();
        }
    }

    // Set active navigation item based on current page
    const currentLocation = location.pathname;
    const navLinks = document.querySelectorAll('nav a[href]');
    
    navLinks.forEach(link => {
        let href = link.getAttribute('href');
        // Normalize href for comparison
        if (href === currentLocation || href === currentLocation + '/' || 
            currentLocation.endsWith(href.replace('.html', '.html')) ||
            (href === 'index.html' && currentLocation === '/')) {
            link.classList.add('bg-white/20');
        }
    });

    console.log('Header navigation initialized');
});
