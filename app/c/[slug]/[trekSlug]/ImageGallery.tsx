"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
  gallery: string[];
}

export default function ImageGallery({ gallery }: ImageGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);

  if (!gallery || gallery.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === null) return;
    setIndex((index - 1 + gallery.length) % gallery.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === null) return;
    setIndex((index + 1) % gallery.length);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
      <h3 className="font-bold text-base font-[family-name:var(--font-sora-family)] text-text-primary">
        Trek Gallery
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {gallery.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setIndex(idx)}
            className="relative h-24 sm:h-28 rounded-xl overflow-hidden cursor-pointer bg-charcoal hover:opacity-85 transition-opacity"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {index !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none cursor-zoom-out"
          onClick={() => setIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setIndex(null)}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-white rounded-full bg-charcoal/50 hover:bg-charcoal transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Navigation */}
          {gallery.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 p-2.5 text-text-muted hover:text-white rounded-full bg-charcoal/50 hover:bg-charcoal transition-colors cursor-pointer z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Expanded Image */}
          <div 
            className="relative w-full max-w-4xl h-[70vh] md:h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[index]}
              alt=""
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Right Navigation */}
          {gallery.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 p-2.5 text-text-muted hover:text-white rounded-full bg-charcoal/50 hover:bg-charcoal transition-colors cursor-pointer z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Counter info */}
          <span className="absolute bottom-4 text-xs text-text-dim bg-charcoal/40 px-3 py-1 rounded-full">
            {index + 1} of {gallery.length}
          </span>
        </div>
      )}
    </div>
  );
}
