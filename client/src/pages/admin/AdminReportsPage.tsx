import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminReportsPage() {
  const { showToast } = useNotifications();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await adminService.getReports();
      if (res.success) setReports(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, status) => {
    try {
      const res = await adminService.updateReportStatus(reportId, status);
      if (res.success) {
        showToast(`Report marked as ${status}`, 'success');
        fetchReports();
      }
    } catch (err) {
      showToast(err.message || 'Error updating report', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Reported Accounts & Trust Concerns
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review member complaints, safety infractions, and take disciplinary action
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Reported Account</th>
              <th className="p-4">Reported By</th>
              <th className="p-4">Reason & Description</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Loading reports...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">No reports found. The platform is healthy.</td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="p-4">
                    <strong className="text-slate-900 block">{r.reportedUser?.profile?.fullName || 'User'}</strong>
                    <span className="text-[11px] text-slate-500">{r.reportedUser?.email}</span>
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-800">{r.reporter?.profile?.fullName || 'Reporter'}</span>
                    <span className="text-[11px] text-slate-500">{r.reporter?.email}</span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <strong className="text-rose-700 block">{r.reason}</strong>
                    <p className="text-slate-600 line-clamp-2 mt-0.5">{r.description || 'No additional details.'}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'DISMISSED')}
                          className="px-3 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

