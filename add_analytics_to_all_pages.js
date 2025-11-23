#!/usr/bin/env node
/**
 * Batch Analytics Implementation for All P4C Pages
 * Adds GA4, Facebook Pixel, and Mailchimp to all P4C HTML files
 */

const fs = require('fs');
const path = require('path');

// Analytics configuration - REPLACE THESE WITH YOUR ACTUAL IDs
const ANALYTICS_CONFIG = {
  GA4_MEASUREMENT_ID: 'GA_MEASUREMENT_ID', // Replace with actual Google Analytics 4 ID
  FB_PIXEL_ID: 'FACEBOOK_PIXEL_ID',       // Replace with actual Facebook Pixel ID
  MAILCHIMP_API_KEY: 'MAILCHIMP_API_KEY', // Replace with actual Mailchimp API Key
  MAILCHIMP_ENDPOINT: 'MAILCHIMP_ENDPOINT' // Replace with actual Mailchimp endpoint
};

// Universal GA4 and Facebook Pixel script for all P4C pages
const ANALYTICS_HEAD_SCRIPT = `
<!-- Google Analytics GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}');

// P4C Custom Events
function trackP4CEvent(action, category, label, value) {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
}

// Lead Tracking Events
function trackLeadSubmission(formType, propertyInterest) {
  gtag('event', 'lead_submitted', {
    event_category: 'forms',
    form_type: formType,
    property_interest: propertyInterest
  });
}

function trackTourRequest(propertyId) {
  gtag('event', 'tour_requested', {
    event_category: 'conversion',
    property_id: propertyId
  });
}

function trackVeteranSelection() {
  gtag('event', 'veteran_preference', {
    event_category: 'user_type'
  });
}

// Section 8 Calculator Usage
function trackSection8Usage() {
  gtag('event', 'section8_calculator', {
    event_category: 'engagement'
  });
}
</script>

<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${ANALYTICS_CONFIG.FB_PIXEL_ID}');
fbq('track', 'PageView');
</script>
`;

// Mailchimp integration footer script
const MAILCHIMP_FOOTER_SCRIPT = `
<!-- Mailchimp Integration -->
<script>
async function subscribeToMailchimp(email, formData = {}) {
  try {
    const response = await fetch('${ANALYTICS_CONFIG.MAILCHIMP_ENDPOINT}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${ANALYTICS_CONFIG.MAILCHIMP_API_KEY}'
      },
      body: JSON.stringify({
        email: email,
        status: 'subscribed',
        merge_fields: formData
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Mailchimp error:', error);
    return false;
  }
}

// Enhanced Form Handler
function submitPropertyInquiry(formData) {
  // Track in GA4
  trackLeadSubmission(formData.formType || 'property_inquiry', formData.propertyInterest);

  // Submit to Mailchimp if email provided
  if (formData.email && formData.subscribeToNewsletter) {
    subscribeToMailchimp(formData.email, {
      FNAME: formData.firstName,
      LNAME: formData.lastName,
      PHONE: formData.phone,
      INTEREST: formData.propertyInterest,
      VET: formData.isVeteran ? 'Yes' : 'No'
    });
  }

  // Track veteran selection
  if (formData.isVeteran) {
    trackVeteranSelection();
  }
}

// Form Enhancement Function
function enhanceP4CForms() {
  const forms = document.querySelectorAll('[id*="inquiry"], [id*="contact"], [id*="form"]');

  forms.forEach(form => {
    if (form.hasAttribute('data-analytics-enhanced')) return; // Already enhanced

    form.addEventListener('submit', function(e) {
      const formData = new FormData(form);

      const inquiryData = {
        firstName: formData.get('firstName') || formData.get('name')?.split(' ')[0],
        lastName: formData.get('lastName') || formData.get('name')?.split(' ').slice(1).join(' '),
        email: formData.get('email'),
        phone: formData.get('phone') || formData.get('tel'),
        householdSize: formData.get('householdSize') || formData.get('household-size'),
        moveTimeline: formData.get('moveTimeline') || formData.get('timeline'),
        propertyInterest: formData.get('propertyInterest') || document.title,
        isVeteran: ['on', 'true', 'yes'].includes((formData.get('isVeteran') || formData.get('veteran'))?.toLowerCase()),
        subscribeToNewsletter: ['on', 'true', 'yes'].includes((formData.get('newsletter') || formData.get('subscribe'))?.toLowerCase()),
        formType: 'contact_form',
        propertyId: form.id || 'general_inquiry'
      };

      submitPropertyInquiry(inquiryData);
    });

    form.setAttribute('data-analytics-enhanced', 'true');
  });
}

// Initialize Analytics When Page Loads
document.addEventListener('DOMContentLoaded', function() {
  // Add page context to GA4
  gtag('event', 'page_loaded', {
    page_url: window.location.href,
    page_title: document.title
  });

  // Enhance all P4C forms with analytics
  enhanceP4CForms();

  // Track Section 8 calculator usage if present
  const calculatorButtons = document.querySelectorAll('[id*="calculator"], [id*="section8"]');
  calculatorButtons.forEach(button => {
    button.addEventListener('click', () => trackSection8Usage());
  });

  console.log('P4C Analytics: All systems operational');
});
</script>
<!-- End Mailchimp Integration -->
`;

// List of P4C files that need analytics added
const P4C_FILES = [
  'index.html',
  'projects.html',
  'projects/tyler-ranch-home.html',
  'projects/longview-victorian.html',
  'projects/jefferson-riverfront.html',
  'resources.html',
  'insights.html',
  'about.html',
  'contact.html'
];

console.log('🚀 P4C Analytics Implementation Starting...\n');
console.log('📊 Configuration:');
console.log(`   GA4 ID: ${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}`);
console.log(`   Facebook Pixel ID: ${ANALYTICS_CONFIG.FB_PIXEL_ID}`);
console.log('\n📁 Files to update:');
P4C_FILES.forEach(file => console.log(`   • ${file}`));

// Process each file
P4C_FILES.forEach(filename => {
  const filePath = path.join(__dirname, filename);

  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip if analytics already added (check for GA4 script)
    if (content.includes(`gtag('config', '${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}')`)) {
      console.log(`⚠️  ${filename} - Already has analytics (skipping)`);
      return;
    }

    // Find the head section and add analytics after meta tags
    const headInsertPoint = content.indexOf('</head>');
    if (headInsertPoint === -1) {
      console.log(`❌ ${filename} - No </head> tag found, skipping`);
      return;
    }

    // Look for a good insertion point after the CSS link
    const cssLinkPattern = /<link.*rel="stylesheet".*href=".*static-enhanced\.css".*>/;
    const cssMatch = content.match(cssLinkPattern);
    let insertPoint = headInsertPoint;

    if (cssMatch) {
      insertPoint = cssMatch.index + cssMatch[0].length;
      console.log(`   → Inserting after CSS link in ${filename}`);
    } else {
      console.log(`   → Inserting before </head> in ${filename}`);
    }

    // Add analytics scripts
    const updatedContent = content.slice(0, insertPoint) + ANALYTICS_HEAD_SCRIPT + content.slice(insertPoint);

    // Add Mailchimp script before closing body tag (for all pages except index which already has it)
    const bodyClosePoint = updatedContent.lastIndexOf('</body>');
    if (bodyClosePoint === -1) {
      console.log(`❌ ${filename} - No </body> tag found`);
      return;
    }

    const finalContent = updatedContent.slice(0, bodyClosePoint) + MAILCHIMP_FOOTER_SCRIPT + updatedContent.slice(bodyClosePoint);

    // Write back to file
    fs.writeFileSync(filePath, finalContent, 'utf8');

    console.log(`✅ ${filename} - Analytics added successfully`);

  } catch (error) {
    console.log(`❌ ${filename} - Error processing file: ${error.message}`);
  }
});

console.log('\n🎉 P4C Analytics Implementation Complete!');
console.log('\n📝 Next Steps:');
console.log('1. Replace GA_MEASUREMENT_ID, FACEBOOK_PIXEL_ID, and MAILCHIMP credentials');
console.log('2. Commit and push changes to trigger deployment');
console.log('3. Verify analytics data in Google Analytics and Facebook Business Manager');

module.exports = { ANALYTICS_CONFIG, ANALYTICS_HEAD_SCRIPT, MAILCHIMP_FOOTER_SCRIPT };
