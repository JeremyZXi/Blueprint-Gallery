import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

interface IADetailViewProps {
  id: string;
  title: string;
  creator?: string;
  submissionDate?: string;
  category?: string;
  tags?: string[];
  description?: string;
  images: string[];
  pdfUrl?: string;
  onClose: () => void;
}

const IADetailView = ({
  id,
  title,
  creator,
  submissionDate,
  category,
  tags,
  description,
  images,
  pdfUrl,
  onClose
}: IADetailViewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Check if user has already liked this IA and get current like count on mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      // Get liked IAs from localStorage
      const likedIAs = JSON.parse(localStorage.getItem('likedIAs') || '{}');
      setHasLiked(!!likedIAs[id]);
      
      // Fetch current like count from Supabase
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('likes')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching like count:', error);
          return;
        }
        
        if (data && typeof data.likes === 'number') {
          setLikeCount(data.likes);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    checkLikeStatus();
  }, [id]);
  
  // Show animation on mount
  useEffect(() => {
    // Small delay to allow browser to render initial state
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);
  
  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length]);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };
  
  const handlePdfView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLiking) return; // Prevent multiple clicks while processing
    
    try {
      setIsLiking(true);
      
      // Toggle like status
      const newLikeStatus = !hasLiked;
      
      // Update local storage
      const likedIAs = JSON.parse(localStorage.getItem('likedIAs') || '{}');
      
      if (newLikeStatus) {
        // Add to liked IAs
        likedIAs[id] = Date.now();
      } else {
        // Remove from liked IAs
        delete likedIAs[id];
      }
      
      localStorage.setItem('likedIAs', JSON.stringify(likedIAs));
      setHasLiked(newLikeStatus);
      
      // Calculate new like count
      const increment = newLikeStatus ? 1 : -1;
      const newCount = likeCount + increment;
      
      // Optimistically update UI
      setLikeCount(newCount);
      
      // Update Supabase
      const { error } = await supabase
        .from('submissions')
        .update({ likes: newCount })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating like count:', error);
        // Revert optimistic update on error
        setLikeCount(likeCount);
        setHasLiked(hasLiked);
        localStorage.setItem('likedIAs', JSON.stringify(likedIAs));
        alert('Error updating like. Please try again.');
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the CSS transition duration
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50 p-8 transition-all duration-300 ease-in-out"
      style={{ 
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0)',
        opacity: isVisible ? 1 : 0
      }}
      onClick={handleClose}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row transform transition-all duration-300 ease-in-out"
        style={{ 
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          height: 'auto',
          maxHeight: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Image slideshow */}
        <div className="relative w-full md:w-1/2 bg-white flex items-center justify-center p-3">
          {/* Fixed aspect ratio container with border - 3:4 ratio */}
          <div 
            className="w-full relative border-6 border-white shadow-lg rounded-md overflow-hidden"
            style={{ 
              paddingBottom: '133.33%', /* 4:3 aspect ratio (4/3 = 1.3333) */
              boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.15)'
            }}
          > 
            {images.length > 0 ? (
              <>
                <div className="absolute inset-0 w-full h-full bg-gray-900">
                  {images.map((img, index) => (
                    <div
                      key={img}
                      className="absolute inset-0 h-full w-full transition-opacity duration-500"
                      style={{
                        opacity: index === currentImageIndex ? 1 : 0,
                        zIndex: index === currentImageIndex ? 1 : 0
                      }}
                    >
                      <img 
                        src={img} 
                        alt={`${title} - Image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Image counter */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs z-10">
                  {currentImageIndex + 1} / {images.length}
                </div>
                
                {/* Navigation arrows - smaller for the smaller modal */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 text-white z-10 transition-all duration-200 hover:scale-110 focus:outline-none"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 text-white z-10 transition-all duration-200 hover:scale-110 focus:outline-none"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 text-gray-300 flex items-center justify-center h-full bg-gray-800">
                <span>No images available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Project details */}
        <div className="w-full md:w-1/2 p-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-2">{title || "Untitled Project"}</h2>
            
            {/* Like and bookmark icons */}
            <div className="flex space-x-2">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center group"
              >
                <div className="relative">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 transition-all duration-300 ease-in-out ${
                      hasLiked 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400 hover:text-red-500'
                    } ${isLiking ? 'animate-pulse' : ''} transform group-hover:scale-110`}
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={hasLiked ? 0 : 2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                  {isLiking && (
                    <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-ping"></span>
                    </span>
                  )}
                </div>
                <span className={`ml-1 text-xs ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
                  {likeCount > 0 ? likeCount : ''}
                </span>
              </button>
              <button className="text-gray-400 hover:text-gray-700 transform transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mb-1">
            {creator ? `Name of Student: ${creator}` : "Name of Student: (Anonymous)"}
          </p>
          
          <p className="text-gray-700 text-sm mb-1">
            Time of Submission: {submissionDate || "Not available"}
          </p>
          
          <p className="text-gray-700 text-sm mb-3">
            Category: {category || "Not categorized"}
          </p>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-3">
              <p className="text-gray-700 text-sm mb-1">Tags:</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 font-medium text-sm mb-1">Description of the work:</p>
            {description ? (
              <p className="text-gray-600 text-sm">{description}</p>
            ) : (
              <div className="text-gray-500 text-sm">
                <p>Description not available</p>
              </div>
            )}
          </div>
          
          {/* Download button */}
          <button
            onClick={handlePdfView}
            disabled={!pdfUrl}
            className={`mt-2 w-full py-2 rounded-md text-white text-sm transition-all duration-200 ${
              pdfUrl ? 'bg-blue-500 hover:bg-blue-600 transform hover:scale-[1.02] active:scale-95' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {pdfUrl ? "View IA File" : "No IA File Available"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IADetailView; 