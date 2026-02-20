"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function AdminDashboard() {
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [uploadError, setUploadError] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "image" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-none">
            <Link href="/" className="text-lg sm:text-2xl hover:text-cyan-400 transition text-cyan-400 font-bold whitespace-nowrap" title="Back to Home">
              ← Home
            </Link>
           
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50 text-white font-bold py-2 px-4 sm:px-6 rounded-lg transition whitespace-nowrap text-sm sm:text-base"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
      </main>
    </div>
  );
}
