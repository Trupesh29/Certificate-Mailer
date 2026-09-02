import { Link } from 'react-router-dom';
import { PlusCircle, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">Dashboard</h1>
          <p className="text-slate-400 mt-2">Overview of your certificate mailing batches.</p>
        </div>
        <Link to="/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <PlusCircle className="w-5 h-5" />
          Create New Batch
        </Link>
      </header>

      {/* Stats row - placeholder data for now */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Total Sent</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white mt-4">1,248</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Success Rate</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-white mt-4">98.2%</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Recent Batches</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-4xl font-bold text-white mt-4">12</p>
        </div>
      </div>

      {/* Placeholder table for recent batches */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="p-12 text-center text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No batches processed yet.</p>
          <p className="text-sm mt-1">Click "Create New Batch" to get started.</p>
        </div>
      </div>
    </div>
  );
}
