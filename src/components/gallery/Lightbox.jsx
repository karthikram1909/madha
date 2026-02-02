import React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Lightbox({ image, onClose, onNext, onPrev }) {
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 h-12 w-12 rounded-full"
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </Button>

      {/* Prev Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-14 w-14 rounded-full"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ChevronLeft className="h-10 w-10" />
      </Button>
      
      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-14 w-14 rounded-full"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ChevronRight className="h-10 w-10" />
      </Button>

      <motion.div
        layoutId={image.id}
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.image_url}
          alt={image.title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <h2 className="text-2xl font-bold">{image.title}</h2>
            <p>{image.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}