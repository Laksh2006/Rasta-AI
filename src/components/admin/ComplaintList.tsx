import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Complaint, ComplaintStatus, IssueCategory, IssueSeverity } from '../../types';
import { handleImageError } from '../../data/demoImages';

interface ComplaintListProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  initialStatusFilter?: ComplaintStatus | 'All';
  title?: string;
  subtitle?: string;
}

export const ComplaintList: React.FC<ComplaintListProps> = ({
  complaints,
  onSelectComplaint,
  initialStatusFilter = 'All',
  title = 'All Municipal Complaints',
  subtitle = 'Review incoming citizen reports, verify jurisdiction, assign repair teams and monitor work orders.'
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'All'>('All');

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location.address.toLowerCase().includes(q) ||
      c.location.area.toLowerCase().includes(q) ||
      c.citizenName.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchSeverity = severityFilter === 'All' || c.severity === severityFilter;

    return matchSearch && matchStatus && matchCategory && matchSeverity;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    const styles: Record<ComplaintStatus, string> = {
      Submitted: 'bg-orange-100 text-orange-800 border-orange-200',
      Verified: 'bg-blue-100 text-blue-800 border-blue-200',
      Assigned: 'bg-purple-100 text-purple-800 border-purple-200',
      'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
      Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Rejected: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    return (
      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#142D4E]">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm shrink-0">
          Showing <strong className="text-[#142D4E]">{filtered.length}</strong> of {complaints.length} records
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, address, or citizen name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#142D4E]"
            />
          </div>

          {/* Status select */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter complaints by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#142D4E]"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Pending Verification (Submitted)</option>
              <option value="Verified">Verified Reports</option>
              <option value="Assigned">Assigned Reports</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Category select */}
            <select
              aria-label="Filter complaints by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#142D4E]"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Potholes</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Damaged Road">Damaged Roads</option>
            </select>

            {/* Severity select */}
            <select
              aria-label="Filter complaints by priority severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#142D4E]"
            >
              <option value="All">All Severity</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Visual Evidence</th>
                <th className="py-3.5 px-4">Category &amp; Description</th>
                <th className="py-3.5 px-4">Location / Zone</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map(complaint => (
                <tr
                  key={complaint.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#142D4E] whitespace-nowrap">
                    {complaint.id}
                  </td>

                  {/* Image Thumbnail */}
                  <td className="py-3.5 px-4">
                    <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={complaint.imageUrl}
                        alt={complaint.id}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={handleImageError}
                      />
                    </div>
                  </td>

                  {/* Category & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900">{complaint.category}</div>
                    <div className="text-slate-500 truncate text-[11px] mt-0.5 max-w-[260px]">
                      {complaint.description}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{complaint.location.area}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {complaint.location.lat.toFixed(3)}, {complaint.location.lng.toFixed(3)}
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${complaint.severity === 'High'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : complaint.severity === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {complaint.severity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(complaint.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectComplaint(complaint)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#142D4E] hover:bg-[#0f233d] text-white shadow-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No municipal complaint records found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
