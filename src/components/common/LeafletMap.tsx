import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, IssueCategory, ComplaintStatus } from '../../types';

interface LeafletMapProps {
  complaints?: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  allowLocationPick?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onLocationPicked?: (lat: number, lng: number) => void;
  showFilters?: boolean;
}

// Marker color lookup
const getMarkerColor = (complaint: Complaint): string => {
  if (complaint.severity === 'High' && complaint.status !== 'Resolved' && complaint.status !== 'Rejected') {
    return '#DC2626'; // Red for High Priority unresolved
  }
  switch (complaint.status) {
    case 'Submitted':
      return '#EA580C'; // Orange
    case 'Verified':
      return '#2563EB'; // Blue
    case 'Assigned':
      return '#9333EA'; // Purple
    case 'In Progress':
      return '#CA8A04'; // Yellow/Gold
    case 'Resolved':
      return '#16A36A'; // Green
    case 'Rejected':
      return '#64748B'; // Grey
    default:
      return '#142D4E';
  }
};

// Create custom SVG Leaflet icon
const createCustomMarkerIcon = (color: string, label?: string, isPicked: boolean = false) => {
  const size = isPicked ? 36 : 30;
  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size + 10}px; display: flex; flex-direction: column; align-items: center; justify-content: center; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35)); cursor: pointer;">
      <svg width="${size}" height="${size + 8}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 27.5 16 40 16 40C16 40 32 27.5 32 16C32 7.16 24.84 0 16 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="16" cy="15" r="6" fill="#FFFFFF"/>
        ${isPicked ? '<circle cx="16" cy="15" r="3" fill="#142D4E"/>' : ''}
      </svg>
      ${label ? `<span style="position: absolute; top: 7px; font-size: 9px; font-weight: bold; color: ${color};">${label}</span>` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgHtml,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 4)]
  });
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  complaints = [],
  selectedComplaintId,
  onSelectComplaint,
  height = '460px',
  center = [19.0760, 72.8777],
  zoom = 12,
  interactive = true,
  allowLocationPick = false,
  pickedLocation,
  onLocationPicked,
  showFilters = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);

  const [activeFilter, setActiveFilter] = useState<'All' | IssueCategory | 'Pending' | 'Resolved'>('All');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: interactive,
        dragging: interactive
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map clicks for location picking
      if (allowLocationPick && onLocationPicked) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationPicked(e.latlng.lat, e.latlng.lng);
        });
      }

      // Small delay to invalidate size after layout render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle picked location updates
  useEffect(() => {
    if (!mapInstanceRef.current || !allowLocationPick) return;

    if (pickedMarkerRef.current) {
      mapInstanceRef.current.removeLayer(pickedMarkerRef.current);
      pickedMarkerRef.current = null;
    }

    if (pickedLocation) {
      const icon = createCustomMarkerIcon('#16A36A', '📍', true);
      const marker = L.marker([pickedLocation.lat, pickedLocation.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 13px; text-align: center;">
            <strong style="color: #142D4E;">Selected Incident Coordinates</strong><br/>
            <span>Lat: ${pickedLocation.lat.toFixed(5)}, Lng: ${pickedLocation.lng.toFixed(5)}</span>
          </div>
        `)
        .openPopup();

      pickedMarkerRef.current = marker;
      mapInstanceRef.current.panTo([pickedLocation.lat, pickedLocation.lng]);
    }
  }, [pickedLocation, allowLocationPick]);

  // Update Markers when complaints or activeFilter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Filter complaints
    const filtered = complaints.filter(c => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Pending') {
        return c.status === 'Submitted' || c.status === 'Verified' || c.status === 'Assigned' || c.status === 'In Progress';
      }
      if (activeFilter === 'Resolved') return c.status === 'Resolved';
      return c.category === activeFilter;
    });

    const bounds: [number, number][] = [];

    filtered.forEach(complaint => {
      const lat = complaint.location.lat;
      const lng = complaint.location.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      bounds.push([lat, lng]);
      const color = getMarkerColor(complaint);
      const isSelected = selectedComplaintId === complaint.id;
      const icon = createCustomMarkerIcon(color, undefined, isSelected);

      const marker = L.marker([lat, lng], { icon });

      // Build rich popup HTML
      const statusBadgeBg =
        complaint.status === 'Resolved' ? '#16A36A' :
        complaint.status === 'In Progress' ? '#CA8A04' :
        complaint.status === 'Assigned' ? '#9333EA' :
        complaint.status === 'Verified' ? '#2563EB' :
        complaint.status === 'Rejected' ? '#64748B' : '#EA580C';

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 220px; padding: 4px;">
          <div style="position: relative; width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #e2e8f0;">
            <img src="${complaint.imageUrl}" alt="${complaint.id}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='/images/fallback.jpg';" />
            <span style="position: absolute; top: 6px; right: 6px; background: ${statusBadgeBg}; color: white; font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
              ${complaint.status}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
            <span style="font-weight: 800; color: #142D4E; font-size: 13px;">${complaint.id}</span>
            <span style="font-size: 11px; font-weight: 600; color: #475569;">${complaint.category}</span>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0; line-height: 1.3; max-height: 32px; overflow: hidden; text-overflow: ellipsis;">
            ${complaint.description}
          </p>
          <div style="font-size: 10px; color: #334155; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            📍 <span>${complaint.location.area || complaint.location.city}</span>
          </div>
          <button id="btn-view-${complaint.id}" style="width: 100%; padding: 6px 10px; background-color: #142D4E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            View Full Report
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${complaint.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectComplaint) onSelectComplaint(complaint);
          };
        }
      });

      marker.addTo(markersLayerRef.current!);
    });

    // If multiple markers and no specific center override, fit bounds nicely
    if (bounds.length > 1 && !selectedComplaintId && !allowLocationPick) {
      try {
        mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
      } catch (e) {}
    } else if (selectedComplaintId) {
      const selected = complaints.find(c => c.id === selectedComplaintId);
      if (selected && selected.location.lat && selected.location.lng) {
        mapInstanceRef.current.setView([selected.location.lat, selected.location.lng], 15);
      }
    }
  }, [complaints, activeFilter, selectedComplaintId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Map Filter Controls Overlay */}
      {showFilters && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80">
          {(['All', 'Potholes', 'Waterlogging', 'Damaged Roads', 'Pending', 'Resolved'] as const).map(tab => {
            const mappedVal = tab === 'Potholes' ? 'Pothole' : tab === 'Damaged Roads' ? 'Damaged Road' : tab;
            const isActive = activeFilter === mappedVal;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(mappedVal as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#142D4E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}

      {/* Map Marker Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-slate-200/80 text-[11px] font-medium text-slate-700 hidden sm:block">
        <div className="font-bold text-[#142D4E] mb-1.5 text-[11px] uppercase tracking-wider">
          Marker Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
            <span>Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]"></span>
            <span>Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A36A]"></span>
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
            <span>High Severity</span>
          </div>
        </div>
      </div>

      {/* Leaflet container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
};
