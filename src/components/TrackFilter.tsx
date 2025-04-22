import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGenres } from '../api/tracksApi';
import styles from './TrackFilter.module.css';

interface TrackFilterProps {
  onSearch: (search: string) => void;
  onGenreFilter: (genre: string) => void;
  onArtistFilter: (artist: string) => void;
  onSort: (sortBy: string) => void;
}

const TrackFilter: React.FC<TrackFilterProps> = ({ 
  onSearch, 
  onGenreFilter, 
  onArtistFilter, 
  onSort 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres
  });
  
  const genres = genresData?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setArtist(value);
    onArtistFilter(value);
  };
  
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedGenre(value);
    onGenreFilter(value);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSort(e.target.value);
  };

  return (
    <div className={styles.filterContainer}>
      <input 
        type="text" 
        placeholder="Searching for tracks..."
        value={searchTerm}
        onChange={handleSearchChange}
        className={styles.searchInput}
        data-testid="search-input"
      />
      <input 
        type="text" 
        placeholder="Filter by artist"
        value={artist}
        onChange={handleArtistChange}
        className={styles.artistInput}
        data-testid="filter-artist"
      />
      
      <select 
        value={selectedGenre} 
        onChange={handleGenreChange}
        className={styles.genreSelect}
        data-testid="filter-genre"
      >
        <option value="">All genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      
      <select 
        onChange={handleSortChange}
        className={styles.sortSelect}
        data-testid="sort-select"
      >
        <option value="title">Sort by name</option>
        <option value="artist">Sort by artist</option>
        <option value="album">Sort by album</option>
        <option value="createdAt">Sort by date</option>
      </select>
    </div>
  );
};

export default TrackFilter;