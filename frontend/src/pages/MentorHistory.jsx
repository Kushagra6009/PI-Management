import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBatchMentorHistoryAPI } from "../api";
import {
  History,
  ArrowLeft,
  Calendar,
  User,
  AlertCircle,
  Clock
} from "lucide-react";

export default function MentorHistory() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [batchLabel, setBatchLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getBatchMentorHistoryAPI(id);
        setHistory(data);
        if (data.length > 0) {
          setBatchLabel(data[0].batch_label);
        }
      } catch (err) {
        setError(err.message || "Failed to load mentor history log");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading mentor assignment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-8 space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-slate-800 text-slate-300 text-sm border border-slate-700 transition-all"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <History className="text-indigo-400" size={32} />
          Mentor Assignment History
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Batch: <span className="text-indigo-300 font-semibold">{batchLabel || `ID: ${id}`}</span> (Chronological order, newest first)
        </p>
      </div>

      {/* History Table */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Previous Mentor</th>
                <th className="px-6 py-4">New Mentor</th>
                <th className="px-6 py-4">Reason for Reassignment</th>
                <th className="px-6 py-4">Changed By (PI)</th>
                <th className="px-6 py-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No mentor reassignment history recorded for this batch yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">
                      {item.old_mentor_name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      {item.new_mentor_name}
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-900 text-slate-300 text-xs border border-slate-800">
                        <User size={13} className="text-indigo-400" />
                        {item.changed_by_pi_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-500" />
                        {new Date(item.changed_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
