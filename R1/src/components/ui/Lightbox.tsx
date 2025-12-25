import React, { useEffect } from "react";
import { GalleryImage } from "../../types/gallery";
import OptimizedImage from "./OptimizedImage";

interface Props {
  item: GalleryImage | null;
  onClose: () => void;
}

const Lightbox: React.FC<Props> = ({ item, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <OptimizedImage src={item.imageUrl} alt={item.caption} className="w-full h-auto rounded shadow-lg" fallbackQuery={item.category || item.caption || 'resort'} />
        <div className="mt-3 bg-white p-4 rounded">
          <div className="font-semibold text-lg">{item.caption}</div>
          <div className="text-sm text-gray-500 mt-1">{item.category} • {new Date(item.createdAt || "").toLocaleDateString()}</div>
          <div className="mt-3 text-right">
            <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
