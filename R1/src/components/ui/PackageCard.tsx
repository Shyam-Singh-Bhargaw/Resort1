import React from "react";
import { PackageItem } from "@/types/packages";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface Props {
  pkg: PackageItem;
  onClick?: (p: PackageItem) => void;
}

export default function PackageCard({ pkg, onClick }: Props) {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick?.(pkg)}>
      <div className="w-full h-48 bg-gray-100 overflow-hidden">
        <OptimizedImage
          src={pkg.imageUrl || ""}
          alt={pkg.title}
          className="w-full h-full object-cover"
          fallbackQuery={pkg.title}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{pkg.title}</h3>
          {pkg.price ? <div className="text-sm font-medium text-muted">{pkg.price}</div> : null}
        </div>
        {pkg.description ? <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p> : null}
      </div>
    </div>
  );
}
