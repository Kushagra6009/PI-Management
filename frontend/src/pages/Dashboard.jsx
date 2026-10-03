import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardAPI, getMentorsAPI, updateBatchMentorAPI } from "../api";
import {
  BookOpen,
  Users,
  UserCheck,
  UserPlus,
  History,
  Eye,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [mentorsList, setMentorsList] = useState([]);
  const [newMentorId, setNewMentorId] = useState("");
  const [reason, setReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardAPI();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleOpenMentorModal = async (batch) => {
    setSelectedBatch(batch);
    setNewMentorId(batch.mentor_id ? String(batch.mentor_id) : "");
    setReason("");
    setModalError("");

    try {
      const mentors = await getMentorsAPI();
      setMentorsList(mentors);
    } catch (err) {
      setModalError("Failed to load mentors list");
    }
  };

  const handleCloseModal = () => {
    setSelectedBatch(null);
    setModalError("");
  };

  const handleMentorSubmit = async (e) => {
    e.preventDefault();
    if (!newMentorId) {
      setModalError("Please select a new mentor.");
      return;
    }
    if (!reason.trim()) {
      setModalError("Reason for mentor change is required.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      await updateBatchMentorAPI(selectedBatch.id, newMentorId, reason);
      setToastMessage(`Mentor updated successfully for Batch ${selectedBatch.label}!`);
      setTimeout(() => setToastMessage(""), 4000);
      handleCloseModal();
      loadDashboard();
    } catch (err) {
      setModalError(err.message || "Failed to update mentor.");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading course dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 shadow-lg shadow-emerald-500/10">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="text-indigo-400" size={32} />
          {data.course}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Program In-charge: <span className="text-slate-200 font-semibold">{data.pi_name}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 hover:border-slate-700 transition-all">
          <div className="w-14 h-14 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{data.totals.batches}</div>
            <div className="text-sm font-medium text-slate-400">Active Batches</div>
          </div>
        </div>

        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 hover:border-slate-700 transition-all">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{data.totals.students}</div>
            <div className="text-sm font-medium text-slate-400">Enrolled Students</div>
          </div>
        </div>

        <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 hover:border-slate-700 transition-all">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <UserCheck size={28} />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{data.totals.mentors}</div>
            <div className="text-sm font-medium text-slate-400">Assigned Mentors</div>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Course Batches Overview</h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Batch Label</th>
                <th className="px-6 py-4">Assigned Mentor</th>
                <th className="px-6 py-4">Students Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.batches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No batches found for this course.
                  </td>
                </tr>
              ) : (
                data.batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        Batch {batch.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      {batch.mentor_name ? (
                        <span className="font-medium">{batch.mentor_name}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Users size={14} /> {batch.student_count} Students
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/batches/${batch.id}/students`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <Eye size={14} /> View Students
                        </Link>

                        <button
                          onClick={() => handleOpenMentorModal(batch)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                        >
                          <UserPlus size={14} /> Change Mentor
                        </button>

                        <Link
                          to={`/batches/${batch.id}/mentor-history`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <History size={14} /> History
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mentor Reassignment Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Change Mentor for Batch {selectedBatch.label}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleMentorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Replacement Mentor
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  value={newMentorId}
                  onChange={(e) => setNewMentorId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Mentor --</option>
                  {mentorsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email || "No email"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Reason for Reassignment *
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Faculty workload adjustment for upcoming term..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                >
                  {modalLoading ? <div className="spinner" /> : "Confirm Mentor Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
