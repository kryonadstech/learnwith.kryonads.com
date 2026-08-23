interface SecurePlayerProps {
  embedUrl: string;
  legacyMediaUrl: string;
  mediaType: 'video' | 'audio' | 'notes';
}

export default function SecurePlayer({ embedUrl, legacyMediaUrl, mediaType }: SecurePlayerProps) {
  const playerClassName = `sd-media-player sd-media-player--${mediaType}`;

  if (!embedUrl && !legacyMediaUrl) {
    return (
      <div className="sd-media-unavailable">
        This resource is not available yet. Please contact your instructor.
      </div>
    );
  }

  // A media record can retain its old uploaded file after it has been moved
  // to Drive. Prefer the Drive preview whenever it exists; the local file is
  // only a compatibility fallback for content that has not been migrated.
  if (embedUrl) {
    return (
      <div className={playerClassName}>
        <iframe
          src={embedUrl}
          title={`${mediaType} player`}
          allow="autoplay"
          allowFullScreen
        />
      </div>
    );
  }

  if (mediaType === 'video') {
    return (
      <div className={playerClassName}>
        <video src={legacyMediaUrl} controls className="sd-native-video" />
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <div className={playerClassName}>
        <audio src={legacyMediaUrl} controls className="sd-native-audio" />
      </div>
    );
  }

  return (
    <div className={playerClassName}>
      <iframe src={legacyMediaUrl} title="Lesson notes" allowFullScreen />
    </div>
  );
}
