import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  FolderOpen,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  Layers,
  Droplets,
  ShieldAlert,
  Loader2,
  Compass
} from 'lucide-react';
import { IssueCategory, IssueSeverity, DemoImage, Complaint } from '../../types';
import { ImageLibraryModal } from './ImageLibraryModal';
import { LeafletMap } from '../common/LeafletMap';
import { DEMO_LOCATIONS, handleImageError } from '../../data/demoImages';
import { createComplaint } from '../../services/dataService';

interface ReportIssueFormProps {
  onSuccess: (complaint: Complaint) => void;
  onCancel: () => void;
  onTrackComplaint: (id: string) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
}

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({
  onSuccess,
  onCancel,
  onTrackComplaint,
  currentUserId,
  currentUserName,
  currentUserEmail
}) => {
  // Form fields
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [category, setCategory] = useState<IssueCategory>('Pothole');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('High');
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    area: string;
    city: string;
    isDemo?: boolean;
  }>({
    lat: 19.0760,
    lng: 72.8777,
    address: 'Near Bandra Kurla Complex Junction, Road No. 4',
    area: 'BKC Central',
    city: 'Mumbai Metro',
    isDemo: true
  });

  // UI States
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(true);
  const [gpsSourceMessage, setGpsSourceMessage] = useState('Default municipal demo location initialized.');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selected from Demo Image Library
  const handleSelectFromLibrary = (img: DemoImage) => {
    setSelectedImage(img.url);
    setSelectedImageName(img.title);
    setIsLibraryOpen(false);

    // Auto-suggest category if valid
    if (img.category === 'Pothole' || img.category === 'Waterlogging' || img.category === 'Damaged Road') {
      setCategory(img.category);
    }

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setSelectedImageName(file.name);
          if (errors.image) {
            setErrors(prev => ({ ...prev, image: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle simulated / take photo
  const handleSimulateCamera = () => {
    // Quick camera capture from input if on mobile, or simulate instant snap
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  // Browser Geolocation API
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setGpsSourceMessage('Querying device GPS sensors...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({
            lat,
            lng,
            address: `GPS Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Geo-verified)`,
            area: 'Local Civic Ward Zone',
            city: 'Current Municipality',
            isDemo: false
          });
          setIsLocating(false);
          setLocationCaptured(true);
          setGpsSourceMessage('GPS coordinates successfully locked from device.');
        },
        (error) => {
          console.warn('Geolocation denied or unavailable:', error.message);
          // Fallback to cycling through authentic demo municipal coordinates
          const randomDemo = DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
          setLocation({
            ...randomDemo,
            isDemo: true
          });
          setIsLocating(false);
          setLocationCaptured(true);
          setGpsSourceMessage(`GPS permission not granted. Switched to verified municipal zone: ${randomDemo.area}`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setLocationCaptured(true);
      setGpsSourceMessage('Browser does not support direct GPS. Using municipal coordinate lock.');
    }
  };

  // Map click coordinate selection
  const handleMapLocationPicked = (lat: number, lng: number) => {
    setLocation({
      lat,
      lng,
      address: `Selected Map Point [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
      area: 'Selected Road Section',
      city: 'Municipal Area',
      isDemo: true
    });
    setLocationCaptured(true);
    setGpsSourceMessage('Manual pin dropped on road map.');
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedImage) {
      newErrors.image = 'Road photograph is required to file a report.';
    }
    if (!description.trim()) {
      newErrors.description = 'Please describe the road problem and its impact.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters.';
    }
    if (!location.lat || !location.lng) {
      newErrors.location = 'GPS coordinates are required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const created = createComplaint({
        citizenId: currentUserId,
        citizenName: currentUserName,
        citizenEmail: currentUserEmail,
        category,
        description: description.trim(),
        severity,
        imageUrl: selectedImage!,
        imageName: selectedImageName || `${category} on ${location.area}`,
        location
      });

      setIsSubmitting(false);
      setSubmittedComplaint(created);
      onSuccess(created);
    }, 600);
  };

  // SUCCESS SUBMISSION SCREEN
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#16A36A] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-[#16A36A] border border-emerald-200">
            Report Submitted Successfully
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] mt-3">
            Thank You for Making Roads Safer
          </h2>

          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your road issue complaint has been recorded in the municipal registry and dispatched to the verification queue.
          </p>

          {/* Complaint ID Badge */}
          <div className="my-8 p-6 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-md mx-auto">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Assigned Complaint Tracking ID
            </div>
            <div className="text-3xl font-extrabold text-[#142D4E] tracking-tight mt-1 font-mono">
              {submittedComplaint.id}
            </div>
            <div className="flex items-center justify-center gap-3 mt-4 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{submittedComplaint.category}</span>
              <span>•</span>
              <span>{submittedComplaint.location.area}</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{submittedComplaint.severity} Severity</span>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="text-left bg-blue-50/60 border border-blue-100 rounded-xl p-4 mb-8 text-xs text-blue-900 leading-relaxed max-w-md mx-auto">
            <strong>Demonstration Workflow Next Step:</strong> You can now track this complaint live, or log in as
            <code className="bg-blue-100 px-1 py-0.5 rounded mx-1 font-bold">admin@raastaai.demo</code>
            to verify it, assign a repair crew, and mark it resolved with before-and-after evidence.
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onTrackComplaint(submittedComplaint.id)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-[#142D4E] text-white hover:bg-[#0f233d] shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Track Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Hidden file input for device upload & camera */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#16A36A] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Civic Action Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
          Report a Road Issue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Help us identify and resolve road problems in your area. Every verified issue gets dispatched directly to municipal repair crews.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION A & B: PHOTOGRAPH UPLOAD & DEMO LIBRARY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#142D4E] flex items-center gap-2">
                <span>1. Upload Road Photograph</span>
                <span className="text-red-500 text-xs font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clear imagery helps municipal engineers verify road conditions accurately.
              </p>
            </div>
            {selectedImage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedImageName('');
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {/* Image Display or Selector Area */}
          {selectedImage ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#16A36A]/40 bg-slate-900 group aspect-video sm:max-h-80 w-full shadow-inner">
              <img
                src={selectedImage}
                alt="Selected road issue"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#16A36A] text-white flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Photograph Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 text-slate-900 hover:bg-white transition-all shadow-md"
                  >
                    Change Image
                  </button>
                </div>
                <div>
                  <p className="text-white text-xs font-bold drop-shadow">
                    {selectedImageName || 'Road issue evidence photo'}
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    Auto-categorized as: <strong className="text-white">{category}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center mx-auto mb-4">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-[#142D4E]">
                Attach Visual Evidence of Road Damage
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Choose an option below. For fast hackathon presentations, select from our preloaded library of road photos.
              </p>

              {/* Three Prominent Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                {/* 1. Upload from Device */}
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-[#142D4E] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload from Device</span>
                </button>

                {/* 2. Take Photo */}
                <button
                  type="button"
                  onClick={handleSimulateCamera}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-[#142D4E] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Take Photo</span>
                </button>

                {/* 3. Choose from Previous Records (Highlighted) */}
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-4 py-3 rounded-xl bg-[#142D4E] text-white font-bold text-xs hover:bg-[#0f233d] transition-all shadow-md flex items-center justify-center gap-2 group ring-2 ring-[#16A36A]/40"
                >
                  <FolderOpen className="w-4 h-4 text-[#16A36A]" />
                  <span>Choose from Previous Records</span>
                </button>
              </div>

              {errors.image && (
                <p className="text-xs text-red-600 font-semibold mt-4 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errors.image}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* SECTION C: ISSUE CATEGORY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-[#142D4E] flex items-center gap-2 mb-1">
            <span>2. Issue Category</span>
            <span className="text-red-500 text-xs font-bold">*</span>
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Select the classification that best describes the road defect.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pothole */}
            <button
              type="button"
              onClick={() => setCategory('Pothole')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${category === 'Pothole'
                  ? 'border-[#142D4E] bg-[#142D4E]/5 ring-2 ring-[#142D4E]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#142D4E]">Pothole</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Cavities, depressions, or rim holes on the roadway.
                </div>
              </div>
            </button>

            {/* Waterlogging */}
            <button
              type="button"
              onClick={() => setCategory('Waterlogging')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${category === 'Waterlogging'
                  ? 'border-[#142D4E] bg-[#142D4E]/5 ring-2 ring-[#142D4E]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#142D4E]">Waterlogging</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Stormwater pooling, drain overflow, or flooding.
                </div>
              </div>
            </button>

            {/* Damaged Road */}
            <button
              type="button"
              onClick={() => setCategory('Damaged Road')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${category === 'Damaged Road'
                  ? 'border-[#142D4E] bg-[#142D4E]/5 ring-2 ring-[#142D4E]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#142D4E]">Damaged Road</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Cracks, uneven pavement, sunken curb, or debris.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION D: DESCRIPTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-[#142D4E] flex items-center gap-2 mb-1">
            <span>3. Description</span>
            <span className="text-red-500 text-xs font-bold">*</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Provide details about the defect, traffic impact, and surrounding landmarks.
          </p>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
            }}
            placeholder="Describe the road problem and its impact..."
            className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#142D4E] focus:border-transparent transition-all"
          />

          {/* Quick Pre-fill shortcuts for rapid hackathon testing */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Quick Pre-fill:</span>
            <button
              type="button"
              onClick={() => setDescription('Large pothole on the main road causing difficulty for two-wheeler riders.')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Main road pothole
            </button>
            <button
              type="button"
              onClick={() => setDescription('Severe waterlogging near the residential street blocking school bus movement.')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Residential waterlogging
            </button>
            <button
              type="button"
              onClick={() => setDescription('Cracked road surface near junction with uneven asphalt and loose gravel.')}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Junction cracked road
            </button>
          </div>

          {errors.description && (
            <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* SECTION E: GPS LOCATION & MAP */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#142D4E] flex items-center gap-2">
                <span>4. GPS Location</span>
                <span className="text-red-500 text-xs font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact coordinates allow maintenance crews to pinpoint the spot instantly.
              </p>
            </div>

            {/* Use Current Location Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#16A36A] hover:bg-[#138a59] text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking GPS...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Use Current Location</span>
                </>
              )}
            </button>
          </div>

          {/* Captured Coordinates Summary */}
          {locationCaptured && (
            <div className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#142D4E]/10 text-[#142D4E] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#142D4E]">
                    {location.address}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Latitude: <strong className="text-slate-800">{location.lat.toFixed(6)}</strong> | Longitude:{' '}
                    <strong className="text-slate-800">{location.lng.toFixed(6)}</strong>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#16A36A]" />
                    <span>{gpsSourceMessage}</span>
                  </div>
                </div>
              </div>

              {/* Sample Location Switcher */}
              <div className="shrink-0 flex items-center gap-1 text-[11px]">
                <span className="text-slate-400">Demo Zones:</span>
                <select
                  aria-label="Select demo zone"
                  value={location.area}
                  onChange={(e) => {
                    const match = DEMO_LOCATIONS.find(l => l.area === e.target.value);
                    if (match) {
                      setLocation({ ...match, isDemo: true });
                      setGpsSourceMessage(`Selected municipal zone: ${match.area}`);
                    }
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none text-xs"
                >
                  {DEMO_LOCATIONS.map(l => (
                    <option key={l.area} value={l.area}>
                      {l.area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Leaflet Map Preview for Location */}
          <div className="relative">
            <LeafletMap
              height="280px"
              center={[location.lat, location.lng]}
              zoom={14}
              allowLocationPick={true}
              pickedLocation={{ lat: location.lat, lng: location.lng }}
              onLocationPicked={handleMapLocationPicked}
            />
            <div className="absolute top-2 right-2 z-[500] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 shadow-sm border border-slate-200">
              💡 Tip: Click anywhere on map to reposition pin
            </div>
          </div>
        </div>

        {/* SECTION F: SEVERITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <h2 className="text-base font-bold text-[#142D4E] flex items-center gap-2 mb-1">
            <span>5. Severity Level</span>
            <span className="text-red-500 text-xs font-bold">*</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Assess the urgency and safety hazard posed to citizens and motorists.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {(['Low', 'Medium', 'High'] as const).map(sev => {
              const isSelected = severity === sev;
              const colors = {
                Low: isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500' : 'border-slate-200 text-slate-700',
                Medium: isSelected ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500' : 'border-slate-200 text-slate-700',
                High: isSelected ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500' : 'border-slate-200 text-slate-700'
              };

              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${colors[sev]}`}
                >
                  <div className="font-extrabold text-sm">{sev}</div>
                  <div className="text-[11px] opacity-75 mt-0.5">
                    {sev === 'Low' ? 'Minor Surface Wear' : sev === 'Medium' ? 'Moderate Risk' : 'Severe Hazard'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION G: SUBMIT COMPLAINT */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm bg-[#142D4E] hover:bg-[#0f233d] text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting to Municipal Registry...</span>
              </>
            ) : (
              <>
                <span>Submit Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demo Image Library Modal */}
      <ImageLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectImage={handleSelectFromLibrary}
      />
    </div>
  );
};
