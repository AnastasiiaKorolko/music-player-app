import React, { useState, useRef, useEffect } from 'react';
import { Track } from '../types/Track';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadTrackFile, removeTrackFile } from '../api/tracksApi';
import styles from './TrackItem.module.css';
import { FaRedoAlt, FaTimes } from 'react-icons/fa';


interface TrackItemProps {
  track: Track;
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
  isPlaying: boolean;
  setPlayingTrackId: (id: string | null) => void;
  isAutoPlay: boolean;
  onEnded: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, onEdit, onDelete, isPlaying, setPlayingTrackId, isAutoPlay, onEnded }) => {
  const { title, artist, album, genres, coverImage, id, audioFile = '' } = track;
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAutoPlay && audioRef.current && audioFile) {
      audioRef.current.play()
        .catch(error => console.error('Failed to play automatically:', error))
    }
  }, [isAutoPlay, audioFile])

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadTrackFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracks']);
      setIsUploading(false);
    }
  });

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => console.log('Error playing audio', err));
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  const removeFileMutation = useMutation({
    mutationFn: () => removeTrackFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracks']);
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
    const maxSize = 15 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload MP3 or WAV files.');
      return;
    }

    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 15MB.');
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleRemoveFile = () => {
    removeFileMutation.mutate();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const defaultCoverImage = "https://via.placeholder.com/150?text=No+Image";

  return (
    <div className={`${styles.trackItem} ${isPlaying ? styles.trackItemPlaying : ''}`} data-testid={`track-item-${id}`}>
      <div className={styles.coverImage}>
        <img
          src={imageError ? defaultCoverImage : (coverImage || defaultCoverImage)}
          alt={title}
          onError={() => setImageError(true)}
        />
      </div>

      <div className={styles.trackInfo}>
        <h3 data-testid={`track-item-${id}-title`}>{title}</h3>
        <p data-testid={`track-item-${id}-artist`}>{artist}</p>
        {album && <p>{album}</p>}

        <div className={styles.genres}>
          {genres.map((genre, index) => (
            <span key={index} className={styles.genre}>{genre}</span>
          ))}
        </div>
      </div>

      <div className={styles.audioPlayer}>
        {audioFile ? (
          <div data-testid={`audio-player-${id}`}>
            <audio
              ref={audioRef}
              src={`http://localhost:8000/api/files/${audioFile}`}
              controls
              loop={isLooping}
              onEnded={onEnded}
              onPlay={() => setPlayingTrackId(id)}
              onPause={() => setPlayingTrackId(null)}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              style={{ display: 'none' }}
            />

            <div className={styles.progressContainer}>
              <span className={styles.timeText}>{formatTime(currentTime)}</span>
              <div className={styles.progressBar} onClick={handleSeek}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
              <span className={styles.timeText}>{formatTime(duration)}</span>
            </div>

            <div style={{ marginTop: '8px' }}>
              <button className={`${styles.buttonActions} ${isPlaying ? styles.playing : styles.paused}`} onClick={() => {
                if (audioRef.current?.paused) {
                  audioRef.current.play();
                } else {
                  audioRef.current.pause();
                }
              }}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={handleRemoveFile}
                className={styles.removeFileBtn}
                style={{ marginLeft: '8px' }}
              >
                <FaTimes size={15}></FaTimes>
              </button>

              <button
                onClick={() => setIsLooping(prev => !prev)}
                className={`${styles.loopButton} ${isLooping ? styles.active : ''}`}
                style={{ marginLeft: '8px' }}
              >
                <FaRedoAlt className={isLooping ? styles.activeIcon : styles.inactiveIcon}></FaRedoAlt>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.accessories}>
            <label htmlFor={`upload-${id}`} className={styles.uploadLabel}>
              <input
                id={`upload-${id}`}
                type="file"
                accept=".mp3,.wav"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <span className={styles.uploadButton}>
                {isUploading ? 'Uploading...' : 'Upload audio'}
              </span>
            </label>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button onClick={() => onEdit(track)} className={styles.editButton}>Edit</button>
        <button onClick={() => onDelete(id)} className={styles.deleteButton}>Delete</button>
      </div>
    </div>
  );
};

export default TrackItem;
