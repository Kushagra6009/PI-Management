import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBatchStudentsAPI } from "../api";
import {
  Users,
  Search,
  ArrowLeft,
  AlertCircle,
  FileText
} from "lucide-react";

export default function BatchStudents() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async (query = "") => {
    try {
      setLoading(true);
      const res = await getBatchStudentsAPI(id, query);
      setData(res);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load batch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(search);
  }, [id, search]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading student directory...</p>
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

      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-cyan-400" size={32} />
            Batch {data?.batch_label} Students
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Course: <span className="text-slate-200 font-semibold">{data?.course_name}</span> | Assigned Mentor:{" "}
            <span className="text-cyan-300 font-medium">{data?.mentor?.name || "Unassigned"}</span>
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-all"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                data?.students.map((student) => (
                  <tr key={student.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="px-2.5 py-1 rounded bg-dark-900 text-cyan-400 text-xs font-mono border border-slate-800">
                        {student.roll_no}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {student.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {student.contact || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/students/${student.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                      >
                        <FileText size={14} /> Profile
                      </Link>
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
