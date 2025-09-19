"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Eye,
  Download,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    featured: false
  });

  useEffect(() => {
    fetchGalleries();
    fetchFeaturedGalleries();
  }, [filters]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.featured) queryParams.append('featured', 'true');

      const response = await fetch(`/api/gallery?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setGalleries(data.galleries || []);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedGalleries = async () => {
    try {
      const response = await fetch('/api/gallery/featured?limit=3');
      if (response.ok) {
        const data = await response.json();
        setFeaturedGalleries(data);
      }
    } catch (error) {
      console.error('Error fetching featured galleries:', error);
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'events', label: 'Events' },
    { value: 'alumni', label: 'Alumni' },
    { value: 'campus', label: 'Campus' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'conferences', label: 'Conferences' },
    { value: 'reunions', label: 'Reunions' },
    { value: 'general', label: 'General' }
  ];

  const openLightbox = (gallery, imageIndex = 0) => {
    setSelectedGallery(gallery);
    setCurrentImageIndex(imageIndex);
  };

  const closeLightbox = () => {
    setSelectedGallery(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === selectedGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedGallery.images.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Photo Gallery
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Relive our memorable moments, events, and celebrations through 
              our collection of photographs and memories.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Featured Galleries Section */}
      {featuredGalleries.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Galleries
              </h2>
              <p className="text-xl text-gray-600">
                Highlighting our most memorable moments
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredGalleries.map((gallery, index) => (
                <motion.div 
                  key={gallery._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => openLightbox(gallery)}
                >
                  <div className="h-64 bg-gradient-to-r from-purple-500 to-pink-600 relative">
                    {gallery.coverImage && (
                      <img 
                        src={gallery.coverImage} 
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-medium rounded-full flex items-center">
                        <Camera className="w-4 h-4 mr-1" />
                        Featured
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {gallery.images.length} photos
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {gallery.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {gallery.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(gallery.date)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {gallery.viewCount || 0}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {gallery.likeCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search galleries..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Category Filter */}
              <select
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* Featured Filter */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Featured only</span>
              </label>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Galleries Grid/List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading galleries...</p>
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No galleries found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new galleries.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              : "space-y-6"
            }>
              {galleries.map((gallery, index) => (
                <motion.div 
                  key={gallery._id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => openLightbox(gallery)}
                >
                  <div className={`${viewMode === 'list' ? 'w-1/3' : 'h-64'} bg-gradient-to-r from-purple-500 to-pink-600 relative`}>
                    {gallery.coverImage && (
                      <img 
                        src={gallery.coverImage} 
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-black/50 text-white text-sm rounded">
                        {gallery.images.length} photos
                      </span>
                    </div>
                    {gallery.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-6 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {gallery.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {gallery.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(gallery.date)}</span>
                        </div>
                        {gallery.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{gallery.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {gallery.viewCount || 0}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {gallery.likeCount || 0}
                        </span>
                      </div>
                    </div>
                    {gallery.tags && gallery.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {gallery.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {galleries.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-lg transition-colors">
                Load More Galleries
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-6xl max-h-full mx-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedGallery.images[currentImageIndex]?.url}
                alt={`${selectedGallery.title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {/* Navigation Arrows */}
              {selectedGallery.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Info */}
            <div className="mt-4 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedGallery.title}</h3>
              <p className="text-gray-300 mb-4">{selectedGallery.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {currentImageIndex + 1} of {selectedGallery.images.length}
                </span>
                <div className="flex space-x-4">
                  <button className="flex items-center text-white hover:text-gray-300">
                    <Heart className="w-5 h-5 mr-2" />
                    Like
                  </button>
                  <button className="flex items-center text-white hover:text-gray-300">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                  <button className="flex items-center text-white hover:text-gray-300">
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Share Your Memories
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have photos from XAAB events? Share them with our community and help us build our collective memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signin"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Upload Photos
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
