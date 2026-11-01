import React from 'react';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Eye,
  ShieldAlert,
  Layers,
  Droplets,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Complaint, ComplaintStatus } from '../../types';
import { handleImageError } from '../../data/demoImages';
import { LeafletMap } from '../common/LeafletMap';

interface AdminDashboardProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToView: (view: string) => void;
}

const CATEGORY_COLORS = {
  Pothole: '#F59E0B',      // Amber
  Waterlogging: '#3B82F6', // Blue
  'Damaged Road': '#EF4444' // Red
};

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#EA580C',
  Verified: '#2563EB',
  Assigned: '#9333EA',
  'In Progress': '#CA8A04',
  Resolved: '#16A36A',
  Rejected: '#64748B'
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateToView
}) => {
  // DYNAMIC CALCULATION OF KPI METRICS
  // We compute dynamic offset based on initial demo seed: 128 total base + added complaints
  const actualSubmittedCount = complaints.filter(c => c.status === 'Submitted').length;
  const actualInProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const actualResolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Base metrics from prompt (128, 24, 36, 68), scaled with user actions
  const totalReportsCount = 122 + complaints.length;
  const pendingVerificationCount = 23 + actualSubmittedCount;
  const inProgressCount = 33 + actualInProgressCount;
  const resolvedCount = 67 + actualResolvedCount;

  // Category chart data
  const potholeCount = complaints.filter(c => c.category === 'Pothole').length;
  const waterloggingCount = complaints.filter(c => c.category === 'Waterlogging').length;
  const damagedRoadCount = complaints.filter(c => c.category === 'Damaged Road').length;

  const categoryChartData = [
    { name: 'Potholes', count: 58 + potholeCount, fill: '#F59E0B' },
    { name: 'Waterlogging', count: 39 + waterloggingCount, fill: '#3B82F6' },
    { name: 'Damaged Roads', count: 31 + damagedRoadCount, fill: '#EF4444' }
  ];

  // Status breakdown data
  const statusCounts: Record<string, number> = {};
  complaints.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const statusChartData = [
    { name: 'Submitted', value: 23 + (statusCounts['Submitted'] || 0) },
    { name: 'Verified', value: 16 + (statusCounts['Verified'] || 0) },
    { name: 'Assigned', value: 18 + (statusCounts['Assigned'] || 0) },
    { name: 'In Progress', value: 15 + (statusCounts['In Progress'] || 0) },
    { name: 'Resolved', value: 67 + (statusCounts['Resolved'] || 0) },
    { name: 'Rejected', value: 7 + (statusCounts['Rejected'] || 0) }
  ];

  // High Priority Unresolved Reports
  const highPriorityReports = complaints.filter(
    c => c.severity === 'High' && c.status !== 'Resolved' && c.status !== 'Rejected'
  );

  // Recent Complaints
  const recentComplaints = complaints.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#16A36A]">
            <span>Municipal Operations Control Room</span>
            <span>•</span>
            <span>Live Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#142D4E] mt-1">
            Executive Road Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time citizen reporting triage, repair crew assignments, and urban infrastructure health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToView('map')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#142D4E] border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
          >
            Open Live GIS Map
          </button>
          <button
            onClick={() => onNavigateToView('pending')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#142D4E] text-white hover:bg-[#0f233d] shadow-sm transition-colors"
          >
            Review Pending ({actualSubmittedCount})
          </button>
        </div>
      </div>

      {/* 4 DYNAMIC KPI CARDS (Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Reports */}
        <div
          onClick={() => onNavigateToView('all')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Reports
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#142D4E] mt-3">
            {totalReportsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12%
            </span>
            <span>vs previous month</span>
          </div>
        </div>

        {/* KPI 2: Pending Verification */}
        <div
          onClick={() => onNavigateToView('pending')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Verification
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#142D4E] mt-3">
            {pendingVerificationCount}
          </div>
          <div className="text-xs text-orange-600 mt-1 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Requires administrative review</span>
          </div>
        </div>

        {/* KPI 3: In Progress */}
        <div
          onClick={() => onNavigateToView('in-progress')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#142D4E] mt-3">
            {inProgressCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            4 repair teams active on field
          </div>
        </div>

        {/* KPI 4: Resolved */}
        <div
          onClick={() => onNavigateToView('resolved')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resolved
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#142D4E] mt-3">
            {resolvedCount}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">
            53.1% resolution completion rate
          </div>
        </div>
      </div>

      {/* CHARTS ROW (Recharts: Category & Status Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-[#142D4E] text-base">
                Complaints by Category
              </h2>
              <p className="text-xs text-slate-400">
                Breakdown of verified infrastructure defects across municipal wards
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#142D4E', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(20, 45, 78, 0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-[#142D4E] text-base">
                Complaint Status Distribution
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end operational pipeline stages
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#142D4E', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* HIGH PRIORITY REPORTS ROW */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#142D4E] text-base">
                High-Priority Reports Requiring Immediate Action
              </h2>
              <p className="text-xs text-slate-400">
                Unresolved severe road hazards posing significant accident risks
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
            {highPriorityReports.length} Critical
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highPriorityReports.map(report => (
            <div
              key={report.id}
              onClick={() => onSelectComplaint(report)}
              className="p-4 rounded-xl border border-red-200/80 bg-red-50/30 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-red-900">
                    {report.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-200 text-red-800">
                    {report.status}
                  </span>
                </div>
                <div className="font-bold text-xs text-[#142D4E]">
                  {report.category}
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {report.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-red-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{report.location.area}</span>
                <span className="font-bold text-red-700 group-hover:underline flex items-center gap-0.5">
                  Action <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT COMPLAINTS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-[#142D4E] text-base">
              Recent Complaints
            </h2>
            <p className="text-xs text-slate-400">
              Latest citizen filings across municipal wards
            </p>
          </div>
          <button
            onClick={() => onNavigateToView('all')}
            className="text-xs font-bold text-[#142D4E] hover:text-[#16A36A] transition-colors flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentComplaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#142D4E]">
                    {complaint.id}
                  </td>
                  <td className="py-3 px-4">
                    <img
                      src={complaint.imageUrl}
                      alt={complaint.id}
                      className="w-10 h-8 rounded object-cover border border-slate-200"
                      onError={handleImageError}
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {complaint.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                    {complaint.location.area}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectComplaint(complaint)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#142D4E] hover:text-white transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROAD ISSUES MAP (Section 8 item 5) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-[#142D4E] text-base">
              Municipal Road Issues Map
            </h2>
            <p className="text-xs text-slate-400">
              Interactive Leaflet GIS map with color-coded markers for incident severity and statuses
            </p>
          </div>
          <button
            onClick={() => onNavigateToView('map')}
            className="text-xs font-bold text-[#142D4E] hover:text-[#16A36A] flex items-center gap-1"
          >
            <span>Full Map View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <LeafletMap
          complaints={complaints}
          onSelectComplaint={onSelectComplaint}
          height="340px"
          showFilters={true}
        />
      </div>
    </div>
  );
};
