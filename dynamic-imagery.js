/**
 * P4C Dynamic Imagery Manager
 * Unified image system combining Freepik + Pexels APIs
 * Provides contextual, theme-aware image loading throughout the site
 */

P4C.DynamicImagery = {
    // API references
    apis: {
        freepik: null,
        pexels: null
    },

    // Content themes for contextual imagery
    themes: {
        homepage: {
            hero: ['homes', 'beautiful modern house', 'family friendly home'],
            gallery: ['homes', 'modern housing', 'residential areas'],
            testimonials: ['family', 'happy family', 'community housing'],
            cta: ['affordable', 'section 8 housing', 'rental properties']
        },
        about: {
            hero: ['veterans', 'american flag home', 'patriotic housing'],
            team: ['military veterans', 'professional team', 'community leaders'],
            impact: ['housing transformation', 'property renovation', 'community development'],
            values: ['american values', 'patriotism', 'honor integrity']
        },
        projects: {
            portfolio: ['renovation', 'home improvement', 'property development'],
            before_after: ['construction work', 'building restoration', 'renovation'],
            showcase: ['luxury homes', 'modern architecture', 'property showcase']
        },
        resources: {
            veterans: ['va housing', 'veterans benefits', 'military family housing'],
            guides: ['financial planning', 'housing guide', 'property investment'],
            calculators: ['mortgage calculator', 'housing budget', 'financial planning']
        },
        insights: {
            market: ['real estate market', 'housing trends', 'property investment'],
            veterans: ['veteran housing policy', 'va loans', 'veterans housing rights'],
            finance: ['mortgage planning', 'home financing', 'property loans']
        }
    },

    // Loading states and cache
    cache: {
        images: new Map(),
        featured: [],
        expiry: 60 * 60 * 1000 // 1 hour
    },

    /**
     * Initialize dynamic imagery system
     */
    init: function() {
        console.log('🌟 Initializing P4C Dynamic Imagery...');

        // Initialize API managers
        if (window.P4C.FreepikManager) {
            this.apis.freepik = P4C.FreepikManager;
            this.apis.freepik.init();
        }

        if (window.P4C.PexelsManager) {
            this.apis.pexels = P4C.PexelsManager;
            this.apis.pexels.init();
        }

        // Determine current page theme
        this.currentTheme = this.detectPageTheme();
        console.log(`🎯 Detected theme: ${this.currentTheme}`);

        // Load featured images for theme
        this.loadThemeImages();

        // Setup lazy loading for image containers
        this.setupImageContainers();

        console.log('✅ Dynamic Imagery initialized');
    },

    /**
     * Detect current page theme from URL and content
     */
    detectPageTheme: function() {
        const path = window.location.pathname;

        if (path.includes('about')) return 'about';
        if (path.includes('projects')) return 'projects';
        if (path.includes('resources')) return 'resources';
        if (path.includes('insights')) return 'insights';

        // Check content for theme indicators
        const content = document.body.textContent.toLowerCase();
        if (content.includes('veteran') || content.includes('military')) return 'veterans';
        if (content.includes('family') || content.includes('children')) return 'family';

        return 'homepage'; // Default theme
    },

    /**
     * Load images for current theme from multiple APIs
     */
    loadThemeImages: async function() {
        const theme = this.themes[this.currentTheme] || this.themes.homepage;

        // Load images for each theme category
        for (const [category, keywords] of Object.entries(theme)) {
            await this.loadCategoryImages(category, keywords);
        }

        console.log(`📸 Loaded ${this.cache.images.size} theme images`);
    },

    /**
     * Load images for a specific category using multiple APIs
     */
    loadCategoryImages: async function(category, keywords) {
        const cacheKey = `${this.currentTheme}_${category}`;

        // Check cache first
        if (this.cache.images.has(cacheKey)) {
            const cached = this.cache.images.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cache.expiry) {
                return cached.images;
            }
        }

        // Load from multiple APIs
        const promises = [];

        if (this.apis.freepik) {
            promises.push(
                this.apis.freepik.searchImages(keywords[0], keywords[1] || '', 4)
                    .catch(() => []) // Continue if one API fails
            );
        }

        if (this.apis.pexels) {
            promises.push(
                this.apis.pexels.searchImages(keywords[0], keywords[1] || '', 4)
                    .catch(() => []) // Continue if one API fails
            );
        }

        try {
            const results = await Promise.all(promises);
            const allImages = results.flat();

            // Shuffle and deduplicate
            const uniqueImages = this.shuffleAndDeduplicate(allImages);

            // Cache the results
            this.cache.images.set(cacheKey, {
                images: uniqueImages.slice(0, 8),
                timestamp: Date.now()
            });

            return uniqueImages.slice(0, 8);

        } catch (error) {
            console.error(`Failed to load category images for ${category}:`, error);
            return [];
        }
    },

    /**
     * Shuffle and remove duplicate images
     */
    shuffleAndDeduplicate: function(images) {
        const seen = new Set();
        const unique = [];

        // Shuffle first
        const shuffled = [...images].sort(() => Math.random() - 0.5);

        // Remove duplicates by URL
        shuffled.forEach(img => {
            const key = `${img.url}_${img.width}_${img.height}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(img);
            }
        });

        return unique;
    },

    /**
     * Setup image containers for dynamic loading
     */
    setupImageContainers: function() {
        document.addEventListener('DOMContentLoaded', () => {
            // Find image containers with data attributes
            const containers = document.querySelectorAll('[data-dynamic-image]');

            containers.forEach(container => {
                this.setupContainer(container);
            });

            // Setup hero image containers
            const heroContainers = document.querySelectorAll('[data-hero-image]');
            heroContainers.forEach(container => {
                this.loadHeroImage(container);
            });

            // Setup gallery containers
            const galleryContainers = document.querySelectorAll('[data-image-gallery]');
            galleryContainers.forEach(container => {
                this.loadGallery(container);
            });
        });
    },

    /**
     * Setup individual dynamic image container
     */
    setupContainer: function(container) {
        const category = container.getAttribute('data-dynamic-image');
        const count = parseInt(container.getAttribute('data-image-count')) || 1;

        if (!category) return;

        // Show loading state
        container.innerHTML = '<div class="dynamic-loading">Loading beautiful imagery...</div>';

        // Load images
        this.loadContainerImages(container, category, count);
    },

    /**
     * Load images for a specific container
     */
    loadContainerImages: async function(container, category, count) {
        try {
            let images = [];

            // Special handling for certain categories
            if (category === 'featured') {
                images = await this.getFeaturedImages(count);
            } else if (category === 'hero' && this.currentTheme) {
                const themeKeywords = this.themes[this.currentTheme]?.hero || ['modern home'];
                images = await this.loadCategoryImages(category, themeKeywords);
            } else {
                images = await this.loadCategoryImages(category, [category]);
            }

            // Render images
            this.renderContainer(container, images, category);

        } catch (error) {
            console.error('Failed to load container images:', error);
            container.innerHTML = '<div class="image-error">Images temporarily unavailable</div>';
        }
    },

    /**
     * Render images in container based on layout type
     */
    renderContainer: function(container, images, category) {
        if (!images || images.length === 0) {
            container.innerHTML = '<div class="no-images">No images available</div>';
            return;
        }

        const layout = container.getAttribute('data-layout') || 'single';
        let html = '';

        switch (layout) {
            case 'grid':
                html = this.renderGridLayout(images, category);
                break;
            case 'slider':
                html = this.renderSliderLayout(images, category);
                break;
            case 'masonry':
                html = this.renderMasonryLayout(images, category);
                break;
            case 'single':
            default:
                html = this.renderSingleImage(images[0], category);
                break;
        }

        container.innerHTML = html;
        container.classList.add('images-loaded');

        // Setup lazy loading
        this.setupLazyLoading(container);
    },

    /**
     * Render grid layout
     */
    renderGridLayout: function(images, category) {
        const gridClasses = images.length >= 6 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' :
                          images.length >= 4 ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' :
                          'grid grid-cols-1 gap-4';

        return `
            <div class="${gridClasses} dynamic-gallery">
                ${images.map((img, index) => `
                    <div class="dynamic-gallery-item relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-on-scroll"
                         style="animation-delay: ${index * 100}ms">
                        <img src="${img.thumbnail}"
                             data-src="${img.url}"
                             alt="${img.alt}"
                             class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105 lazy-image"
                             loading="lazy">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div class="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <div class="text-sm opacity-90">${img.credit}</div>
                        </div>
                        ${this.getCategoryBadge(category)}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render hero image
     */
    renderSingleImage: function(image, category) {
        return `
            <div class="relative overflow-hidden rounded-lg shadow-2xl">
                <img src="${image.thumbnail}"
                     data-src="${image.url}"
                     alt="${image.alt}"
                     class="w-full h-96 object-cover lazy-image"
                     loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4 text-white">
                    <div class="text-sm opacity-90">${image.credit}</div>
                    <h2 class="text-2xl font-bold mt-1">${this.getCategoryTitle(category)}</h2>
                </div>
                ${this.getCategoryBadge(category)}
            </div>
        `;
    },

    /**
     * Render slider layout
     */
    renderSliderLayout: function(images, category) {
        return `
            <div class="dynamic-slider relative">
                <div class="slider-container flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    ${images.map(img => `
                        <div class="slider-slide flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 snap-start px-2">
                            <div class="relative overflow-hidden rounded-lg shadow-lg h-64">
                                <img src="${img.thumbnail}"
                                     data-src="${img.url}"
                                     alt="${img.alt}"
                                     class="w-full h-full object-cover lazy-image"
                                     loading="lazy">
                                <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                                    <div class="text-xs opacity-75">${img.credit}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="slider-dots flex justify-center mt-4">
                    ${images.map((_, index) => `<button class="slider-dot w-2 h-2 rounded-full bg-gray-300 mx-1 ${index === 0 ? 'bg-blue-500' : ''}" data-slide="${index}"></button>`).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render masonry layout
     */
    renderMasonryLayout: function(images, category) {
        return `
            <div class="dynamic-masonry columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                ${images.map((img, index) => `
                    <div class="dynamic-masonry-item break-inside-avoid mb-4 animate-on-scroll"
                         style="animation-delay: ${index * 50}ms">
                        <div class="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer">
                            <img src="${img.thumbnail}"
                                 data-src="${img.url}"
                                 alt="${img.alt}"
                                 class="w-full object-cover transition-transform duration-300 group-hover:scale-105 lazy-image"
                                 loading="lazy"
                                 style="height: ${this.getRandomHeight()}">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div class="absolute bottom-2 left-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                ${img.credit}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Load hero background images
     */
    loadHeroImage: async function(container) {
        try {
            const category = container.getAttribute('data-hero-image') || 'homes';
            const images = await this.loadCategoryImages(category, [category, 'hero']);
            const image = images[0];

            if (image) {
                container.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${image.url})`;
                container.style.backgroundSize = 'cover';
                container.style.backgroundPosition = 'center';
                container.classList.add('hero-loaded');
            }
        } catch (error) {
            console.error('Failed to load hero image:', error);
        }
    },

    /**
     * Load gallery images
     */
    loadGallery: async function(container) {
        const galleryType = container.getAttribute('data-image-gallery');
        const containerId = container.id || 'gallery_' + Math.random().toString(36).substr(2, 9);

        container.id = containerId;

        try {
            let images = [];
            if (galleryType === 'featured') {
                images = await this.getFeaturedImages(12);
            } else {
                images = await this.loadCategoryImages(galleryType, [galleryType]);
            }

            // Use grid layout for galleries
            this.renderContainer(container, images, 'gallery');

        } catch (error) {
            console.error('Failed to load gallery:', error);
        }
    },

    /**
     * Get featured/high-quality images
     */
    getFeaturedImages: async function(count = 6) {
        if (this.cache.featured.length >= count) {
            return this.cache.featured.slice(0, count);
        }

        try {
            let images = [];

            if (this.apis.pexels) {
                images = await this.apis.pexels.getCuratedPhotos(count);
            } else if (this.apis.freepik) {
                images = await this.apis.freepik.searchImages('homes', '', count);
            }

            this.cache.featured = images;
            return images;

        } catch (error) {
            console.error('Failed to load featured images:', error);
            return [];
        }
    },

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading: function(container) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const fullSrc = img.getAttribute('data-src');
                    if (fullSrc && img.src !== fullSrc) {
                        img.src = fullSrc;
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        const lazyImages = container.querySelectorAll('.lazy-image');
        lazyImages.forEach(img => imageObserver.observe(img));
    },

    /**
     * Helper functions
     */
    getCategoryBadge: function(category) {
        if (category === 'veterans') {
            return '<div class="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">Veterans</div>';
        }
        if (category === 'family') {
            return '<div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">Family</div>';
        }
        return '';
    },

    getCategoryTitle: function(category) {
        const titles = {
            homes: 'Beautiful Homes',
            veterans: 'Veterans First',
            family: 'Family Focused',
            renovation: 'Expert Renovations',
            hero: 'Welcome to P4C'
        };
        return titles[category] || 'Amazing Properties';
    },

    getRandomHeight: function() {
        const heights = ['200px', '300px', '250px', '350px', '280px'];
        return heights[Math.floor(Math.random() * heights.length)];
    },

    /**
     * Preload critical images
     */
    preloadCriticalImages: function() {
        // Find hero and above-the-fold images
        const criticalContainers = document.querySelectorAll('[data-hero-image], [data-dynamic-image]:not([data-below-fold])');

        criticalContainers.forEach(container => {
            const images = container.querySelectorAll('img[data-src]');
            images.forEach(img => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = img.getAttribute('data-src');
                document.head.appendChild(link);
            });
        });
    },

    /**
     * Get imagery statistics
     */
    getStats: function() {
        return {
            totalImages: this.cache.images.size,
            featuredImages: this.cache.featured.length,
            currentTheme: this.currentTheme,
            apisLoaded: {
                freepik: !!this.apis.freepik,
                pexels: !!this.apis.pexels
            }
        };
    }
};

// Initialize when all APIs are loaded
if (window.P4C) {
    P4C.DynamicImagery = P4C.DynamicImagery || {};
    Object.assign(P4C.DynamicImagery, this.P4C.DynamicImagery);
}
