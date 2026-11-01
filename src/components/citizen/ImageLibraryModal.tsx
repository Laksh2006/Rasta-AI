import React, { useState } from 'react';
import { X, Check, Filter, Image as ImageIcon } from 'lucide-react';
import { DEMO_ROAD_IMAGES, handleImageError } from '../../data/demoImages';
import { DemoImage, IssueCategory } from '../../types';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: DemoImage) => void;
  currentSelectedId?: string;
}

export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedId
}) => {
  const [activeTab, setActiveTab] = useState<'All' | IssueCategory>('All');

  if (!isOpen) return null;

  const filteredImages = DEMO_ROAD_IMAGES.filter(img => {
    if (activeTab === 'All') return true;
    return img.category === activeTab;
  });

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#142D4E]/10 text-[#142D4E]">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-[#142D4E]">
                Choose from Previous Records
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Select a sample road issue photograph for your demonstration.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-white">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          {(['All', 'Pothole', 'Waterlogging', 'Damaged Road'] as const).map(tab => {
            const label =
              tab === 'All' ? 'All Images' :
                tab === 'Pothole' ? 'Potholes' :
                  tab === 'Damaged Road' ? 'Damaged Roads' : 'Waterlogging';
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${isSelected
                    ? 'bg-[#142D4E] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Images Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-[#F8FAFC]">
          {filteredImages.map(image => {
            const isSelected = currentSelectedId === image.id;
            return (
              <div
                key={image.id}
                className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col hover:shadow-md ${isSelected
                    ? 'border-[#16A36A] ring-2 ring-[#16A36A]/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                  }`}
              >
                {/* Image Thumbnail */}
                <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />
                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-black/65 text-white backdrop-blur-md">
                    {image.category}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#16A36A] text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#142D4E] line-clamp-1 group-hover:text-[#16A36A] transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {image.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      ID: {image.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectImage(image)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${isSelected
                          ? 'bg-[#16A36A] text-white hover:bg-[#138a59]'
                          : 'bg-[#142D4E] text-white hover:bg-[#0f233d]'
                        }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>9 Verified Road Issue Samples available for quick hackathon demonstrations</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
