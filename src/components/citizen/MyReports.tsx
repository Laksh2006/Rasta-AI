import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  ChevronRight,
  Inbox,
  AlertTriangle,
  Layers,
  Droplets,
  ShieldAlert
} from 'lucide-react';
import { Complaint, ComplaintStatus, IssueCategory } from '../../types';
import { handleImageError } from '../../data/demoImages';

interface MyReportsProps {
  complaints: Complaint[];
  currentUserId: string;
  onSelectComplaint: (id: string) => void;
  onNewReport: () => void;
}

export const MyReports: React.FC<MyReportsProps> = ({
  complaints,
  currentUserId,
  onSelectComplaint,
  onNewReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | IssueCategory>('All');

  // Filter complaints by current citizen and query criteria
  const userReports = complaints.filter(c => {
    // Show citizen's reports (or all reports in demo mode if fewer than 2)
    const matchesUser = c.citizenId === currentUserId || c.citizenEmail === 'citizen@raastaai.demo';
    if (!matchesUser && currentUserId === 'cit-001') return false;

    // Search query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.id.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.location.address.toLowerCase().includes(query) ||
      c.location.area.toLowerCase().includes(query);

    // Status filter
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    // Category filter
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case 'Pothole':
        return <Layers className="w-3.5 h-3.5 text-amber-500" />;
      case 'Waterlogging':
        return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'Damaged Road':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
            My Reported Road Issues
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all complaints you have registered with municipal road authorities.
          </p>
        </div>
        <button
          onClick={onNewReport}
          className="px-5 py-3 rounded-xl bg-[#142D4E] hover:bg-[#0f233d] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#16A36A]" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by ID, location, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#142D4E]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Status:</span>
            {(['All', 'Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  statusFilter === st
                    ? 'bg-[#142D4E] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-400">Category:</span>
          {(['All', 'Pothole', 'Waterlogging', 'Damaged Road'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {userReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userReports.map(report => {
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
                onClick={() => onSelectComplaint(report.id)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={report.imageUrl}
                      alt={report.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-sm">
                        {report.id}
                      </span>
                    </div>
                    <span className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBg} shadow-sm`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                      {getCategoryIcon(report.category)}
                      <span>{report.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className={`text-[10px] font-bold ${
                        report.severity === 'High' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {report.severity} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{report.location.area || report.location.address}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-[#142D4E] group-hover:text-[#16A36A] flex items-center gap-1 transition-colors">
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#142D4E]">No Reports Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            No road complaints match your selected filters. File a new report to help fix local roads.
          </p>
          <button
            onClick={onNewReport}
            className="px-5 py-2.5 rounded-xl bg-[#142D4E] text-white text-xs font-bold hover:bg-[#0f233d] transition-colors"
          >
            Submit First Complaint
          </button>
        </div>
      )}
    </div>
  );
};
