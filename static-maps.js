/**
 * P4C Static Maps
 * Client-side Leaflet map implementation for static HTML version
 * Provides interactive property maps identical to Next.js version
 */

P4C.Maps = {
    mapInstance: null,
    markers: [],

    // Initialize maps functionality
    init: function() {
        console.log('🗺️ Initializing P4C Maps...');

        // Load Leaflet if not available
        if (typeof L === 'undefined') {
            this.loadLeafletLibrary();
        } else {
            this.bindMapEvents();
        }

        console.log('✅ P4C Maps initialized');
    },

    // Load Leaflet library dynamically
    loadLeafletLibrary: function() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            if (typeof window !== 'undefined' && window.L) {
                window.L = window.L;
                this.bindMapEvents();
            }
        };
        document.head.appendChild(script);
    },

    // Bind events to map elements
    bindMapEvents: function() {
        // Initialize any map containers when DOM is ready
        this.initializeMaps();

        // Bind click events to map trigger buttons
        document.addEventListener('click', function(e) {
            const mapButton = e.target.closest('[data-map-toggle]');
            if (mapButton) {
                const containerId = mapButton.getAttribute('data-map-toggle');
                if (containerId) {
                    P4C.Maps.createMap(containerId);
                }
            }
        });
    },

    // Initialize existing map containers
    initializeMaps: function() {
        const mapContainers = document.querySelectorAll('.property-map, [id*="map"], #property-map');

        mapContainers.forEach(container => {
            if (!container.hasAttribute('data-map-initialized')) {
                this.createMap(container.id || 'property-map');
            }
        });
    },

    // Create an interactive map
    createMap: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !window.L) return;

        // Skip if already initialized
        if (container.hasAttribute('data-map-initialized')) return;

        try {
            // Create map instance
            const map = window.L.map(containerId, {
                center: [30.2672, -97.7431], // Austin, TX
                zoom: 10,
                zoomControl: false, // Will add in custom position
                attributionControl: false
            });

            // Add OpenFreeMap tiles
            window.L.tileLayer('https://tiles.openfreemap.org/tiles/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a> contributors'
            }).addTo(map);

            // Add controls
            window.L.control.zoom({ position: 'topright' }).addTo(map);
            window.L.control.attribution({ position: 'bottomright' }).addTo(map);

            // Store map reference
            this.mapInstance = map;

            // Mark as initialized
            container.setAttribute('data-map-initialized', 'true');

            // Add sample property markers
            this.addPropertyMarkers();

            console.log(`✅ Map created in container: ${containerId}`);

        } catch (error) {
            console.error('Failed to create map:', error);
            container.innerHTML = `
                <div class="flex items-center justify-center h-full text-slate-500">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                            </svg>
                        </div>
                        <p class="text-sm">Interactive map loading...</p>
                    </div>
                </div>
            `;
        }
    },

    // Add sample property markers
    addPropertyMarkers: function() {
        if (!this.mapInstance || !window.L) return;

        // Clear existing markers
        this.clearMarkers();

        // Sample property data
        const properties = [
            {
                id: 'downtown-renovation',
                title: 'Downtown Austin Renovation',
                location: [30.2672, -97.7431], // Austin center
                type: 'apartment',
                status: 'active',
                section8: true,
                price: '$1200/month'
            },
            {
                id: 'south-congress-lofts',
                title: 'South Congress Lofts',
                location: [30.2450, -97.7578], // South Congress
                type: 'loft',
                status: 'completed',
                section8: false,
                price: '$1800/month'
            },
            {
                id: 'riverside-gardens',
                title: 'Riverside Gardens',
                location: [30.2520, -97.6210], // Near lake
                type: 'garden',
                status: 'planning',
                section8: true,
                price: '$950/month'
            }
        ];

        // Create markers
        properties.forEach(property => {
            const marker = this.createPropertyMarker(property);
            marker.addTo(this.mapInstance);
            this.markers.push(marker);
        });

        // Fit bounds if we have markers
        if (this.markers.length > 0) {
            const group = new window.L.featureGroup(this.markers);
            this.mapInstance.fitBounds(group.getBounds(), {
                padding: [20, 20],
                maxZoom: 15
            });
        }
    },

    // Create a property marker
    createPropertyMarker: function(property) {
        // Create custom marker icon
        const markerIcon = window.L.divIcon({
            className: 'custom-property-marker',
            html: `
                <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${this.getStatusColor(property.status)}">
                    ${property.section8 ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white"></div>' : ''}
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        // Create marker
        const marker = window.L.marker(property.location, { icon: markerIcon });

        // Add popup
        marker.bindPopup(`
            <div class="p-3 max-w-xs">
                <h3 class="font-bold text-gray-800 text-sm mb-1">${property.title}</h3>
                <p class="text-xs text-gray-600 mb-2">${property.price}</p>
                <div class="flex items-center gap-2 mb-2">
                    <span class="inline-block w-2 h-2 rounded-full ${this.getStatusColor(property.status)}"></span>
                    <span class="text-xs capitalize text-gray-600">${property.status}</span>
                    ${property.section8 ? '<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">Section 8</span>' : ''}
                </div>
                <button class="text-xs text-blue-600 hover:text-blue-800 font-medium">View Details →</button>
            </div>
        `, {
            offset: window.L.point(0, -12),
            closeButton: false
        });

        return marker;
    },

    // Get color based on project status
    getStatusColor: function(status) {
        const colors = {
            completed: 'bg-green-500', // Green for completed
            active: 'bg-blue-500',    // Blue for active
            planning: 'bg-yellow-500', // Yellow for planning
            cancelled: 'bg-gray-500'   // Gray for cancelled
        };
        return colors[status] || colors.planning;
    },

    // Clear all markers
    clearMarkers: function() {
        this.markers.forEach(marker => {
            if (this.mapInstance) {
                this.mapInstance.removeLayer(marker);
            }
        });
        this.markers = [];
    },

    // Center map on coordinates
    centerOn: function(latlng, zoom = 14) {
        if (this.mapInstance && window.L) {
            this.mapInstance.flyTo(latlng, zoom);
        }
    },

    // Add a single marker
    addMarker: function(latlng, options = {}) {
        if (!this.mapInstance || !window.L) return null;

        const marker = window.L.marker(latlng, options).addTo(this.mapInstance);
        this.markers.push(marker);
        return marker;
    },

    // Destroy map
    destroy: function() {
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
            this.clearMarkers();
        }
    }
};
