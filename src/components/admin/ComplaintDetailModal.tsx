import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Truck,
  Wrench,
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  Upload,
  FolderOpen,
  Send,
  Trash2,
  Layers,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Complaint, DemoImage } from '../../types';
import { LeafletMap } from '../common/LeafletMap';
import { RepairImageLibraryModal } from './RepairImageLibraryModal';
import { handleImageError, FALLBACK_REPAIR_IMAGE } from '../../data/demoImages';
import {
  verifyComplaint,
  rejectComplaint,
  assignComplaint,
  markComplaintInProgress,
  resolveComplaint
} from '../../services/dataService';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: (updated: Complaint) => void;
  adminName?: string;
}

const TEAMS = [
  'Road Maintenance Team A',
  'Road Maintenance Team B',
  'Municipal Repair Team',
  'Emergency Road Repair Team'
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdateSuccess,
  adminName = 'Rajesh Varma'
}) => {
  if (!isOpen || !complaint) return null;

  // Local state for actions
  const [activeTab, setActiveTab] = useState<'details' | 'workflow'>('workflow');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Assignment state
  const [selectedTeam, setSelectedTeam] = useState(complaint.assignedTeam || TEAMS[0]);
  const [assignPriority, setAssignPriority] = useState<'Standard' | 'Urgent' | 'Emergency'>(
    complaint.severity === 'High' ? 'Urgent' : 'Standard'
  );
  const [assignRemarks, setAssignRemarks] = useState('');

  // Resolution state
  const [repairEvidence, setRepairEvidence] = useState<string | null>(complaint.repairEvidenceImage || null);
  const [resolutionRemarks, setResolutionRemarks] = useState(complaint.resolutionRemarks || '');
  const [isRepairLibraryOpen, setIsRepairLibraryOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Verify Action
  const handleVerify = () => {
    const updated = verifyComplaint(complaint.id, adminName);
    if (updated) {
      showToast(`Complaint ${complaint.id} verified successfully!`);
      onUpdateSuccess(updated);
    }
  };

  // 2. Reject Action
  const handleReject = () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify an official reason for rejection.');
      return;
    }
    const updated = rejectComplaint(complaint.id, rejectReason.trim(), adminName);
    if (updated) {
      showToast(`Complaint ${complaint.id} marked as Rejected.`);
      setShowRejectInput(false);
      onUpdateSuccess(updated);
    }
  };

  // 3. Assign Action
  const handleAssign = () => {
    const updated = assignComplaint(
      complaint.id,
      selectedTeam,
      assignPriority,
      assignRemarks.trim() || undefined,
      adminName
    );
    if (updated) {
      showToast(`Work order assigned to ${selectedTeam}`);
      onUpdateSuccess(updated);
    }
  };

  // 4. Mark In Progress Action
  const handleMarkInProgress = () => {
    const updated = markComplaintInProgress(complaint.id, selectedTeam || 'Municipal Field Crew');
    if (updated) {
      showToast(`Repair crew mobilized. Status: In Progress.`);
      onUpdateSuccess(updated);
    }
  };

  // 5. Resolve Action
  const handleResolve = () => {
    if (!repairEvidence) {
      setErrorMsg('Resolution requires completion evidence photograph (before/after verification).');
      return;
    }
    if (!resolutionRemarks.trim()) {
      setErrorMsg('Please provide completion remarks detailing the repair work done.');
      return;
    }

    const updated = resolveComplaint(
      complaint.id,
      repairEvidence,
      resolutionRemarks.trim(),
      adminName
    );
    if (updated) {
      showToast(`Complaint ${complaint.id} successfully marked as RESOLVED!`);
      onUpdateSuccess(updated);
    }
  };

  // Handle local file upload for repair evidence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRepairEvidence(event.target.result as string);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1400] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-extrabold text-[#142D4E]">
              {complaint.id}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                complaint.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                complaint.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                complaint.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                complaint.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }`}
            >
              {complaint.status}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                complaint.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {complaint.severity} Severity
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-[#F8FAFC]">
          {/* Top Quick Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Image Preview */}
            <div className="md:col-span-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Reported Evidence
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                <img
                  src={complaint.imageUrl}
                  alt={complaint.id}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded">
                  {complaint.category}
                </span>
              </div>
            </div>

            {/* Incident Details */}
            <div className="md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                    Incident Description
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold text-slate-900">{complaint.location.address}</span>
                  <span className="text-slate-400 font-mono">[{complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}]</span>
                </div>
                <div className="text-slate-500">
                  Reported by: <strong className="text-slate-800">{complaint.citizenName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* WORKFLOW ACTIONS ACCORDION / STEPPER */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-[#142D4E] text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16A36A]" />
                <span>Municipal Resolution Workflow</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                Logged in as: {adminName}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: VERIFICATION (When Submitted) */}
            {complaint.status === 'Submitted' && (
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#142D4E]">
                      Step 1: Inspect and Verify Complaint
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Confirm jurisdiction and validate road defect before assigning municipal resources.
                    </p>
                  </div>
                </div>

                {!showRejectInput ? (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleVerify}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#16A36A] hover:bg-[#138a59] text-white shadow-md transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Complaint</span>
                    </button>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Complaint</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">
                      Rejection Reason (will be dispatched to citizen):
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Private society jurisdiction / duplicate report..."
                      className="w-full text-xs p-3 rounded-xl border border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReject}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setShowRejectInput(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ASSIGNMENT (When Verified) */}
            {complaint.status === 'Verified' && (
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-[#142D4E] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Step 2: Assign Maintenance Team</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Issue municipal work order and assign field repair squad.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Maintenance Crew:
                    </label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#142D4E]"
                    >
                      {TEAMS.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Priority Level:
                    </label>
                    <select
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#142D4E]"
                    >
                      <option value="Standard">Standard Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Emergency">Emergency Rapid Action</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Special Work Order Notes (Optional):
                  </label>
                  <input
                    type="text"
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                    placeholder="e.g. Bring mini-roller and cold-mix bituminous patch..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleAssign}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#142D4E] hover:bg-[#0f233d] text-white shadow-md transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign Maintenance Team</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MARK IN PROGRESS (When Assigned) */}
            {complaint.status === 'Assigned' && (
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#142D4E] flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-purple-600" />
                      <span>Step 3: Mobilize On-Ground Repairs</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Assigned to <strong>{complaint.assignedTeam}</strong>. Mark when machinery and crew arrive on site.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleMarkInProgress}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Mark as In Progress</span>
                </button>
              </div>
            )}

            {/* STEP 4: RESOLUTION (When In Progress) */}
            {complaint.status === 'In Progress' && (
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-[#142D4E] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
                    <span>Step 4: Finalize Road Resolution</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Requires photographic evidence of repaired road and official completion remarks.
                  </p>
                </div>

                {/* Repair Evidence Photograph */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      Upload Repair Evidence <span className="text-red-500">*</span>
                    </label>
                    {repairEvidence && (
                      <button
                        type="button"
                        onClick={() => setRepairEvidence(null)}
                        className="text-xs text-red-600 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Evidence</span>
                      </button>
                    )}
                  </div>

                  {repairEvidence ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#16A36A] aspect-video max-h-48 bg-slate-900">
                      <img
                        src={repairEvidence}
                        alt="Repair evidence"
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, FALLBACK_REPAIR_IMAGE)}
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#16A36A] text-white">
                        ✓ Repair Evidence Attached
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-700">Upload from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsRepairLibraryOpen(true)}
                        className="p-4 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50/50 transition-colors flex flex-col items-center justify-center text-center group"
                      >
                        <FolderOpen className="w-5 h-5 text-[#16A36A] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#142D4E]">Choose from Demo Repair Images</span>
                        <span className="text-[10px] text-slate-500">Preloaded asphalt & paving samples</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Completion remarks */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Completion Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    placeholder="e.g. Bituminous asphalt patch compacted flush with carriageway. Quality check approved."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                  />
                </div>

                {/* Mark as Resolved button */}
                <div className="pt-2">
                  <button
                    onClick={handleResolve}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#16A36A] hover:bg-[#138a59] text-white shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>
              </div>
            )}

            {/* When already Resolved */}
            {complaint.status === 'Resolved' && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                  <span>Issue Fully Resolved &amp; Verified</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  {complaint.resolutionRemarks}
                </p>

                {complaint.repairEvidenceImage && (
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Original Issue:</span>
                      <img
                        src={complaint.imageUrl}
                        alt="Before"
                        className="w-full aspect-[4/3] rounded-lg object-cover border"
                        onError={handleImageError}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block mb-1">Repaired State:</span>
                      <img
                        src={complaint.repairEvidenceImage}
                        alt="After"
                        className="w-full aspect-[4/3] rounded-lg object-cover border-2 border-emerald-400"
                        onError={(e) => handleImageError(e, FALLBACK_REPAIR_IMAGE)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* When Rejected */}
            {complaint.status === 'Rejected' && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Rejected by Municipal Office</span>
                </div>
                <p className="text-xs text-red-700">
                  {complaint.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-xs font-bold text-[#142D4E] uppercase tracking-wider mb-3">
              Audit History Trail ({complaint.timeline.length} events)
            </h4>
            <div className="space-y-3">
              {complaint.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="w-2 h-2 rounded-full bg-[#16A36A] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.status}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{item.remarks}</p>
                    <span className="text-[10px] text-slate-400 font-medium">By: {item.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Demo Repair Images Gallery Modal */}
      <RepairImageLibraryModal
        isOpen={isRepairLibraryOpen}
        onClose={() => setIsRepairLibraryOpen(false)}
        onSelectImage={(img: DemoImage) => {
          setRepairEvidence(img.url);
          setIsRepairLibraryOpen(false);
          setErrorMsg('');
        }}
      />
    </div>
  );
};
