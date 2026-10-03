import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudentProfileAPI } from "../api";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  UserCheck,
  Award,
  AlertCircle
} from "lucide-react";

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getStudentProfileAPI(id);
        setStudent(data);
      } catch (err) {
        setError(err.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-xl mx-auto my-8 space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error || "Student profile not found."}</span>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to={`/batches/${student.batch_id}/students`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
        >
          <ArrowLeft size={15} /> Back to Batch Students
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-dark-800 to-cyan-900/40 p-8 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
            <User size={48} />
          </div>

          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
              Roll No: {student.roll_no}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {student.name}
            </h1>
            <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              {student.course_name}
            </p>
          </div>
        </div>

        {/* Profile Grid Details */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal & Contact Details */}
          <div className="bg-dark-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Personal & Contact Information
            </h3>

            <div className="flex items-center gap-3.5 text-sm text-slate-300">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Email Address</div>
                <div className="font-medium text-white">{student.email || "Not Provided"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-sm text-slate-300">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Contact Number</div>
                <div className="font-medium text-white">{student.contact || "Not Provided"}</div>
              </div>
            </div>
          </div>

          {/* Academic & Mentor Details */}
          <div className="bg-dark-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Academic & Mentor Allocation
            </h3>

            <div className="flex items-center gap-3.5 text-sm text-slate-300">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Award size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Assigned Batch</div>
                <div className="font-medium text-white">Batch {student.batch_label}</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-sm text-slate-300">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Current Mentor</div>
                <div className="font-medium text-white">
                  {student.mentor_name || <span className="text-slate-500 italic">Unassigned</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
