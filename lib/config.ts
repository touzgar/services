/**
 * Business Configuration File
 * 
 * Update this file to customize your business information across the site
 * All values are used in the landing page and contact sections
 */

export const businessConfig = {
  // Company Information
  company: {
    name: "AM Clean Services",
    tagline: "Professional Cleaning Solutions",
    description: "Professional cleaning service company dedicated to providing exceptional cleaning solutions for residential and commercial properties in Tunisia.",
  },

  // Location Details
  location: {
    address: "Cité El Khadhra, Tunisia",
    coordinates: {
      lat: 36.8,
      lng: 10.1963,
    },
  },

  // Contact Information
  contact: {
    phone: "+216 50 770 176",
    phoneRaw: "50770176", // For WhatsApp
    email: "amcleanservices06@gmail.com",
    whatsappMessage: "Hello AM Clean Services,",
  },

  // Social Media Links
  social: {
    instagram: {
      name: "@amclean.services",
      url: "https://instagram.com/amclean.services",
    },
    facebook: {
      name: "AM Clean Services",
      url: "https://www.facebook.com/profile.php?id=61555985104044",
    },
    whatsapp: {
      name: "+216 50 770 176",
      url: "https://wa.me/50770176",
    },
  },

  // Services Offered
  services: [
    {
      title: "Residential Cleaning",
      icon: "🏠",
      description: "Deep cleaning for homes, apartments, and residential spaces",
    },
    {
      title: "Commercial Cleaning",
      icon: "🏢",
      description: "Professional cleaning for offices, shops, and commercial facilities",
    },
    {
      title: "Specialized Services",
      icon: "✨",
      description: "Carpet cleaning, window cleaning, and detailed maintenance",
    },
  ],

  // Features/Values
  features: [
    {
      title: "Professional Team",
      description: "Trained and experienced cleaning specialists",
    },
    {
      title: "Eco-Friendly",
      description: "Safe, sustainable cleaning solutions",
    },
    {
      title: "Guaranteed Results",
      description: "100% satisfaction guarantee on all services",
    },
  ],

  // Website Metadata
  website: {
    title: "AM Clean Services - Professional Cleaning Solutions",
    description: "Professional cleaning services in Cité El Khadhra, Tunisia. Expert cleaning solutions for your home and business.",
    url: "https://amclean.com", // Update when deployed
    keywords: ["cleaning", "professional", "Tunisia", "residential", "commercial"],
  },

  // Colors (Tailwind classes used in the site)
  theme: {
    primary: "blue-600",
    primaryHover: "blue-700",
    secondary: "gray-600",
    background: "white",
    darkBackground: "gray-900",
  },

  // Operating Hours (optional - add to page if needed)
  hours: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  },

  // Admin Credentials (change these after first login!)
  admin: {
    defaultEmail: "admin@amclean.com",
    defaultPassword: "SecurePassword123!", // ⚠️ CHANGE THIS!
  },
};

/**
 * Helper function to get social media embed
 */
export function getSocialMediaLink(platform: "instagram" | "facebook" | "whatsapp") {
  return businessConfig.social[platform].url;
}

/**
 * Helper function to format phone number
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{2})(\d{2})(\d{3})(\d{3})/, "+$1 $2 $3 $4");
}

/**
 * Helper function to get WhatsApp share URL
 */
export function getWhatsAppUrl(message?: string): string {
  const baseUrl = "https://wa.me/" + businessConfig.contact.phoneRaw;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}
