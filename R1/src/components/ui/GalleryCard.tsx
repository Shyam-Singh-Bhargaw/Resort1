import React from "react";
import { GalleryImage } from "../../types/gallery";
import OptimizedImage from "./OptimizedImage";

interface Props {
  item: GalleryImage;
  onOpen?: (item: GalleryImage) => void;
}

const GalleryCard: React.FC<Props> = ({ item, onOpen }) => {
  return (
    <div className="group relative rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
      <button aria-label={item.caption || "Open image"} onClick={() => onOpen?.(item)} className="block w-full text-left">
        <div className="w-full h-64 bg-gray-100">
          <OptimizedImage src={item.imageUrl} alt={item.caption || "gallery image"} className="w-full h-full object-cover" fallbackQuery={item.caption || item.category || 'resort'} />
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">{item.category}</div>
          <div className="mt-2 font-medium text-lg text-gray-900">{item.caption}</div>
        </div>
      </button>
    </div>
  );
};

export default GalleryCard;
