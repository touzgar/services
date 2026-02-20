"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

interface Media {
  id: string;
  title: string;
  description?: string;
  type: string;
  url: string;
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

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<"media" | "about" | "hero" | "services">("media");
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [uploadError, setUploadError] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "image" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // About states
  const [about, setAbout] = useState<About | null>(null);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutEditing, setAboutEditing] = useState(false);
  const [aboutData, setAboutData] = useState({
    aboutText: "",
    email: "",
    phone: "",
    address: "",
    instagram: "",
    facebook: "",
  });
  const [aboutError, setAboutError] = useState("");
  const [aboutSuccess, setAboutSuccess] = useState("");

  // Hero states
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroEditing, setHeroEditing] = useState(false);
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    ctaLink: "",
  });
  const [heroError, setHeroError] = useState("");
  const [heroSuccess, setHeroSuccess] = useState("");

  // Services states
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesEditing, setServicesEditing] = useState(false);
  const [newService, setNewService] = useState({ title: "", description: "", icon: "⭐" });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceData, setEditingServiceData] = useState({ title: "", description: "", icon: "" });
  const [servicesError, setServicesError] = useState("");
  const [servicesSuccess, setServicesSuccess] = useState("");
  const [deleteServiceConfirm, setDeleteServiceConfirm] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    fetchMedia();
    fetchAbout();
    fetchHero();
    fetchServices();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media?t=" + Date.now());
      if (response.ok) {
        const data = await response.json();
        setMedia(Array.isArray(data) ? data : []);
      } else {
        setMedia([]);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbout = async () => {
    try {
      setAboutLoading(true);
      const response = await fetch("/api/about?t=" + Date.now());
      if (response.ok) {
        const data = await response.json();
        setAbout(data);
        setAboutData({
          aboutText: data.aboutText,
          email: data.email,
          phone: data.phone,
          address: data.address,
          instagram: data.instagram,
          facebook: data.facebook,
        });
      }
    } catch (error) {
      console.error("Failed to fetch about:", error);
    } finally {
      setAboutLoading(false);
    }
  };

  const handleAboutSave = async () => {
    try {
      setAboutError("");
      setAboutSuccess("");
      
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutData),
      });

      if (response.ok) {
        const updatedAbout = await response.json();
        setAbout(updatedAbout);
        setAboutSuccess("✅ About & Contact updated successfully!");
        setAboutEditing(false);
        setTimeout(() => setAboutSuccess(""), 3000);
      } else {
        const error = await response.json();
        setAboutError(error.error || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to save about:", error);
      setAboutError("Failed to save");
    }
  };

  const fetchHero = async () => {
    try {
      setHeroLoading(true);
      const response = await fetch("/api/hero?t=" + Date.now());
      if (response.ok) {
        const data = await response.json();
        setHero(data);
        setHeroData({
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          ctaText: data.ctaText,
          ctaLink: data.ctaLink,
        });
      }
    } catch (error) {
      console.error("Failed to fetch hero:", error);
    } finally {
      setHeroLoading(false);
    }
  };

  const handleHeroSave = async () => {
    try {
      setHeroError("");
      setHeroSuccess("");
      
      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(heroData),
      });

      if (response.ok) {
        const updatedHero = await response.json();
        setHero(updatedHero);
        setHeroSuccess("✅ Hero section updated successfully!");
        setHeroEditing(false);
        setTimeout(() => setHeroSuccess(""), 3000);
      } else {
        const error = await response.json();
        setHeroError(error.error || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to save hero:", error);
      setHeroError("Failed to save");
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch("/api/services?t=" + Date.now());
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title || !newService.description || !newService.icon) {
      setServicesError("Please fill in all fields");
      return;
    }

    try {
      setServicesError("");
      setServicesSuccess("");

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        setNewService({ title: "", description: "", icon: "⭐" });
        setServicesSuccess("✅ Service added successfully!");
        await fetchServices();
        setTimeout(() => setServicesSuccess(""), 3000);
      } else {
        const error = await response.json();
        setServicesError(error.error || "Failed to add service");
      }
    } catch (error) {
      console.error("Failed to add service:", error);
      setServicesError("Failed to add service");
    }
  };

  const handleEditService = async (service: Service) => {
    setEditingServiceId(service.id);
    setEditingServiceData({
      title: service.title,
      description: service.description,
      icon: service.icon,
    });
  };

  const handleSaveServiceEdit = async () => {
    if (!editingServiceId) return;
    if (!editingServiceData.title || !editingServiceData.description || !editingServiceData.icon) {
      setServicesError("Please fill in all fields");
      return;
    }

    try {
      setServicesError("");
      setServicesSuccess("");

      const response = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingServiceId,
          ...editingServiceData,
        }),
      });

      if (response.ok) {
        setEditingServiceId(null);
        setEditingServiceData({ title: "", description: "", icon: "" });
        setServicesSuccess("✅ Service updated successfully!");
        await fetchServices();
        setTimeout(() => setServicesSuccess(""), 3000);
      } else {
        const error = await response.json();
        setServicesError(error.error || "Failed to update service");
      }
    } catch (error) {
      console.error("Failed to update service:", error);
      setServicesError("Failed to update service");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setServicesError("");
      setServicesSuccess("");

      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: serviceId }),
      });

      if (response.ok) {
        setDeleteServiceConfirm(null);
        setServicesSuccess("✅ Service deleted successfully!");
        await fetchServices();
        setTimeout(() => setServicesSuccess(""), 3000);
      } else {
        const error = await response.json();
        setServicesError(error.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
      setServicesError("Failed to delete service");
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mediaType", activeTab);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setFile(null);
        setUploadError("");
        await fetchMedia();
      } else {
        const data = await response.json();
        setUploadError(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    setDeleteConfirm(mediaId);
  };

  const confirmDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteConfirm(null);
        await fetchMedia();
      } else {
        const error = await response.json();
        console.error("Delete failed:", response.status, error.error);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔐</div>
          <p className="text-white text-xl">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect will be handled by useEffect if not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-3xl p-8 border-2 border-red-500 shadow-2xl shadow-red-500/30 max-w-sm mx-auto animate-scaleIn">
            <div className="text-center space-y-6">
              {/* Warning Icon */}
              <div className="text-6xl animate-bounce">⚠️</div>
              
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Delete Media?</h3>
                <p className="text-gray-300">This action cannot be undone. Are you absolutely sure?</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirm)}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition transform hover:scale-105 shadow-lg shadow-red-500/50"
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Media Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[50] flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <div className="relative bg-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/40 max-w-4xl w-full max-h-[90vh] flex flex-col animate-scaleIn" onClick={(e) => e.stopPropagation()}>
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
      {/* Upload Progress Modal */}
      {uploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-12 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-sm mx-4">
            <div className="flex flex-col items-center gap-8">
              {/* Animated Upload Icon */}
              <div className="relative w-24 h-24">
                {/* Rotating circle */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
                {/* Pulsing inner circle */}
                <div className="absolute inset-2 rounded-full border-2 border-blue-500 animate-pulse"></div>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {activeTab === "image" ? "🖼️" : "🎬"}
                </div>
              </div>

              {/* Progress Text */}
              <div className="text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {activeTab === "image" ? "Uploading Image..." : "Uploading Video..."}
                </h3>
                <p className="text-gray-400 text-sm">Please wait while we process your file</p>
              </div>

              {/* Animated dots */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-2 sm:py-3 md:py-4">
          {/* Top Row - Logo and Logout */}
          <div className="flex justify-between items-center gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <Link href="/" className="text-lg sm:text-xl md:text-2xl hover:text-cyan-400 transition text-cyan-400 font-bold whitespace-nowrap flex items-center gap-1" title="Back to Home">
                <span>🏠</span>
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="hidden md:block text-sm text-gray-400 ml-4">Admin Dashboard</div>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50 text-white font-bold py-1.5 px-2 sm:px-3 md:px-6 rounded-lg transition whitespace-nowrap text-xs sm:text-sm md:text-base flex items-center gap-1"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          
          {/* Info Bar - Shows current section */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 px-2">
            <span>📊</span>
            <span>Managing: </span>
            <span className="text-cyan-400 font-semibold">
              {mainTab === "media" ? "Media Gallery" : mainTab === "about" ? "About & Contact" : mainTab === "hero" ? "Hero Section" : "Services"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Main Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 md:gap-4 mb-6 sm:mb-8 border-b border-slate-600 pb-3 sm:pb-4 overflow-x-auto sticky top-14 md:top-20 z-40 bg-slate-900 -mx-4 px-3 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <button
            onClick={() => setMainTab("media")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-3 rounded-lg font-bold transition transform whitespace-nowrap text-xs sm:text-sm md:text-base ${
              mainTab === "media"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                : "bg-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-600"
            }`}
          >
            🖼️ <span className="hidden sm:inline">Media</span>
          </button>
          <button
            onClick={() => setMainTab("about")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-3 rounded-lg font-bold transition transform whitespace-nowrap text-xs sm:text-sm md:text-base ${
              mainTab === "about"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                : "bg-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-600"
            }`}
          >
            ℹ️ <span className="hidden sm:inline">About</span>
          </button>
          <button
            onClick={() => setMainTab("hero")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-3 rounded-lg font-bold transition transform whitespace-nowrap text-xs sm:text-sm md:text-base ${
              mainTab === "hero"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50"
                : "bg-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-600"
            }`}
          >
            🎬 <span className="hidden sm:inline">Hero</span>
          </button>
          <button
            onClick={() => setMainTab("services")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-3 rounded-lg font-bold transition transform whitespace-nowrap text-xs sm:text-sm md:text-base ${
              mainTab === "services"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50"
                : "bg-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-600"
            }`}
          >
            ⭐ <span className="hidden sm:inline">Services</span>
          </button>
        </div>

        {mainTab === "media" ? (
          <>
        {/* Upload Section - Tabbed Interface */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 lg:p-10 mb-10 sm:mb-12 border border-slate-600 overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8">
            🚀 Upload Media
          </h2>

          {/* Tab Navigation */}
          <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-slate-600 pb-4 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("image");
                setFile(null);
                setUploadError("");
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-bold transition transform whitespace-nowrap text-sm sm:text-base ${
                activeTab === "image"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                  : "bg-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-600"
              }`}
            >
              🖼️ Image
            </button>
            <button
              onClick={() => {
                setActiveTab("video");
                setFile(null);
                setUploadError("");
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-bold transition transform whitespace-nowrap text-sm sm:text-base ${
                activeTab === "video"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                  : "bg-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-600"
              }`}
            >
              🎬 Video
            </button>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                  📝 Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition text-sm sm:text-base"
                  placeholder={activeTab === "image" ? "e.g., Kitchen Cleaning" : "e.g., Cleaning Process"}
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                  📄 Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition text-sm sm:text-base"
                  placeholder="Add details about this content..."
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-3 sm:mb-4">
                {activeTab === "image" ? "🖼️ Select Image" : "🎬 Select Video"} *
              </label>
              <div className={`relative border-4 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition cursor-pointer ${
                activeTab === "image"
                  ? "border-cyan-500/50 hover:border-cyan-500 bg-slate-700/30 hover:bg-slate-700/50"
                  : "border-purple-500/50 hover:border-purple-500 bg-slate-700/30 hover:bg-slate-700/50"
              }`}>
                <input
                  type="file"
                  accept={activeTab === "image" ? "image/*" : "video/*"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFile(e.currentTarget.files?.[0] || null);
                    setUploadError("");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="pointer-events-none">
                  {!file ? (
                    <>
                      <div className={`text-4xl sm:text-5xl lg:text-6xl mb-4 ${
                        activeTab === "image" ? "text-cyan-400" : "text-purple-400"
                      }`}>
                        {activeTab === "image" ? "🖼️" : "🎬"}
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-gray-200 mb-2">
                        {activeTab === "image" ? "Drag and drop your image" : "Drag and drop your video"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {activeTab === "image" ? "or click to select" : "or click to select"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl sm:text-5xl mb-3">✅</div>
                      <p className="text-cyan-400 font-semibold text-sm sm:text-base break-all">{file.name}</p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-200 font-semibold text-sm sm:text-base">❌ {uploadError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full font-bold py-3 sm:py-4 px-4 rounded-lg transition transform text-white text-base sm:text-lg ${
                activeTab === "image"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  : "bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              }`}
            >
              {uploading ? `⏳ Uploading...` : `📤 Upload`}
            </button>
          </form>
        </div>

        {/* Gallery Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-10 border border-slate-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">🖼️ Media Gallery</h2>
            {/* Filter Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setGalleryFilter("all")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${galleryFilter === "all" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50" : "bg-slate-700 text-gray-300 hover:text-white"}`}
              >
                All
              </button>
              <button
                onClick={() => setGalleryFilter("image")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${galleryFilter === "image" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50" : "bg-slate-700 text-gray-300 hover:text-white"}`}
              >
                🖼️ Images
              </button>
              <button
                onClick={() => setGalleryFilter("video")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base ${galleryFilter === "video" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50" : "bg-slate-700 text-gray-300 hover:text-white"}`}
              >
                🎬 Videos
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">⏳ Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">📭 No media uploaded yet. Upload your first image or video!</p>
            </div>
          ) : media.filter(item => galleryFilter === "all" || item.type === galleryFilter).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">📭 No {galleryFilter}s found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {media.filter(item => galleryFilter === "all" || item.type === galleryFilter).map((item) => (
                <div 
                  key={item.id} 
                  className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 border border-slate-600 hover:border-cyan-500"
                >
                  {/* Background Image/Video */}
                  <div className="relative h-64 sm:h-72 lg:h-80 bg-slate-700 cursor-pointer overflow-hidden" onClick={() => setSelectedMedia(item)}>
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition duration-300"></div>

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white backdrop-blur-md border ${
                        item.type === "image" 
                          ? "bg-cyan-500/40 border-cyan-500/60" 
                          : "bg-purple-500/40 border-purple-500/60"
                      }`}>
                        {item.type === "image" ? "🖼️" : "🎬"}
                      </span>
                    </div>

                    {/* Play Icon for Videos */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-15">
                        <div className="text-5xl sm:text-6xl drop-shadow-lg animate-pulse">▶️</div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="bg-gradient-to-b from-slate-700 to-slate-800 p-4 sm:p-5">
                    <h3 className="font-bold text-white text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-cyan-300 transition">{item.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3">{item.description || "No description"}</p>
                    <p className="text-xs text-gray-500 mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => setSelectedMedia(item)}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2 px-3 rounded-lg transition transform hover:scale-105 text-xs sm:text-sm shadow-lg hover:shadow-cyan-500/50"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition transform hover:scale-105 text-xs sm:text-sm shadow-lg hover:shadow-red-500/50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="hidden sm:flex absolute bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm px-4 py-2 gap-4 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition duration-300">
                    <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        ) : mainTab === "about" ? (
          // About & Contact Section
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 lg:p-10 border border-slate-600">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ℹ️ Informations de Contact
              </h2>
              {!aboutEditing && (
                <button
                  onClick={() => setAboutEditing(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {aboutError && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-200 font-semibold">❌ {aboutError}</p>
              </div>
            )}

            {aboutSuccess && (
              <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-green-200 font-semibold">{aboutSuccess}</p>
              </div>
            )}

            {aboutLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">⏳ Loading...</p>
              </div>
            ) : aboutEditing ? (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAboutSave(); }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    📝 À Propos (About Us)
                  </label>
                  <textarea
                    value={aboutData.aboutText}
                    onChange={(e) => setAboutData({ ...aboutData, aboutText: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-base resize-none h-32"
                    placeholder="Entrez la description de votre entreprise..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      value={aboutData.email}
                      onChange={(e) => setAboutData({ ...aboutData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-base"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      📞 Téléphone (Phone)
                    </label>
                    <input
                      type="tel"
                      value={aboutData.phone}
                      onChange={(e) => setAboutData({ ...aboutData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-base"
                      placeholder="+216 50 000 000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      📍 Adresse (Address)
                    </label>
                    <input
                      type="text"
                      value={aboutData.address}
                      onChange={(e) => setAboutData({ ...aboutData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-base"
                      placeholder="Cité El Khadhra, Tunisia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      📷 Lien Instagram (Instagram Link)
                    </label>
                    <input
                      type="url"
                      value={aboutData.instagram}
                      onChange={(e) => setAboutData({ ...aboutData, instagram: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-base"
                      placeholder="https://instagram.com/amclean.services"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      👍 Lien Facebook (Facebook Link)
                    </label>
                    <input
                      type="url"
                      value={aboutData.facebook}
                      onChange={(e) => setAboutData({ ...aboutData, facebook: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-base"
                      placeholder="https://facebook.com/amclean.services"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAboutEditing(false);
                      if (about) {
                        setAboutData({
                          aboutText: about.aboutText,
                          email: about.email,
                          phone: about.phone,
                          address: about.address,
                          instagram: about.instagram,
                          facebook: about.facebook,
                        });
                      }
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
                  >
                    ✕ Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-bold text-purple-300 mb-3">📝 À Propos</h3>
                  <p className="text-gray-200 whitespace-pre-wrap">{about?.aboutText || "Not set"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">📍 Adresse</p>
                    <p className="text-white font-semibold">{about?.address || "Not set"}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">📞 Téléphone</p>
                    <p className="text-white font-semibold">{about?.phone || "Not set"}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">📧 Email</p>
                    <p className="text-white font-semibold">{about?.email || "Not set"}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">📷 Instagram</p>
                    <p className="text-blue-300 font-semibold truncate">
                      <a href={about?.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                        {about?.instagram || "Not set"}
                      </a>
                    </p>
                  </div>
                  <div className="md:col-span-2 bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">👍 Facebook</p>
                    <p className="text-blue-300 font-semibold truncate">
                      <a href={about?.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                        {about?.facebook || "Not set"}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : mainTab === "hero" ? (
          // Hero Section
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl shadow-orange-500/10 p-6 sm:p-8 lg:p-10 border border-slate-600">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                🎬 Hero Section
              </h2>
              {!heroEditing && (
                <button
                  onClick={() => setHeroEditing(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-orange-500/50"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {heroError && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-200 font-semibold">❌ {heroError}</p>
              </div>
            )}

            {heroSuccess && (
              <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-green-200 font-semibold">{heroSuccess}</p>
              </div>
            )}

            {heroLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">⏳ Loading...</p>
              </div>
            ) : heroEditing ? (
              <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={(e) => { e.preventDefault(); handleHeroSave(); }}>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                    📝 Hero Title
                  </label>
                  <input
                    type="text"
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition text-sm sm:text-base"
                    placeholder="e.g., Professional Cleaning Services"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                    🎯 Subtitle
                  </label>
                  <input
                    type="text"
                    value={heroData.subtitle}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition text-sm sm:text-base"
                    placeholder="e.g., Trusted & Eco-Friendly"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                    📄 Description
                  </label>
                  <textarea
                    value={heroData.description}
                    onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition text-sm sm:text-base resize-none h-20 sm:h-24"
                    placeholder="Describe your cleaning services..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                      🔘 CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={heroData.ctaText}
                      onChange={(e) => setHeroData({ ...heroData, ctaText: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition text-sm sm:text-base"
                      placeholder="e.g., Get Started"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                      🔗 CTA Button Link
                    </label>
                    <input
                      type="text"
                      value={heroData.ctaLink}
                      onChange={(e) => setHeroData({ ...heroData, ctaLink: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition text-sm sm:text-base"
                      placeholder="e.g., #contact or /services"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroEditing(false);
                      if (hero) {
                        setHeroData({
                          title: hero.title,
                          subtitle: hero.subtitle,
                          description: hero.description,
                          ctaText: hero.ctaText,
                          ctaLink: hero.ctaLink,
                        });
                      }
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105"
                  >
                    ✕ Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-orange-500/50"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-bold text-orange-300 mb-3">📝 Title</h3>
                  <p className="text-gray-200">{hero?.title || "Not set"}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-bold text-orange-300 mb-3">🎯 Subtitle</h3>
                  <p className="text-gray-200">{hero?.subtitle || "Not set"}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-bold text-orange-300 mb-3">📄 Description</h3>
                  <p className="text-gray-200 whitespace-pre-wrap">{hero?.description || "Not set"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">🔘 CTA Text</p>
                    <p className="text-white font-semibold">{hero?.ctaText || "Not set"}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-gray-400 mb-1">🔗 CTA Link</p>
                    <p className="text-white font-semibold">{hero?.ctaLink || "Not set"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Services Section
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl shadow-green-500/10 p-6 sm:p-8 lg:p-10 border border-slate-600">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ⭐ Services Management
              </h2>
              {!servicesEditing && (
                <button
                  onClick={() => setServicesEditing(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                >
                  ➕ Add Service
                </button>
              )}
            </div>

            {servicesError && (
              <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-200 font-semibold">❌ {servicesError}</p>
              </div>
            )}

            {servicesSuccess && (
              <div className="bg-green-900/50 border-2 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-green-200 font-semibold">{servicesSuccess}</p>
              </div>
            )}

            {/* Add Service Form */}
            {servicesEditing && (
              <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600 mb-8">
                <h3 className="text-lg font-bold text-green-300 mb-4">➕ Add New Service</h3>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Emoji Icon
                      </label>
                      <input
                        type="text"
                        value={newService.icon}
                        onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                        maxLength={2}
                        className="w-full px-3 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition text-center text-2xl"
                        placeholder="⭐"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                        placeholder="Service title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
                        placeholder="Service description"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setServicesEditing(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      ✕ Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      ✅ Add Service
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Services List */}
            {servicesLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">⏳ Loading services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">📭 No services yet. Add your first service!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-slate-700/50 rounded-lg p-6 border border-slate-600 hover:border-green-500/50 transition">
                    {editingServiceId === service.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleSaveServiceEdit(); }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Icon</label>
                            <input
                              type="text"
                              value={editingServiceData.icon}
                              onChange={(e) => setEditingServiceData({ ...editingServiceData, icon: e.target.value })}
                              maxLength={2}
                              className="w-full px-3 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white text-center text-2xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Title</label>
                            <input
                              type="text"
                              value={editingServiceData.title}
                              onChange={(e) => setEditingServiceData({ ...editingServiceData, title: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                            <input
                              type="text"
                              value={editingServiceData.description}
                              onChange={(e) => setEditingServiceData({ ...editingServiceData, description: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingServiceId(null)}
                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            ✕ Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            💾 Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-4xl pt-1">{service.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{service.title}</h3>
                            <p className="text-gray-400 text-sm">{service.description}</p>
                            <p className="text-xs text-gray-500 mt-2">Order: {service.order}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditService(service)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeleteServiceConfirm(service.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Service Confirmation Modal */}
      {deleteServiceConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-3xl p-8 border-2 border-red-500 shadow-2xl shadow-red-500/30 max-w-sm mx-auto animate-scaleIn">
            <div className="text-center space-y-6">
              <div className="text-6xl animate-bounce">⚠️</div>
              
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Delete Service?</h3>
                <p className="text-gray-300">This action cannot be undone. Are you absolutely sure?</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setDeleteServiceConfirm(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteService(deleteServiceConfirm)}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition transform hover:scale-105 shadow-lg shadow-red-500/50"
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}    </div>
  );
}