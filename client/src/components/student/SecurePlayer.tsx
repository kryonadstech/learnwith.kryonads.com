import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use a reliable CDN for the worker to avoid bundler issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePlayerProps {
  mediaUrl: string;
  mediaType: 'video' | 'audio' | 'notes';
}

function PdfViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Set width slightly less than container to ensure it fits with padding
        setContainerWidth(entries[0].contentRect.width - 16);
      }
    });
    
    observer.observe(observeTarget);
    return () => {
      observer.disconnect();
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setLoadError(error);
  }

  return (
    <div className="flex flex-col items-center w-full pb-4" ref={containerRef}>
      <div className="w-full flex justify-center">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="flex justify-center rounded-md overflow-hidden bg-white shadow-sm"
          loading={<div className="p-12 text-secondary text-center">Loading PDF...</div>}
          error={<div className="p-12 text-[var(--error)] text-center">Failed to load PDF: {loadError?.message || "Unknown error"}</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={containerWidth ? Math.min(containerWidth, 900) : undefined}
            className="max-w-full"
          />
        </Document>
      </div>
      
      {numPages > 0 && (
        <div className="flex items-center gap-6 mt-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-[var(--sd-text)]">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-semibold tracking-wide min-w-[100px] text-center">
            Page {pageNumber} of {numPages}
          </span>
          
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SecurePlayer({ mediaUrl, mediaType }: SecurePlayerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Implement protection measures
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+S, etc.
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
        (e.metaKey && (e.key === 's' || e.key === 'u' || e.key === 'p'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Load media securely using Blob URL
    const loadMedia = async () => {
      setLoading(true);
      setError('');
      try {
        // We fetch the media as a blob using the auth token in headers
        // This ensures the URL cannot just be copied and pasted elsewhere
        const response = await api.get(mediaUrl, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { 
          type: mediaType === 'video' ? 'video/mp4' : mediaType === 'audio' ? 'audio/mpeg' : 'application/pdf' 
        });
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } catch (err) {
        console.error("Failed to load secure media", err);
        setError("Failed to load media securely.");
      } finally {
        setLoading(false);
      }
    };

    loadMedia();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaUrl, mediaType]);

  if (loading) return <div className="h-64 flex items-center justify-center glass-panel animate-pulse text-secondary">Loading secure media...</div>;
  if (error) return <div className="p-4 bg-[var(--error)] bg-opacity-20 text-[var(--error)] rounded-lg">{error}</div>;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden select-none ${mediaType === 'video' ? 'bg-black shadow-xl' : 'bg-transparent'}`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Overlay to catch right clicks even if video controls are shown, though controlsList helps */}
      {mediaType === 'video' && (
        <video 
          src={objectUrl!} 
          controls 
          controlsList="nodownload noremoteplayback" 
          disablePictureInPicture
          className="w-full h-auto max-h-[70vh] object-contain"
        />
      )}
      
      {mediaType === 'audio' && (
        <div className="p-8 flex justify-center bg-[var(--sd-glass)] rounded-2xl border border-[var(--sd-glass-border)] shadow-sm">
          <audio 
            src={objectUrl!} 
            controls 
            controlsList="nodownload" 
            className="w-full max-w-md"
          />
        </div>
      )}
      
      {mediaType === 'notes' && (
        <PdfViewer file={objectUrl!} />
      )}
    </div>
  );
}
