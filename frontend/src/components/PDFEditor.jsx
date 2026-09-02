import { useState, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Move } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PDFEditor({ file }) {
  const [numPages, setNumPages] = useState(null);
  
  // Hardcoded for now. Phase 7 full implementation would have draggable state here
  const [fields, setFields] = useState([
    { id: 1, type: 'name', label: '{name}', x: 300, y: 350, fontSize: 36, color: '#000000' }
  ]);

  const fileUrl = useMemo(() => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar Controls */}
      <div className="w-full md:w-64 bg-slate-900 border-r border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Available Fields</h3>
        <div className="space-y-3">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors flex items-center justify-between group">
            <span className="font-medium text-slate-300 group-hover:text-white">Student Name</span>
            <Move className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors flex items-center justify-between group opacity-50">
            <span className="font-medium text-slate-300">Course Name</span>
            <Move className="w-4 h-4 text-slate-500" />
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Font Size</label>
              <input type="number" defaultValue={36} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Color</label>
              <input type="color" defaultValue="#000000" className="w-full h-10 bg-slate-950 border border-slate-800 rounded cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Canvas Region */}
      <div className="flex-1 bg-slate-800/50 p-8 flex items-center justify-center overflow-auto relative min-h-[500px]">
        {fileUrl ? (
          <div className="relative shadow-2xl">
            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} className="rounded-lg overflow-hidden border border-slate-700">
              <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
            </Document>
            
            {/* Visual Fields Overlay */}
            {fields.map(f => (
              <div 
                key={f.id}
                className="absolute cursor-move border-2 border-dashed border-blue-500 bg-blue-500/20 px-4 py-2 rounded pointer-events-auto shadow-lg backdrop-blur-sm"
                style={{ left: f.x, top: f.y }}
              >
                <span className="font-bold text-blue-100" style={{ fontSize: `${Math.max(14, f.fontSize/2)}px` }}>
                  {f.label}
                </span>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow">
                  <Move className="w-3 h-3 text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No PDF selected</p>
        )}
      </div>
    </div>
  );
}
