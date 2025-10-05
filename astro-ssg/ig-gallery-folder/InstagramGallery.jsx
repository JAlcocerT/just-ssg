import React, { useState, useEffect } from 'react';

const InstagramGallery = ({ images, initialLoadCount = 6 }) => {
  const [visibleCount, setVisibleCount] = useState(initialLoadCount);
  const [lightbox, setLightbox] = useState({ open: false, src: '', caption: '' });
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Handle both plain URL strings and imported asset module objects
  const srcOf = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // Common shapes: { src: string }, default export, or URL object
      if (typeof value.src === 'string') return value.src;
      if (typeof value.default === 'string') return value.default;
      try {
        return String(value);
      } catch {
        return '';
      }
    }
    return '';
  };
  
  const loadMore = () => {
    setVisibleCount(prevCount => 
      Math.min(prevCount + 6, images.length)
    );
  };

  // Images to display based on current visible count
  const visibleImages = images.slice(0, visibleCount);
  
  // Check if there are more images to load
  const hasMoreImages = visibleCount < images.length;
  
  const openLightbox = (index) => {
    if (index < 0 || index >= images.length) return;
    setCurrentIndex(index);
    const img = images[index];
    setLightbox({ open: true, src: srcOf(img.url), caption: img.caption || '' });
  };
  const closeLightbox = () => setLightbox((prev) => ({ ...prev, open: false }));
  const showNext = () => {
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    const img = images[next];
    setLightbox((prev) => ({ ...prev, src: srcOf(img.url), caption: img.caption || '' }));
  };
  const showPrev = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prev);
    const img = images[prev];
    setLightbox((prevState) => ({ ...prevState, src: srcOf(img.url), caption: img.caption || '' }));
  };
  
  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox.open, currentIndex, images.length]);

  return (
    <div className="space-y-6">
      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
        {visibleImages.map((image, index) => (
          <div 
            key={index} 
            className="aspect-square overflow-hidden rounded-md hover:opacity-90 transition-opacity cursor-zoom-in relative group"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={srcOf(image.url)} 
              alt={image.caption || `Property image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            
            {/* Optional caption overlay on hover */}
            {image.caption && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMoreImages && (
        <div className="flex justify-center">
          <button 
            onClick={loadMore}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center space-x-2"
            aria-label="Load more images"
          >
            <span>Load More</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Counter showing how many images are displayed */}
      <div className="text-center text-sm text-gray-500">
        Showing {visibleCount} of {images.length} photos
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-neutral-900 shadow hover:bg-white"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M15.53 4.47a.75.75 0 0 1 0 1.06L9.06 12l6.47 6.47a.75.75 0 1 1-1.06 1.06l-7-7a.75.75 0 0 1 0-1.06l7-7a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
          </button>
          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-neutral-900 shadow hover:bg-white"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M8.47 19.53a.75.75 0 0 1 0-1.06L14.94 12 8.47 5.53a.75.75 0 1 1 1.06-1.06l7 7a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" /></svg>
          </button>
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-neutral-900 shadow hover:bg-white"
            aria-label="Close"
          >
            Close
          </button>
          <figure className="max-h-full max-w-6xl">
            <img src={lightbox.src} alt="" className="max-h-[80vh] w-auto rounded-lg shadow-xl" />
            {lightbox.caption && (
              <figcaption className="mt-3 text-center text-sm text-neutral-200">{lightbox.caption}</figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
};

export default InstagramGallery;
