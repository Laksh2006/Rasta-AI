import React from 'react';
import {
  PlusCircle,
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Map as MapIcon,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Complaint, User } from '../../types';
import { handleImageError } from '../../data/demoImages';

interface CitizenDashboardProps {
  user: User;
  complaints: Complaint[];
  onOpenReportForm: () => void;
  onOpenTracker: (id?: string) => void;
  onOpenMyReports: () => void;
  onOpenRoadMap: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  complaints,
  onOpenReportForm,
  onOpenTracker,
  onOpenMyReports,
  onOpenRoadMap
}) => {
  // Citizen's recent complaints
  const myComplaints = complaints.filter(
    c => c.citizenId === user.id || c.citizenEmail === user.email || c.citizenEmail === 'citizen@raastaai.demo'
  );
  const recentReports = myComplaints.slice(0, 4);

  // Quick Stats
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;
  const inProgressCount = myComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-fade-in space-y-8">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#142D4E] via-[#1a3860] to-[#0d1f36] text-white p-7 sm:p-10 shadow-xl">
        {/* Decorative background grid & subtle glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#16A36A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-6 opacity-10 hidden md:block">
          <svg width="220" height="180" viewBox="0 0 200 160" fill="none" stroke="currentColor">
            <path d="M20 140L70 20H130L180 140" strokeWidth="6" />
            <line x1="100" y1="35" x2="100" y2="60" strokeWidth="6" strokeDasharray="10 10" />
            <line x1="100" y1="80" x2="100" y2="120" strokeWidth="6" strokeDasharray="10 10" />
          </svg>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>Civic Action • Empowered Citizen</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Let's make our roads safer.
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Report road problems and help improve your community. Your contributions get instantly routed to municipal repair engineers with real-time tracking.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportForm}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#16A36A] hover:bg-[#138a59] text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 group"
            >
              <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>Report an Issue</span>
            </button>

            <button
              onClick={() => onOpenTracker('RA-2026-001')}
              className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-300" />
              <span>Track Complaint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Track Complaint */}
        <div
          onClick={() => onOpenTracker(recentReports[0]?.id || 'RA-2026-001')}
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#142D4E] group-hover:text-blue-600 transition-colors">
              Track Complaint
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Look up live status & municipal audit timeline by ID.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Card 2: Nearby Issues Map */}
        <div
          onClick={onOpenRoadMap}
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MapIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#142D4E] group-hover:text-[#16A36A] transition-colors">
              Nearby Issues
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore interactive map of community hazards & repairs.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Card 3: My Reports */}
        <div
          onClick={onOpenMyReports}
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#142D4E] group-hover:text-purple-600 transition-colors">
              My Reports
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {myComplaints.length} registered reports ({resolvedCount} resolved).
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* RECENT REPORTS SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#142D4E]">
              Recent Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your latest submitted road problems and their current municipal status.
            </p>
          </div>
          <button
            onClick={onOpenMyReports}
            className="text-xs font-bold text-[#142D4E] hover:text-[#16A36A] transition-colors flex items-center gap-1"
          >
            <span>View All ({myComplaints.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReports.map(report => {
              const statusBg =
                report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                  report.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                    report.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                      report.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800';

              return (
                <div
                  key={report.id}
                  onClick={() => onOpenTracker(report.id)}
                  className="group p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex gap-4 bg-slate-50/50 hover:bg-white"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                    <img
                      src={report.imageUrl}
                      alt={report.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-black/70 text-white rounded">
                      {report.id}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#142D4E] truncate">
                          {report.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusBg}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{report.location.area}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0 font-medium text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs">You have not submitted any road complaints yet.</p>
            <button
              onClick={onOpenReportForm}
              className="mt-3 px-4 py-2 rounded-xl bg-[#142D4E] text-white text-xs font-semibold hover:bg-[#0f233d]"
            >
              Report Your First Issue
            </button>
          </div>
        )}
      </div>

      {/* Citizen Impact Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16A36A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#142D4E]">
              Civic Watcher Level 2 Badge Active
            </div>
            <div className="text-slate-600 mt-0.5">
              You have helped report <strong>{myComplaints.length} road hazards</strong> in your neighborhood.
            </div>
          </div>
        </div>
        <button
          onClick={onOpenRoadMap}
          className="px-4 py-2 rounded-xl bg-white text-[#142D4E] border border-slate-200 font-bold hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
        >
          Explore Community Map
        </button>
      </div>
    </div>
  );
};
