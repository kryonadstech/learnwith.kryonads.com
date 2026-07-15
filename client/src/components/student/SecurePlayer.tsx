import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

interface SecurePlayerProps {
  mediaUrl: string;
  mediaType: 'video' | 'audio' | 'notes';
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
      className="relative rounded-lg overflow-hidden glass-panel select-none"
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
        <div className="p-8 flex justify-center">
          <audio 
            src={objectUrl!} 
            controls 
            controlsList="nodownload" 
            className="w-full max-w-md"
          />
        </div>
      )}
      
      {mediaType === 'notes' && (
        <iframe 
          src={`${objectUrl}#toolbar=0`} 
          className="w-full h-[70vh] border-none"
          title="Secure PDF Viewer"
        />
      )}
    </div>
  );
}
