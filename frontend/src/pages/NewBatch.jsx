import { useState, useEffect } from 'react';
import { UploadCloud, File, FileSpreadsheet, ArrowRight, Loader2, Play, RefreshCw, Mail } from 'lucide-react';
import api, { API_URL } from '../api/client';
import PDFEditor from '../components/PDFEditor';

export default function NewBatch() {
  const [step, setStep] = useState(1);
  const [templateFile, setTemplateFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Data from backend
  const [templateId, setTemplateId] = useState(null);
  const [batchData, setBatchData] = useState(null);
  
  // Dashboard / SSE state
  const [jobStarted, setJobStarted] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Your Certificate is Ready!');
  const [emailBody, setEmailBody] = useState('Hi {name},\n\nPlease find your generated certificate attached.\n\nBest,\nAdmin Team');
  const [liveStats, setLiveStats] = useState({ sent: 0, failed: 0, pending: 0, total: 0, status: 'pending' });

  useEffect(() => {
    if (jobStarted && batchData?.batch_id) {
      const source = new EventSource(`${API_URL}/batches/${batchData.batch_id}/events`);
      
      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          source.close();
          return;
        }
        setLiveStats(data);
        if (data.status === 'completed') {
          source.close();
        }
      };

      return () => source.close();
    }
  }, [jobStarted, batchData?.batch_id]);

  const handleUploads = async () => {
    if (!templateFile || !csvFile) return;
    setLoading(true);
    
    try {
      // 1. Upload Template
      const templateRes = await api.uploadTemplate(templateFile);
      setTemplateId(templateRes.template_id);
      
      // 2. Upload CSV & Create Batch
      const batchRes = await api.createBatch(templateRes.template_id, csvFile);
      setBatchData(batchRes);
      
      setStep(2);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process files. Ensure your CSV has 'name' and 'email' columns.");
    } finally {
      setLoading(false);
    }
  };

  const startSending = async () => {
    if (!batchData?.batch_id) return;
    setLoading(true);
    try {
      await api.sendBatch(batchData.batch_id);
      setJobStarted(true);
    } catch (error) {
      console.error("Failed to start send job", error);
      alert("Failed to start batch processing.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!batchData?.batch_id) return;
    try {
      await api.retryFailedBatch(batchData.batch_id);
    } catch (error) {
      alert("Failed to retry.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-white">Create New Batch</h1>
        <p className="text-slate-400 mt-2">Upload your template and student list to begin.</p>
      </header>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600/20 border border-blue-500' : 'bg-slate-800'}`}>1</div>
          Upload Files
        </div>
        <div className={`flex-1 h-px ${step >= 2 ? 'bg-blue-500/50' : 'bg-slate-800'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600/20 border border-blue-500' : 'bg-slate-800'}`}>2</div>
          Visual Map
        </div>
        <div className={`flex-1 h-px ${step >= 3 ? 'bg-blue-500/50' : 'bg-slate-800'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600/20 border border-blue-500' : 'bg-slate-800'}`}>3</div>
          Dispatch
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* PDF Upload */}
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-all group">
            <input type="file" id="pdf-upload" accept=".pdf" className="hidden" onChange={(e) => setTemplateFile(e.target.files[0])} />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <File className={`w-8 h-8 ${templateFile ? 'text-blue-400' : 'text-slate-400'}`} />
              </div>
              <h3 className="text-lg font-bold text-white">{templateFile ? templateFile.name : 'Upload PDF Template'}</h3>
              <p className="text-slate-400 text-sm mt-2">Click to select or drag and drop.</p>
            </label>
          </div>

          {/* CSV Upload */}
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition-all group">
            <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={(e) => setCsvFile(e.target.files[0])} />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className={`w-8 h-8 ${csvFile ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <h3 className="text-lg font-bold text-white">{csvFile ? csvFile.name : 'Upload Student CSV'}</h3>
              <p className="text-slate-400 text-sm mt-2">Must contain 'name' and 'email' columns.</p>
            </label>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
            <button 
              onClick={handleUploads}
              disabled={!templateFile || !csvFile || loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Mapping'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Data Validation</h2>
              <p className="text-slate-400 mt-1">We parsed your CSV. Here are the results.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg text-emerald-400 font-bold">
                {batchData.valid_rows} Valid Rows
              </div>
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-red-400 font-bold">
                {batchData.invalid_rows} Invalid Rows
              </div>
            </div>
          </div>

          {/* Render PDF Editor */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden">
            {templateFile && <PDFEditor file={templateFile} />}
          </div>

          <div className="flex justify-end mt-4">
            <button 
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              Continue to Dispatch <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Email Composer */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" /> Email Template
            </h2>
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-1 block">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  disabled={jobStarted}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
                />
              </div>
              <div className="flex-1 flex flex-col h-full min-h-[250px]">
                <label className="text-sm font-medium text-slate-400 mb-1 block">Body</label>
                <textarea 
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  disabled={jobStarted}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors resize-none disabled:opacity-50"
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">Use {'{name}'} or {'{email}'} as variables.</p>
              </div>
            </div>
          </div>

          {/* Live Dashboard */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Dispatch Center</h2>
            
            {!jobStarted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-700 rounded-xl">
                <UploadCloud className="w-16 h-16 text-slate-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Ready to Send</h3>
                <p className="text-slate-400 mb-6">You are about to generate and email {batchData?.valid_rows} certificates.</p>
                <button 
                  onClick={startSending}
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 text-lg w-full justify-center"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                  {loading ? 'Starting...' : 'Send Bulk Mail'}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    {liveStats.status === 'processing' && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                    {liveStats.status === 'completed' && <div className="w-6 h-6 bg-emerald-500 rounded-full" />}
                    <span className="text-xl font-bold text-white capitalize">{liveStats.status}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-300">
                    {liveStats.sent + liveStats.failed} / {batchData?.valid_rows}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-8 flex">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(liveStats.sent / batchData?.valid_rows) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(liveStats.failed / batchData?.valid_rows) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Successfully Sent</p>
                    <p className="text-3xl font-bold text-emerald-400">{liveStats.sent}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm mb-1">Failed</p>
                    <p className="text-3xl font-bold text-red-400">{liveStats.failed}</p>
                  </div>
                </div>

                {liveStats.failed > 0 && liveStats.status === 'completed' && (
                  <button 
                    onClick={handleRetry}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold transition-all"
                  >
                    <RefreshCw className="w-5 h-5" /> Retry {liveStats.failed} Failed Emails
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
