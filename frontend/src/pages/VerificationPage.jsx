import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { API_URL } from '../api/client';

export default function VerificationPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await axios.get(`${API_URL}/verify/${id}`);
        setData(res.data);
      } catch (err) {
        setError("Certificate not found or invalid.");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Verifying Certificate...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20 ${error ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {error ? (
            <>
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Invalid Certificate</h1>
              <p className="text-slate-400 mb-8">{error}</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Verified Authentic</h1>
              <p className="text-slate-400 mb-8">This certificate is cryptographically verified and officially issued by our platform.</p>
              
              <div className="w-full bg-slate-950 rounded-2xl p-6 text-left space-y-4 border border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Recipient Name</p>
                  <p className="text-lg font-medium text-slate-200">{data.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Recipient Email</p>
                  <p className="text-lg font-medium text-slate-200">{data.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Issue Date</p>
                  <p className="text-lg font-medium text-slate-200">
                    {data.issued_at ? new Date(data.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </>
          )}

          <Link to="/" className="mt-8 text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
