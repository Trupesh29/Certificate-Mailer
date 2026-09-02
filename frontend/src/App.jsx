import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewBatch from './pages/NewBatch';
import VerificationPage from './pages/VerificationPage';
import { Mail, LayoutDashboard, PlusCircle } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">CertiMail</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all group">
              <LayoutDashboard className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/new" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all group">
              <PlusCircle className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium">New Batch</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
          <div className="p-8 max-w-7xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NewBatch />} />
              <Route path="/verify/:id" element={<VerificationPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
