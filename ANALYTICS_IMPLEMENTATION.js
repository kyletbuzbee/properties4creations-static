/**
 * P4C Universal Analytics Implementation
 * Adds GA4, Facebook Pixel, and Mailchimp integration to all P4C pages
 */

// Universal GA4 and Analytics Setup
const P4C_ANALYTICS_CONFIG = {
  GA4_MEASUREMENT_ID: 'GA_MEASUREMENT_ID', // Replace with actual GA4 ID
  FB_PIXEL_ID: 'FACEBOOK_PIXEL_ID',        // Replace with actual Facebook Pixel ID
  MAILCHIMP_API_ENDPOINT: 'MAILCHIMP_ENDPOINT' // Replace with actual Mailchimp endpoint
};

// Add this script to all P4C HTML pages in the <head> section
const ANALYTICS_HEAD_SCRIPT = `
<!-- Google Analytics GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${P4C_ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${P4C_ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}');

// Custom P4C Events
function trackP4CEvent(action, category, label, value) {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
}

// Custom P4C Conversion Events
function trackLeadSubmission(formType, propertyInterest) {
  gtag('event', 'lead_submitted', {
    event_category: 'forms',
    form_type: formType,
    property_interest: propertyInterest
  });
}

function trackTourRequest(propertyId, propertyAddress) {
  gtag('event', 'tour_requested', {
    event_category: 'conversion',
    property_id: propertyId,
    property_address: propertyAddress
  });
}

function trackVeteranSelection() {
  gtag('event', 'veteran_preference', {
    event_category: 'user_type',
    user_type: 'veteran'
  });
}

function trackSection8Usage(calculatorType) {
  gtag('event', 'section8_calculator', {
    event_category: 'resource_usage',
    calculator_type: calculatorType
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
fbq('init', '${P4C_ANALYTICS_CONFIG.FB_PIXEL_ID}');
fbq('track', 'PageView');

// Custom P4C Facebook Events
function trackFacebookLeadSubmission(leadData) {
  fbq('track', 'Lead', {
    content_name: 'Property Inquiry',
    content_category: 'Housing Lead',
    value: 0,
    currency: 'USD',
    ...leadData
  });
}

function trackFacebookPropertyView(propertyId, value) {
  fbq('track', 'ViewContent', {
    content_type: 'property',
    content_ids: [propertyId],
    value: value,
    currency: 'USD'
  });
}
</script>
`;

// Mailchimp integration function
const MAILCHIMP_INTEGRATION = `
// Mailchimp Integration
async function subscribeToMailchimp(email, formData = {}) {
  try {
    const mailchimpData = {
      email: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: formData.firstName || '',
        LNAME: formData.lastName || '',
        PHONE: formData.phone || '',
        INTEREST: formData.propertyInterest || '',
        VET: formData.isVeteran ? 'Yes' : 'No'
      }
    };

    const response = await fetch('${P4C_ANALYTICS_CONFIG.MAILCHIMP_API_ENDPOINT}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_MAILCHIMP_API_KEY'
      },
      body: JSON.stringify(mailchimpData)
    });

    if (response.ok) {
      gtag('event', 'mailchimp_subscribe_success', {
        event_category: 'email_marketing'
      });
      return true;
    } else {
      gtag('event', 'mailchimp_subscribe_failed', {
        event_category: 'email_marketing',
        error_code: response.status
      });
      return false;
    }
  } catch (error) {
    gtag('event', 'mailchimp_subscribe_error', {
      event_category: 'email_marketing',
      error_message: error.message
    });
    return false;
  }
}

// Enhanced form submission with all analytics
function submitPropertyInquiry(formData) {
  // Track in GA4
  trackLeadSubmission(formData.formType || 'property_inquiry', formData.propertyInterest);

  // Track in Facebook
  trackFacebookLeadSubmission({
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    city: formData.city
  });

  // Submit to Mailchimp if email provided
  if (formData.email && formData.subscribeToNewsletter) {
    subscribeToMailchimp(formData.email, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      propertyInterest: formData.propertyInterest,
      isVeteran: formData.isVeteran
    });
  }

  // Check for veteran selection
  if (formData.isVeteran) {
    trackVeteranSelection();
  }
}

// Form enhancement function - applies to all P4C property inquiry forms
function enhanceP4CForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', function(e) {
    const formData = new FormData(form);

    const inquiryData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      householdSize: formData.get('householdSize'),
      moveTimeline: formData.get('moveTimeline'),
      propertyInterest: formData.get('propertyInterest'),
      isVeteran: formData.get('isVeteran') === 'on',
      subscribeToNewsletter: formData.get('newsletter') === 'on',
      formType: 'property_inquiry'
    };

    submitPropertyInquiry(inquiryData);

    // Show success message (don't prevent default form submission)
    alert('Thank you! Your inquiry has been submitted. We\\'ll contact you within 24 hours.');
  });
}

// Initialize P4C Analytics on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add page context for GA4
  gtag('event', 'page_context', {
    page_url: window.location.href,
    page_title: document.title,
    user_agent: navigator.userAgent
  });

  // Initialize form enhancements
  enhanceP4CForm('property-inquiry');
});`;

console.log('P4C Analytics Implementation ready for deployment');
console.log('GA4 Measurement ID:', P4C_ANALYTICS_CONFIG.GA4_MEASUREMENT_ID);
