# P4C Unified Design Integration Guide

## Overview
This guide explains how to integrate the unified header, footer, and enhanced styles across all P4C HTML pages for seamless consistency with the web folder design.

## Files Created

### 1. **header-template.html**
- Sticky header with scroll effects
- Unified 5-item navigation: Home, Our Work, Insights, For Veterans, About Us
- Mobile responsive with hamburger menu
- Search button (⌘K keyboard shortcut support)
- Portal button linking to portal modal
- "Get Fair Offer" CTA button with gradient

### 2. **footer-template.html**
- 5-column layout on large screens
- Brand column (2 cols) with logo, description, contact info
- Services, Company, and Resources columns
- Dynamic copyright year
- Accessibility settings widget
- "Made with ❤️ for veterans" tagline
- Legal links row with icons

### 3. **static-header.js**
- Mobile menu toggle functionality
- ⌘K / Ctrl+K keyboard shortcut for search
- Active navigation item highlighting
- Portal modal integration hooks
- Search modal integration hooks

### 4. **static-enhanced.css**
- 8 animation types: fadeInUp, fadeInLeft, fadeInRight, scaleIn, slideInUp, float, pulseSoft, shimmer
- Glassmorphism effects (.glass, .glass-dark)
- Hover effects: .hover-lift, .hover-scale, .hover-glow
- Card styles with shadow effects
- Button styles (.btn-primary, .btn-secondary)
- Gradient backgrounds
- Accessibility classes for high contrast and reduced motion
- xs breakpoint utilities (475px)
- Stagger animation support

## Integration Steps

### Step 1: Update Head Section
In each P4C HTML file, replace the current `<style>` and script sections with:

```html
<head>
    <!-- ... existing meta tags ... -->
    
    <!-- Fonts and Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            navy: '#1e293b',
                            beige: '#ffffff',
                            sage: '#059669',
                            tan: '#475569',
                            red: '#dc2626',
                            olive: '#4d7c0f',
                            sand: '#f8fafc'
                        }
                    },
                    fontFamily: {
                        heading: ['Merriweather', 'serif'],
                        body: ['Inter', 'sans-serif']
                    }
                }
            }
        }
    </script>

    <!-- Enhanced Global Styles -->
    <link rel="stylesheet" href="static-enhanced.css">
</head>
```

### Step 2: Replace Header
Replace the entire `<header>` section with contents of `header-template.html`:

```html
<!-- Copy the complete header from header-template.html here -->
```

### Step 3: Update Body Content
Keep your existing page content (hero sections, cards, etc.) between the header and footer.

**Important**: Update class names on your content sections:
- Add `max-w-7xl mx-auto px-4` to container sections
- Use `py-16` and `md:py-20` for consistent section spacing
- Apply animation classes: `animate-fade-in-up`, `animate-scale-in`, etc.
- Use grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4`

### Step 4: Replace Footer
Replace the entire `<footer>` section with contents of `footer-template.html`:

```html
<!-- Copy the complete footer from footer-template.html here -->
```

### Step 5: Add Scripts
At the end of `<body>`, add:

```html
    <!-- Header Navigation Handler -->
    <script src="static-header.js"></script>
    
    <!-- Existing P4C scripts -->
    <script src="static-modals.js"></script>
    <script src="static-search.js"></script>
    <script src="static-navigation.js"></script>
    <script src="static-forms.js"></script>
</body>
```

## Navigation Structure (5 Items - Unified)

All pages should use consistent navigation:

| Position | Label | Link |
|----------|-------|------|
| 1 | Home | index.html |
| 2 | Our Work | projects.html |
| 3 | Insights | insights.html |
| 4 | For Veterans | resources.html |
| 5 | About Us | about.html |

**Additional Actions**:
- Search (⌘K shortcut, integrated via static-header.js)
- Portals (modal-based selection)
- Get Fair Offer (CTA button)

## Pages to Update (Priority Order)

1. **index.html** - Home page
2. **projects.html** - Our Work listing
3. **about.html** - About Us page
4. **resources.html** - For Veterans resources
5. **insights.html** - Insights/blog
6. **contact.html** - Contact page

## Responsive Grid Standardization

### Current P4C Layouts:
- Projects grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Should become: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

### Implementation:
```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <!-- cards here -->
</div>
```

### Spacing Pattern:
```html
<section class="py-16 md:py-20">
    <div class="max-w-7xl mx-auto px-4">
        <!-- content -->
    </div>
</section>
```

## Animation Usage

### Basic Animations:
```html
<!-- Fade in up (default for hero text) -->
<h1 class="animate-fade-in-up">Heading</h1>

<!-- Slide up (for larger sections) -->
<div class="animate-slide-in-up">Content</div>

<!-- Scale in (for cards) -->
<div class="card animate-scale-in">Card Content</div>

<!-- Float (for icons/highlights) -->
<img class="animate-float" src="icon.png">

<!-- Pulse soft (for CTAs) -->
<button class="animate-pulse-soft">Action</button>
```

### Stagger Effect (for lists):
```html
<div class="space-y-4">
    <div class="animate-fade-in-up stagger-item">Item 1</div>
    <div class="animate-fade-in-up stagger-item">Item 2</div>
    <div class="animate-fade-in-up stagger-item">Item 3</div>
</div>
```

## Glassmorphism Effects

For modal overlays and glass-style containers:

```html
<!-- Glass effect (light background) -->
<div class="glass p-6 rounded-lg">
    Light glass effect
</div>

<!-- Dark glass effect -->
<div class="glass-dark p-6 rounded-lg text-white">
    Dark glass effect
</div>
```

## Hover Effects

```html
<!-- Lift on hover with shadow -->
<div class="card hover-lift">Content</div>

<!-- Scale on hover -->
<button class="hover-scale">Click Me</button>

<!-- Glow effect -->
<div class="hover-glow">Glowing Box</div>
```

## Accessibility Features

### Text Size Control
Implemented in footer accessibility widget. Adjusts root font size:
- Normal: 16px
- Large: 18px
- Extra Large: 20px

### High Contrast Mode
```html
<!-- Automatically applied when "High Contrast" selected in widget -->
<!-- Text becomes black, backgrounds white, links blue -->
```

### Reduced Motion
```html
<!-- Automatically applied when "Reduced Motion" selected -->
<!-- All animations reduced to 0.01ms duration -->
```

## Color Scheme (Unified)

```css
--corporate-navy: #1e293b        /* Primary - Navy Blue */
--corporate-emerald: #059669     /* Accent - Sage Green */
--corporate-red: #dc2626         /* CTA - Red */
--corporate-tan: #475569         /* Secondary - Slate */
--corporate-olive: #4d7c0f       /* Accent - Olive */
--corporate-white: #ffffff       /* Background */
```

## Mobile Responsive Breakpoints

| Breakpoint | Name | Width |
|-----------|------|-------|
| xs | Extra Small | 475px (custom) |
| sm | Small | 640px |
| md | Medium | 768px |
| lg | Large | 1024px |
| xl | Extra Large | 1280px |
| 2xl | 2X Large | 1536px |

## Testing Checklist

- [ ] Header sticky and smooth scroll effects
- [ ] Mobile menu toggle works on lg: breakpoint (1024px)
- [ ] ⌘K / Ctrl+K opens search on all pages
- [ ] Portal button opens modal correctly
- [ ] Footer copyright year updates dynamically
- [ ] Accessibility widget opens/closes properly
- [ ] All 8 animations display smoothly
- [ ] Grid layouts responsive at all breakpoints
- [ ] Glassmorphism effects visible on modals
- [ ] Hover effects smooth on buttons/cards
- [ ] High contrast mode toggles properly
- [ ] Reduced motion respected in accessibility settings

## Validation

After integration, verify:

1. **Visual Consistency**: P4C pages look identical to web versions
2. **Navigation Flow**: Users can navigate all pages seamlessly
3. **Animation Smoothness**: No janky transitions or timing issues
4. **Responsive Design**: Layout adapts correctly at xs/sm/md/lg/xl breakpoints
5. **Accessibility**: Settings widget works, keyboard shortcuts function
6. **Performance**: No console errors, animations don't cause jank

## Support

For issues with integration:
- Check that all 4 new files are in P4C directory
- Verify script load order: header.js → existing P4C scripts
- Ensure Tailwind CDN is loaded before custom styles
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)

## Next Steps

1. Integrate templates into all 6 P4C pages
2. Update grid layouts to 1→2→3→4 column progression
3. Apply animation classes to sections
4. Test responsive design at all breakpoints
5. Verify keyboard shortcuts and modals
6. Deploy and verify live
