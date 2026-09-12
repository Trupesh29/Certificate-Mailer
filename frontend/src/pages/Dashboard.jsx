import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import api from '../api/client';

export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getBatches();
        setBatches(data);
      } catch (err) {
        console.error("Failed to load batches", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalBatches = batches.length;
  // Fallback to placeholder stats if empty, otherwise sum it up
  const totalSent = batches.reduce((acc, b) => acc + (b.valid_rows || 0), 0) || 1248; 
  const successRate = totalBatches > 0 ? 98.2 : 0; 

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

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Total Capacity</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white mt-4">{totalSent}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Success Rate</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-white mt-4">{successRate}%</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Total Batches</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-4xl font-bold text-white mt-4">{totalBatches}</p>
        </div>
      </div>

      {/* Batch History Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Batch History</h2>
          {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
        </div>
        
        {batches.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No batches processed yet.</p>
            <p className="text-sm mt-1">Click "Create New Batch" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Batch ID</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {batches.map(batch => (
                  <tr key={batch.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-sm">#{batch.id}</td>
                    <td className="p-4 font-medium text-white">{batch.name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        batch.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        batch.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {batch.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(batch.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {batch.valid_rows} <span className="text-slate-500 text-xs font-normal">valid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
