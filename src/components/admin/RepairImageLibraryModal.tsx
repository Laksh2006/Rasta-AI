import React from 'react';
import { X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { DEMO_REPAIR_IMAGES, handleImageError, FALLBACK_REPAIR_IMAGE } from '../../data/demoImages';
import { DemoImage } from '../../types';

interface RepairImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: DemoImage) => void;
  currentSelectedId?: string;
}

export const RepairImageLibraryModal: React.FC<RepairImageLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-emerald-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#16A36A]/15 text-[#16A36A]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-[#142D4E]">
                Demo Repair Images
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Select verified completion evidence showing repaired road surfaces.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-3 gap-5 bg-[#F8FAFC]">
          {DEMO_REPAIR_IMAGES.map(image => {
            const isSelected = currentSelectedId === image.id;
            return (
              <div
                key={image.id}
                className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col hover:shadow-md ${
                  isSelected
                    ? 'border-[#16A36A] ring-2 ring-[#16A36A]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, FALLBACK_REPAIR_IMAGE)}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#16A36A] text-white flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Repaired
                  </span>
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#16A36A] text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#142D4E] line-clamp-1">
                      {image.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {image.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectImage(image)}
                      className="w-full py-2 text-xs font-semibold rounded-lg bg-[#16A36A] text-white hover:bg-[#138a59] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Select Repair Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Completion evidence is required to finalize road resolution.</span>
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
