/**
 * P4C PWA Icon Generator
 * Creates all required PWA icons programmatically
 * Generates SVG-based icons with the P4C brand styling
 */

P4C.PWAIconGenerator = {
    // P4C Brand Colors
    colors: {
        primary: '#dc2626',    // red-600
        secondary: '#059669',  // emerald-600
        background: '#1e293b', // navy-800
        text: '#ffffff'        // white
    },

    // Icon sizes required by manifest.json
    iconSizes: [
        { size: 72, filename: 'icon-72x72.png' },
        { size: 96, filename: 'icon-96x96.png' },
        { size: 128, filename: 'icon-128x128.png' },
        { size: 144, filename: 'icon-144x144.png' },
        { size: 152, filename: 'icon-152x152.png' },
        { size: 192, filename: 'icon-192x192.png' },
        { size: 384, filename: 'icon-384x384.png' },
        { size: 512, filename: 'icon-512x512.png' }
    ],

    /**
     * Initialize icon generation
     */
    init: function() {
        console.log('🎨 Initializing P4C PWA Icon Generator...');
        this.generateAllIcons();
        this.generateScreenshots();
        console.log('✅ PWA Icon Generator ready');
    },

    /**
     * Generate the main P4C logo SVG
     */
    generateLogoSVG: function(size) {
        const padding = size * 0.1;
        const logoSize = size - (padding * 2);
        const centerX = size / 2;
        const centerY = size / 2;
        const cornerRadius = logoSize * 0.2;

        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="${size}" height="${size}" fill="${this.colors.background}" rx="${cornerRadius * 2}" ry="${cornerRadius * 2}"/>

            <!-- Logo Background Circle -->
            <circle cx="${centerX}" cy="${centerY}" r="${logoSize * 0.45}" fill="url(#logoGradient)"/>

            <!-- Text "P4" -->
            <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="central"
                  font-family="Arial, sans-serif" font-size="${logoSize * 0.5}" font-weight="bold" fill="${this.colors.text}">
                P4
            </text>

            <!-- Gradient Definition -->
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${this.colors.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
                </linearGradient>
            </defs>
        </svg>`;
    },

    /**
     * Generate icon for specific size
     */
    generateIcon: async function(size) {
        const svgContent = this.generateLogoSVG(size);

        // Convert SVG to data URL for immediate use
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const filename = `icon-${size}x${size}.png`;

        // For now, create a data URL version that browsers can understand
        // In a real implementation, you'd convert SVG to PNG using canvas or a server endpoint
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

        this.saveIconToStorage(filename, dataUrl);

        return { filename, dataUrl, size };
    },

    /**
     * Save icon to localStorage (temporary solution)
     * In production, these would be static files
     */
    saveIconToStorage: function(filename, dataUrl) {
        try {
            const icons = JSON.parse(localStorage.getItem('p4c_pwa_icons') || '{}');
            icons[filename] = dataUrl;
            localStorage.setItem('p4c_pwa_icons', JSON.stringify(icons));
        } catch (e) {
            console.warn('Failed to save PWA icon to storage:', e);
        }
    },

    /**
     * Generate all required PWA icons
     */
    generateAllIcons: async function() {
        console.log('🔄 Generating PWA icons...');

        const generatedIcons = {};
        const promises = this.iconSizes.map(iconSpec =>
            this.generateIcon(iconSpec.size).then(result => {
                generatedIcons[iconSpec.filename] = result;
                console.log(`✓ Generated ${iconSpec.filename}`);
            })
        );

        await Promise.all(promises);

        // Update manifest.json with generated icons
        this.updateManifest(generatedIcons);

        console.log('✅ All PWA icons generated');
    },

    /**
     * Update manifest.json with generated icons
     */
    updateManifest: function(generatedIcons) {
        const manifestPath = 'manifest.json';
        const publicManifestPath = 'public/manifest.json';

        // Create manifest content
        const manifestContent = {
            "name": "Properties 4 Creation - Veteran Housing Solutions",
            "short_name": "P4C",
            "description": "Expert renovations and housing solutions for veterans. Get cash offers for properties and connect veterans with Section 8 eligible housing.",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": this.colors.secondary,
            "orientation": "portrait-primary",
            "categories": ["business", "lifestyle", "utilities"],
            "lang": "en-US",
            "dir": "ltr",
            "scope": "/",
            "icons": Object.keys(generatedIcons).map(filename => {
                const icon = generatedIcons[filename];
                return {
                    "src": `icons/${filename}`,
                    "sizes": `${icon.size}x${icon.size}`,
                    "type": "image/png",
                    "purpose": "any maskable"
                };
            }),
            "screenshots": [
                {
                    "src": "screenshots/screenshot-wide.png",
                    "sizes": "1280x720",
                    "type": "image/png",
                    "form_factor": "wide"
                },
                {
                    "src": "screenshots/screenshot-narrow.png",
                    "sizes": "750x1334",
                    "type": "image/png",
                    "form_factor": "narrow"
                }
            ],
            "shortcuts": [
                {
                    "name": "Our Projects",
                    "short_name": "Projects",
                    "description": "Browse our completed renovations",
                    "url": "/projects",
                    "icons": [{
                        "src": "icons/icon-96x96.png",
                        "sizes": "96x96"
                    }]
                },
                {
                    "name": "Get Started",
                    "short_name": "Get Started",
                    "description": "Contact us for housing solutions",
                    "url": "/get-started",
                    "icons": [{
                        "src": "icons/icon-96x96.png",
                        "sizes": "96x96"
                    }]
                }
            ]
        };

        // Save to localStorage for dynamic loading
        try {
            localStorage.setItem('p4c_manifest', JSON.stringify(manifestContent));
        } catch (e) {
            console.warn('Failed to save manifest to storage:', e);
        }
    },

    /**
     * Generate sample screenshots (placeholder)
     */
    generateScreenshots: function() {
        console.log('📸 Generating sample screenshots...');

        // Create sample screenshot SVGs
        const wideScreenshot = this.generateScreenshotSVG(1280, 720, 'wide');
        const narrowScreenshot = this.generateScreenshotSVG(750, 1334, 'narrow');

        // Save to storage
        this.saveScreenshot('screenshot-wide.png', wideScreenshot);
        this.saveScreenshot('screenshot-narrow.png', narrowScreenshot);

        console.log('✅ Sample screenshots generated');
    },

    /**
     * Generate screenshot SVG placeholder
     */
    generateScreenshotSVG: function(width, height, type) {
        return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="${width}" height="${height}" fill="#1e293b"/>

            <!-- Header -->
            <rect x="0" y="0" width="${width}" height="60" fill="#0f172a"/>
            <circle cx="30" cy="30" r="15" fill="#dc2626"/>
            <text x="50" y="35" font-family="Arial" font-size="16" fill="#ffffff">P4C - Properties 4 Creation</text>

            <!-- Main Content -->
            <rect x="20" y="80" width="${width - 40}" height="${height - 160}" fill="#ffffff" rx="8"/>
            <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="Arial" font-size="24" fill="#1e293b">
                Veteran Housing Solutions
            </text>
            <text x="${width/2}" y="${height/2 + 40}" text-anchor="middle" font-family="Arial" font-size="18" fill="#64748b">
                Professional renovations & fair cash offers
            </text>

            <!-- Sample property card -->
            <rect x="40" y="${height/2 + 80}" width="300" height="200" fill="#f8fafc" rx="8" stroke="#e2e8f0"/>
            <rect x="40" y="${height/2 + 80}" width="300" height="120" fill="#e5e7eb" rx="8"/>
            <text x="190" y="${height/2 + 220}" text-anchor="middle" font-family="Arial" font-size="14" fill="#1e293b">
                Sample Property Card
            </text>

            <!-- Footer -->
            <rect x="0" y="${height - 60}" width="${width}" height="60" fill="#1e293b"/>
            <text x="${width/2}" y="${height - 30}" text-anchor="middle" font-family="Arial" font-size="14" fill="#ffffff">
                ${type === 'wide' ? 'Desktop Screenshot' : 'Mobile Screenshot'}
            </text>
        </svg>`;
    },

    /**
     * Save screenshot to storage
     */
    saveScreenshot: function(filename, svgContent) {
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

        try {
            const screenshots = JSON.parse(localStorage.getItem('p4c_screenshots') || '{}');
            screenshots[filename] = dataUrl;
            localStorage.setItem('p4c_screenshots', JSON.stringify(screenshots));
        } catch (e) {
            console.warn('Failed to save screenshot to storage:', e);
        }
    },

    /**
     * Get dynamic manifest for PWA registration
     */
    getManifest: function() {
        try {
            const stored = localStorage.getItem('p4c_manifest');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.warn('Failed to load manifest:', e);
            return null;
        }
    },

    /**
     * Register PWA with dynamic manifest
     */
    registerPWA: function() {
        const manifest = this.getManifest();
        if (!manifest) {
            console.warn('No PWA manifest available');
            return;
        }

        // Create and register link element for manifest
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(manifest));
        document.head.appendChild(link);

        // Register service worker if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('✅ PWA Service Worker registered'))
                .catch(error => console.error('❌ PWA Service Worker registration failed:', error));
        }
    }
};

// Auto-generate icons when script loads
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            P4C.PWAIconGenerator = P4C.PWAIconGenerator || {};
            Object.assign(P4C.PWAIconGenerator, this.PWAIconGenerator);
            P4C.PWAIconGenerator.init();
        }, 100);
    });
}
