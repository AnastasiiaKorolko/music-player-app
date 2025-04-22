import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Track } from '../types/Track';
import TrackItem from '../components/TrackItem';
import TrackFilter from '../components/TrackFilter';
import { getTracks } from '../api/tracksApi';
import styles from './TracksPage.module.css';
import { MdAllInclusive } from 'react-icons/md';

interface TracksPageProps {
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
}

const TracksPage: React.FC<TracksPageProps> = ({ onEdit, onDelete }) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('title');
  const [filter, setFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [isActive, setIsActive] = useState(false)

  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)


  const { data, isLoading, isError } = useQuery({
    queryKey: ['tracks', page, sortBy, filter, genreFilter, artistFilter],
    queryFn: () => getTracks(
      String(page), 
      sortBy, 
      filter,
      artistFilter,
      genreFilter,
      10
    )
  });

  const tracks = data?.data?.data || [];
const totalPages = data?.data?.meta?.totalPages || 0;

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const filterTracks = (tracks: any) => {
    if (!Array.isArray(tracks)) {
      console.log('Expected tracks to be an array, but got:', tracks);
      return [];
    }
    return tracks.filter(track => {
      const matchesTitle = track.title.toLowerCase().includes(filter.toLowerCase());
      const matchesArtist = track.artist.toLowerCase().includes(artistFilter.toLowerCase());
      const matchesGenre = track.genres.some(genre => 
        genre.toLowerCase().includes(genreFilter.toLowerCase())
      );
  
      return matchesTitle && matchesArtist && matchesGenre;
    });
  };
  
  const filteredTracks = filterTracks(tracks);

  const handlePlayAll = () => {
    if (isAutoPlay) {
      setIsAutoPlay(false);
      setIsActive(false)
    } else if  (filteredTracks.length > 0) {
      setIsAutoPlay(true);
      setPlayingIndex(0);
      setPlayingTrackId(filteredTracks[0].id);
      setIsActive(true);
    }
  };

  return (
    <div className={styles.tracksPageContainer}>
      <h1 data-testid="tracks-header">Music Track Manager</h1>

      <TrackFilter 
        onSearch={setFilter}
        onGenreFilter={setGenreFilter}
        onArtistFilter={setArtistFilter}
        onSort={setSortBy}
      />

      <button 
        className={`${styles.playAllButton} ${isActive ? styles.allButtonActive : ''}`}
        onClick={handlePlayAll}>
          <MdAllInclusive size={20} />
          All
      </button>

      {isLoading && <div className={styles.loading} data-testid="loading-tracks">Load tracks...</div>}
      
      {isError && <div className={styles.error}>Error loading tracks. Try refreshing the page..</div>}
      
      {!isLoading && !isError && filteredTracks.length === 0 && (
        <div className={styles.noTracks}>No tracks found. Try changing filters..</div>
      )}
      
      <div className={styles.tracksList}>
        {filteredTracks.map((track, index) => (
          <TrackItem 
            key={track.id} 
            track={track} 
            onEdit={onEdit}
            onDelete={onDelete}
            isPlaying={playingTrackId === track.id}
            setPlayingTrackId={setPlayingTrackId}
            isAutoPlay={isAutoPlay && playingIndex === index}
            onEnded={() => {
              const nextIndex = index + 1;
              if (nextIndex < filteredTracks.length) {
                setPlayingTrackId(filteredTracks[nextIndex].id);
                setPlayingIndex(nextIndex);
              } else {
                setIsAutoPlay(false);
                setPlayingTrackId(null);
                setPlayingIndex(null)
                setIsActive(false)
              }
            }}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className={styles.pagination} data-testid="pagination">
          <button 
            onClick={handlePrevPage} 
            disabled={page === 1}
            className={styles.paginationButton}
            data-testid="pagination-prev"
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} з {totalPages}
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={page >= totalPages}
            className={styles.paginationButton}
            data-testid="pagination-next"
          >
            The next one
          </button>
        </div>
      )}
    </div>
  );
};

export default TracksPage;
