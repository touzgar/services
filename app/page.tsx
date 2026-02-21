"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/useLanguage";
import { getTranslation, type Language, type TranslationKey } from "@/lib/translations";

interface Media {
  id: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  isBeforeAfter?: boolean;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  createdAt: string;
}

interface About {
  id: string;
  aboutText: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
}

interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export default function Home() {
  const { isLoggedIn, isLoading, logout } = useAuth();
  const { language } = useLanguage();
  const t = (key: TranslationKey) => getTranslation(language, key);
  const [media, setMedia] = useState<Media[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [galleryFilter, setGalleryFilter] = useState<"all" | "image" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    fetchMedia();
    fetchAbout();
    fetchHero();
    fetchServices();

    // Listen for hero section updates from admin panel
    const handleHeroUpdate = () => {
      fetchHero();
    };

    window.addEventListener('heroSectionUpdated', handleHeroUpdate);

    return () => {
      window.removeEventListener('heroSectionUpdated', handleHeroUpdate);
    };
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/media?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMedia(Array.isArray(data) ? data : []);
      } else {
        setMedia([]);
      }
    } catch (error) {
      setMedia([]);
    }
  };

  const fetchAbout = async () => {
    try {
      const response = await fetch("/api/about");
      if (response.ok) {
        const data = await response.json();
        setAbout(data);
      }
    } catch (error) {
      // ignore silently
    }
  };

  const fetchHero = async () => {
    try {
      // Add cache busting to force fresh data
      const response = await fetch(`/api/hero?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setHero(data);
      }
    } catch (error) {
      // ignore silently
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      // ignore silently
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setFormStatus("Please fill in all fields");
      return;
    }

    const phoneNumber = about?.phone?.replace(/\D/g, "") || "50770176"; // Tunisia number from database
    const message = encodeURIComponent(
      `Hello AM Clean Services,\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");

    setFormData({ name: "", email: "", phone: "", message: "" });
    setFormStatus("Redirecting to WhatsApp...");
    setTimeout(() => setFormStatus(""), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Media Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 transition-all duration-300" onClick={() => setSelectedMedia(null)}>
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] border border-slate-700/50 max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition hover:scale-110 backdrop-blur-sm"
            >
              ✕
            </button>

            {/* Media Container */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-96">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-t border-slate-600">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedMedia.title}</h2>
              <p className="text-gray-300 mb-4">{selectedMedia.description || "No description"}</p>
              <p className="text-sm text-gray-400">
                {new Date(selectedMedia.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
            AM Clean
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
            <a href="#services" className="text-gray-700 hover:text-cyan-600 transition font-medium text-sm lg:text-base">
              {t("services")}
            </a>
            <a href="#about" className="text-gray-700 hover:text-cyan-600 transition font-medium text-sm lg:text-base">
              {t("about")}
            </a>
            <a href="#projects" className="text-gray-700 hover:text-cyan-600 transition font-medium text-sm lg:text-base">
              {t("projects")}
            </a>
            <a href="#contact" className="text-gray-700 hover:text-cyan-600 transition font-medium text-sm lg:text-base">
              {t("contact")}
            </a>

            {/* Dynamic Auth Buttons */}
            {!isLoading && (
              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/admin"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition font-semibold"
                    >
                      👨‍💼 Admin
                    </Link>
                    <button
                      onClick={logout}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition font-semibold"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition font-semibold"
                  >
                    🔐 Login
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 animate-slideDown">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              <a
                href="#services"
                className="block text-gray-700 hover:text-cyan-600 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("services")}
              </a>
              <a
                href="#about"
                className="block text-gray-700 hover:text-cyan-600 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("about")}
              </a>
              <a
                href="#projects"
                className="block text-gray-700 hover:text-cyan-600 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("projects")}
              </a>
              <a
                href="#contact"
                className="block text-gray-700 hover:text-cyan-600 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("contact")}
              </a>

              {/* Mobile Auth Buttons */}
              {!isLoading && (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/admin"
                        className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition font-semibold text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        👨‍💼 Admin
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full hover:shadow-lg transition font-semibold"
                      >
                        🚪 Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition font-semibold text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔐 Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Innovative Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Dynamic Background Image if available - No dark overlays so the text on the image is perfectly legible! */}
        {hero?.imageUrl ? (
          <div className="w-full relative min-h-[40vh]">
            <img
              src={hero.imageUrl}
              alt="Hero Banner"
              className="w-full h-auto max-h-[85vh] object-cover object-top sm:object-center shadow-2xl"
            />
          </div>
        ) : (
          <div className="w-full h-[60vh] bg-slate-900 flex flex-col items-center justify-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen animate-blob"></div>
              <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>
            <p className="text-gray-400 text-xl font-bold z-10">Welcome to AM Clean</p>
          </div>
        )}

        {/* Call to Action Buttons */}
        <div className={`relative z-20 w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 flex justify-center ${hero?.imageUrl ? 'mt-[-20px] sm:mt-[-40px]' : ''}`}>
          <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-slate-700/50 shadow-2xl">

            {/* Innovative CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slideUp" style={{ animationDelay: '200ms' }}>

              {/* Primary Button - Glow Effect */}
              <a
                href={hero?.ctaLink || "#contact"}
                className="relative inline-flex group items-center justify-center w-full sm:w-auto"
              >
                <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-full blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                <span className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-slate-900 border border-slate-700 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                  {hero?.ctaText || t("getFreeQuote")}
                  <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>

              {/* Secondary Button - Glass effect */}
              <a
                href="#projects"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-slate-300 border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white backdrop-blur-md transition-all duration-300 relative overflow-hidden group text-center"
              >
                <span className="relative z-10">{t("viewProjects")}</span>
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-slideDown">
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {t("ourServices")}
            </h2>
            <p className="text-gray-400 text-lg">{t("servicesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.length > 0 ? (
              services.sort((a, b) => a.order - b.order).map((service) => (
                <div
                  key={service.id}
                  className="service-card group relative bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl border border-slate-600 hover:border-cyan-500 transition duration-300 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/20 animate-slideUp"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 transition duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition duration-300">{service.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition">{service.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                {[
                  {
                    title: t("residentialCleaning"),
                    icon: "🏠",
                    description: t("residentialDesc"),
                    color: "from-cyan-500 to-blue-500",
                  },
                  {
                    title: t("commercialCleaning"),
                    icon: "🏢",
                    description: t("commercialDesc"),
                    color: "from-blue-500 to-purple-500",
                  },
                  {
                    title: t("specializedServices"),
                    icon: "✨",
                    description: t("specializedDesc"),
                    color: "from-purple-500 to-pink-500",
                  },
                ].map((service, idx) => (
                  <div
                    key={idx}
                    className="service-card group relative bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl border border-slate-600 hover:border-cyan-500 transition duration-300 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/20 animate-slideUp"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition duration-300`}></div>
                    <div className="relative z-10">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition duration-300">{service.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition">
                        {service.title}
                      </h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition">{service.description}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section >

      {/* About Section */}
      < section id="about" className="py-24 bg-slate-900 relative" >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="animate-slideDown">
              <h2 className="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t("aboutTitle")}
              </h2>
              {about?.aboutText ? (
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {about.aboutText}
                </p>
              ) : (
                <>
                  <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                    {t("aboutDesc1")}
                  </p>
                  <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                    {t("aboutDesc2")}
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {t("aboutDesc3")}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-6">
              {services.length > 0 ? (
                services.slice(0, 3).sort((a, b) => a.order - b.order).map((service) => (
                  <div key={service.id} className="feature-box group bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition backdrop-blur-sm animate-slideUp">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl group-hover:scale-110 transition duration-300">{service.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">{service.title}</h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition">{service.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {[
                    { title: t("professionalTeam"), description: t("professionalTeamDesc"), icon: "👨‍💼" },
                    { title: t("ecoFriendly"), description: t("ecoFriendlyDesc"), icon: "🌿" },
                    { title: t("guaranteedResults"), description: t("guaranteedResultsDesc"), icon: "✅" },
                  ].map((feature, idx) => (
                    <div key={idx} className="feature-box group bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition backdrop-blur-sm animate-slideUp">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl group-hover:scale-110 transition duration-300">{feature.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">{feature.title}</h3>
                          <p className="text-gray-400 group-hover:text-gray-300 transition">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section >

      {/* Before & After Projects Section */}
      {
        media.filter(item => item.isBeforeAfter).length > 0 && (
          <section className="py-24 bg-gradient-to-b from-purple-900 to-slate-900 relative">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12 animate-slideDown">
                <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  ✨ {t("beforeAfter")}
                </h2>
                <p className="text-gray-300 text-lg">See the amazing transformations we've completed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {media.filter(item => item.isBeforeAfter).map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 border-2 border-purple-500/30 hover:border-purple-400 cursor-pointer bg-black"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <div className="relative h-96 flex gap-0">
                      {/* Before Image */}
                      {item.beforeImageUrl && (
                        <div className="flex-1 relative overflow-hidden group">
                          <img
                            src={item.beforeImageUrl}
                            alt="Before"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
                          <span className="absolute top-3 left-3 px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                            BEFORE
                          </span>
                        </div>
                      )}

                      {/* After Image */}
                      {item.afterImageUrl && (
                        <div className="flex-1 relative overflow-hidden group">
                          <img
                            src={item.afterImageUrl}
                            alt="After"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent"></div>
                          <span className="absolute top-3 right-3 px-3 py-1 bg-green-500/80 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                            AFTER
                          </span>
                        </div>
                      )}

                      {/* Dark Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                      {/* Click Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="text-6xl drop-shadow-xl">🔍</div>
                      </div>
                    </div>

                    {/* Content Area - Bottom */}
                    <div className="bg-gradient-to-t from-slate-900 to-slate-800 p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      }

      {/* Media Gallery Section */}
      <section id="projects" className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-slideDown">
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t("mediaGallery")}
            </h2>
            <p className="text-gray-400 text-lg mb-8">{t("gallerySubtitle")}</p>

            {/* Filter Buttons */}
            {media.length > 0 && (
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setGalleryFilter("all")}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${galleryFilter === "all"
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-slate-700 text-gray-300 hover:text-white hover:bg-slate-600"
                    }`}
                >
                  {t("all")}
                </button>
                <button
                  onClick={() => setGalleryFilter("image")}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${galleryFilter === "image"
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-slate-700 text-gray-300 hover:text-white hover:bg-slate-600"
                    }`}
                >
                  🖼️ {t("images")}
                </button>
                <button
                  onClick={() => setGalleryFilter("video")}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${galleryFilter === "video"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                    : "bg-slate-700 text-gray-300 hover:text-white hover:bg-slate-600"
                    }`}
                >
                  🎬 {t("videos")}
                </button>
              </div>
            )}
          </div>

          {media.length === 0 ? (
            <div className="text-center py-24 animate-fadeIn">
              <div className="inline-block">
                <div className="text-6xl mb-4 opacity-50">📸</div>
                <p className="text-gray-400 text-xl">
                  {t("noMediaFound")}
                </p>
              </div>
            </div>
          ) : media.filter(item => !item.isBeforeAfter && (galleryFilter === "all" || item.type === galleryFilter)).length === 0 ? (
            <div className="text-center py-24 animate-fadeIn">
              <div className="inline-block">
                <div className="text-6xl mb-4 opacity-50">{galleryFilter === "image" ? "🖼️" : "🎬"}</div>
                <p className="text-gray-400 text-xl">
                  {t("noFiltered")}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {media.filter(item => !item.isBeforeAfter && (galleryFilter === "all" || item.type === galleryFilter)).map((item) => (
                <div
                  key={item.id}
                  className="group relative h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 border-2 border-gray-200 hover:border-cyan-400 cursor-pointer bg-black"
                  onClick={() => setSelectedMedia(item)}
                  onMouseEnter={(e) => {
                    const video = e.currentTarget.querySelector('video') as HTMLVideoElement;
                    if (video) video.play();
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget.querySelector('video') as HTMLVideoElement;
                    if (video) {
                      video.pause();
                      video.currentTime = 0;
                    }
                  }}
                >
                  {/* Background - Shows for images */}
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
                  )}

                  {/* Video Element - Hidden by default, shows on hover */}
                  {item.type === "video" && (
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      muted
                      playsInline
                    />
                  )}

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300"></div>

                  {/* Play Icon - Only shows for videos on hover */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="text-7xl drop-shadow-xl animate-pulse">▶️</div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white backdrop-blur-xl border-2 transition-all duration-300 ${item.type === "image"
                      ? "bg-blue-500/60 border-blue-400 group-hover:bg-blue-600/70"
                      : "bg-purple-500/60 border-purple-400 group-hover:bg-purple-600/70"
                      }`}>
                      {item.type === "image" ? "📸 PHOTO" : "🎬 VIDEO"}
                    </span>
                  </div>

                  {/* Content Area - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5 lg:p-6 flex flex-col justify-end">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 mb-2 group-hover:text-gray-100 transition-colors">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 group-hover:text-cyan-300/70 transition-colors">
                      {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                        year: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-slideDown">
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {t("getInTouch")}
            </h2>
            <p className="text-gray-400 text-lg">{t("contactDescription")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 sm:p-8 rounded-2xl border border-slate-600 hover:border-cyan-500 transition backdrop-blur-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                {t("sendMessage")}
              </h3>
              {formStatus && (
                <div className="mb-4 p-3 sm:p-4 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-lg backdrop-blur-sm text-sm sm:text-base">
                  {formStatus}
                </div>
              )}
              <form onSubmit={handleWhatsApp} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                    {t("yourName")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition text-sm sm:text-base"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                    {t("yourEmail")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition text-sm sm:text-base"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                    {t("yourPhone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition text-sm sm:text-base"
                    placeholder="+216 50 123 456"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                    {t("yourMessage")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition resize-none text-sm sm:text-base"
                    placeholder={t("messageHint")}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition transform hover:scale-105 text-sm sm:text-base"
                >
                  💬 {t("sendViaWhatsApp")}
                </button>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 sm:p-8 rounded-2xl border border-slate-600 hover:border-cyan-500 transition">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("contactInfo")}
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-4 group cursor-pointer">
                    <div className="text-3xl group-hover:scale-110 transition duration-300">📍</div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-cyan-300 transition">{t("address")}</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition">{about?.address || "Loading..."}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group cursor-pointer">
                    <div className="text-3xl group-hover:scale-110 transition duration-300">📞</div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-cyan-300 transition">{t("phone")}</h4>
                      <a href={`tel:${about?.phone?.replace(/\s/g, "")}`} className="text-gray-400 hover:text-cyan-300 transition">
                        {about?.phone || "Loading..."}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group cursor-pointer">
                    <div className="text-3xl group-hover:scale-110 transition duration-300">📧</div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-cyan-300 transition">{t("email")}</h4>
                      <a href={`mailto:${about?.email}`} className="text-gray-400 hover:text-cyan-300 transition">
                        {about?.email || "Loading..."}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6 sm:p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  {t("followUs")}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <a
                    href={about?.instagram || "https://instagram.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-cyan-300 transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-300">📷</span>
                    <div>
                      <div className="font-semibold">Instagram</div>
                      <div className="text-sm text-gray-500">{about?.instagram ? about.instagram.split("/").pop() : "Loading..."}</div>
                    </div>
                  </a>
                  <a
                    href={about?.facebook || "https://facebook.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-300">👍</span>
                    <div>
                      <div className="font-semibold">Facebook</div>
                      <div className="text-sm text-gray-500">{about?.facebook ? about.facebook.split("/").pop() : "Loading..."}</div>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/50770176"
                    className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-300">💬</span>
                    <div>
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-sm text-gray-500">+216 50 770 176</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">{t("ourLocation")}</h3>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 h-96 border border-slate-600">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3268.6235627289676!2d10.1963!3d36.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130224a5d8b8b8b9%3A0x1b8b8b8b8b8b8b8b!2sC%C3%AEt%C3%A9%20El%20Khadhra!5e0!3m2!1sen!2stn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-sm text-white py-16 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h4 className="text-2xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AM Clean Services</h4>
              <p className="text-gray-400">{t("footerDesc")}</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">{t("quickLinks")}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-cyan-400 transition">{t("services")}</a></li>
                <li><a href="#about" className="hover:text-cyan-400 transition">{t("about")}</a></li>
                <li><a href="#projects" className="hover:text-cyan-400 transition">{t("projects")}</a></li>
                <li><a href="#contact" className="hover:text-cyan-400 transition">{t("contact")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">{t("contact")}</h4>
              <p className="text-gray-400 hover:text-cyan-400 transition">
                <a href={`tel:${about?.phone?.replace(/\s/g, "")}`}>
                  📱 {about?.phone || "+216 50 770 176"}
                </a>
              </p>
              <p className="text-gray-400 hover:text-cyan-400 transition">
                <a href={`mailto:${about?.email}`}>
                  📧 {about?.email || "amcleanservices06@gmail.com"}
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-gray-500">
            <p>&copy; 2026 AM Clean Services. All rights reserved. ✨</p>
          </div>
        </div>
      </footer>
    </div >
  );
}
