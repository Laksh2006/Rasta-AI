import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  Wrench
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { getComplaints } from '../../services/dataService';
import { LeafletMap } from '../common/LeafletMap';
import { handleImageError, FALLBACK_REPAIR_IMAGE } from '../../data/demoImages';

interface TrackComplaintProps {
  initialComplaintId?: string;
  onOpenReportForm?: () => void;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  initialComplaintId = '',
  onOpenReportForm
}) => {
  const [searchQuery, setSearchQuery] = useState(initialComplaintId);
  const [activeComplaintId, setActiveComplaintId] = useState(initialComplaintId || 'RA-2026-001');
  const [searchError, setSearchError] = useState('');

  const allComplaints = getComplaints();
  const currentComplaint = allComplaints.find(
    c => c.id.trim().toLowerCase() === activeComplaintId.trim().toLowerCase()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const target = searchQuery.trim().toUpperCase();
    if (!target) return;

    const match = allComplaints.find(c => c.id.toUpperCase() === target);
    if (match) {
      setActiveComplaintId(match.id);
    } else {
      setSearchError(`Complaint ID "${target}" not found. Try RA-2026-001 or select from recent reports.`);
    }
  };

  // Timeline stage configuration
  const STAGES: { status: ComplaintStatus; label: string; desc: string; icon: any }[] = [
    {
      status: 'Submitted',
      label: 'Submitted',
      desc: 'Complaint registered by citizen with photo evidence & coordinates.',
      icon: Clock
    },
    {
      status: 'Verified',
      label: 'Verified',
      desc: 'Municipal engineer inspected and confirmed civic jurisdiction.',
      icon: ShieldCheck
    },
    {
      status: 'Assigned',
      label: 'Assigned',
      desc: 'Work order dispatched to dedicated road maintenance team.',
      icon: Truck
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      desc: 'Heavy machinery and repair crew mobilized on site.',
      icon: Wrench
    },
    {
      status: 'Resolved',
      label: 'Resolved',
      desc: 'Surface repair completed, quality inspected, and verified.',
      icon: CheckCircle2
    }
  ];

  // Map status to progress step order (0 to 4), or -1 if rejected
  const getStageIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Verified': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      case 'Rejected': return -1;
      default: return 0;
    }
  };

  const currentStageIndex = currentComplaint ? getStageIndex(currentComplaint.status) : 0;
  const isRejected = currentComplaint?.status === 'Rejected';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
          Civic Issue Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor real-time municipal inspection, assignment, and repair progress for any road complaint.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchError) setSearchError('');
              }}
              placeholder="Search by Complaint ID (e.g., RA-2026-001)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#142D4E] font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#142D4E] hover:bg-[#0f233d] text-white text-sm font-bold shadow-sm transition-colors shrink-0"
          >
            Track Issue
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-red-600 font-semibold mt-2.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </p>
        )}

        {/* Quick Suggestion Pills */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Quick Demo Reports:</span>
          {allComplaints.slice(0, 5).map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveComplaintId(c.id);
                setSearchQuery(c.id);
                setSearchError('');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${activeComplaintId === c.id
                  ? 'bg-[#142D4E] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              {c.id} ({c.status})
            </button>
          ))}
        </div>
      </div>

      {/* Main Details Card */}
      {currentComplaint ? (
        <div className="space-y-6">
          {/* Status Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#142D4E]">
                    {currentComplaint.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentComplaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        currentComplaint.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                          currentComplaint.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                            currentComplaint.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                              currentComplaint.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                      }`}
                  >
                    {currentComplaint.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Reported on {new Date(currentComplaint.createdAt).toLocaleDateString()} at{' '}
                    {new Date(currentComplaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>•</span>
                  <span>Reported by: <strong>{currentComplaint.citizenName}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Severity:</span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${currentComplaint.severity === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                      currentComplaint.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                    }`}
                >
                  {currentComplaint.severity} Priority
                </span>
              </div>
            </div>

            {/* Description & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Issue Category & Description
                  </h3>
                  <div className="text-base font-bold text-[#142D4E] flex items-center gap-2 mb-1.5">
                    <Layers className="w-4 h-4 text-[#16A36A]" />
                    <span>{currentComplaint.category}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {currentComplaint.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Location & Landmark
                  </div>
                  <div className="text-sm font-semibold text-slate-800 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <div>{currentComplaint.location.address}</div>
                      <div className="text-xs text-slate-500 font-normal mt-0.5 font-mono">
                        Zone: {currentComplaint.location.area} • GPS: [{currentComplaint.location.lat.toFixed(4)}, {currentComplaint.location.lng.toFixed(4)}]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment & Resolution Callout */}
                {currentComplaint.assignedTeam && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <span>Maintenance Allocation: {currentComplaint.assignedTeam}</span>
                    </div>
                    {currentComplaint.assignmentRemarks && (
                      <p className="text-xs text-purple-800 mt-1">
                        Dispatch Notes: {currentComplaint.assignmentRemarks}
                      </p>
                    )}
                  </div>
                )}

                {isRejected && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Official Rejection Notice</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      {currentComplaint.rejectionReason || 'Complaint does not meet municipal criteria or falls under private jurisdiction.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Original Photograph Preview */}
              <div className="md:col-span-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reported Photograph
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square relative shadow-inner">
                  <img
                    src={currentComplaint.imageUrl}
                    alt={currentComplaint.id}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                    Citizen Photo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BEFORE & AFTER RESOLUTION COMPARISON (Crucial for Demo Workflow Steps 16-17) */}
          {currentComplaint.status === 'Resolved' && currentComplaint.repairEvidenceImage && (
            <div className="bg-emerald-50/70 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#16A36A] mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Verification Complete • Public Resolution Proof</span>
              </div>
              <h3 className="text-xl font-black text-[#142D4E] mb-1">
                Before &amp; After Repair Comparison
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Official municipal completion evidence submitted by authorized field engineering teams.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BEFORE */}
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <div className="p-3 bg-red-50 border-b border-red-100 flex items-center justify-between text-xs font-bold text-red-800">
                    <span>BEFORE REPAIR</span>
                    <span className="text-[11px] font-normal text-red-600">Reported State</span>
                  </div>
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={currentComplaint.imageUrl}
                      alt="Before repair"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-3 text-xs text-slate-500">
                    Original issue: {currentComplaint.category}
                  </div>
                </div>

                {/* AFTER */}
                <div className="bg-white rounded-2xl overflow-hidden border border-emerald-300 shadow-sm ring-2 ring-emerald-500/20">
                  <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
                      AFTER REPAIR (COMPLETED)
                    </span>
                    <span className="text-[11px] font-normal text-emerald-600">Resolved State</span>
                  </div>
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={currentComplaint.repairEvidenceImage}
                      alt="After repair"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, FALLBACK_REPAIR_IMAGE)}
                    />
                  </div>
                  <div className="p-3 text-xs text-slate-700 bg-emerald-50/30">
                    <strong>Completion Remarks:</strong> {currentComplaint.resolutionRemarks || 'Road surface successfully repaired.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VERTICAL STATUS TIMELINE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h3 className="text-lg font-bold text-[#142D4E] mb-2">
              Resolution Workflow Timeline
            </h3>
            <p className="text-xs text-slate-500 mb-8">
              Step-by-step audit trail from initial citizen report to on-ground repair completion.
            </p>

            {isRejected ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-red-900">Complaint Rejected</h4>
                <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
                  {currentComplaint.rejectionReason}
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {STAGES.map((stage, idx) => {
                  const isCompleted = currentStageIndex >= idx;
                  const isActive = currentStageIndex === idx;
                  const Icon = stage.icon;

                  // Find matching history entry
                  const historyEntry = currentComplaint.timeline.find(t => t.status === stage.status);

                  return (
                    <div key={stage.status} className="relative flex items-start gap-4">
                      {/* Timeline Node Indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${isCompleted
                            ? 'bg-[#16A36A] text-white shadow-md ring-4 ring-emerald-50'
                            : isActive
                              ? 'bg-[#142D4E] text-white shadow-md ring-4 ring-blue-50'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4
                            className={`font-bold text-sm ${isCompleted ? 'text-slate-900' : 'text-slate-400'
                              }`}
                          >
                            {stage.label}
                          </h4>
                          {historyEntry?.timestamp ? (
                            <span className="text-[11px] font-mono text-slate-500">
                              {new Date(historyEntry.timestamp).toLocaleDateString()} at{' '}
                              {new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {isActive ? 'Currently Active' : 'Pending'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {historyEntry?.remarks || stage.desc}
                        </p>

                        {historyEntry?.actor && (
                          <div className="mt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Logged by: {historyEntry.actor}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Location Map */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h3 className="text-lg font-bold text-[#142D4E] mb-1">
              Geographic Incident Coordinates
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pinned on municipal road telemetry grid with OpenStreetMap layers.
            </p>
            <LeafletMap
              complaints={[currentComplaint]}
              selectedComplaintId={currentComplaint.id}
              height="280px"
              center={[currentComplaint.location.lat, currentComplaint.location.lng]}
              zoom={15}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#142D4E]">Complaint Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Please verify the complaint tracking number or choose from available reports.
          </p>
        </div>
      )}
    </div>
  );
};
