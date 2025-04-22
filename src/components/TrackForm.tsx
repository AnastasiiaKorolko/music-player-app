import React, { useState } from 'react';
import { Track } from '../types/Track';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTrack, editTrack, getGenres } from '../api/tracksApi';
import styles from './TrackForm.module.css';

interface TrackFormProps {
  track: Partial<Track> | null;
  onClose: () => void;
}

interface FormErrors {
  title?: string;
  artist?: string;
  coverImage?: string;
  genres?: string;
}

const TrackForm: React.FC<TrackFormProps> = ({ track, onClose }) => {
  const [formData, setFormData] = useState<Partial<Track>>({
    title: track?.title || '',
    artist: track?.artist || '',
    album: track?.album || '',
    coverImage: track?.coverImage || '',
    genres: track?.genres || [],
  });
  
  React.useEffect(() => {
    setFormData({
      title: track?.title || '',
      artist: track?.artist || '',
      album: track?.album || '',
      coverImage: track?.coverImage || '',
      genres: track?.genres || [],
    });
  }, [track]);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const queryClient = useQueryClient();
  
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres
  });
  
  const genres = genresData?.data || [];

  console.log(formData)
  
  const createMutation = useMutation({
    mutationFn: (data: Partial<Track>) => createTrack(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracks']);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating track:', error);
      alert('An error occurred while creating the track. Please try again!');
      if (error.response && error.response.data) {
        console.log('Error data:', error.response.data);
      }
    }
  });
  
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Track> }) => 
      editTrack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracks']);
      onClose();
    }
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Track name is required';
    }
    
    if (!formData.artist || formData.artist.trim() === '') {
      newErrors.artist = 'Artist name is required';
    }
    
    if (formData.coverImage && !isValidUrl(formData.coverImage)) {
      newErrors.coverImage = 'Enter a valid image URL';
    }
    
    if (!formData.genres || formData.genres.length === 0) {
      newErrors.genres = 'Please specify at least one genre';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGenre = e.target.value;
    
    if (selectedGenre && !formData.genres?.includes(selectedGenre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...(prev.genres || []), selectedGenre]
      }));
      
      if (errors.genres) {
        setErrors(prev => ({ ...prev, genres: undefined }));
      }
    }
  };
  
  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres?.filter(genre => genre !== genreToRemove) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (validateForm()) {
      const dataToSubmit = { ...formData };
  
      if (!track?.id) {
        delete dataToSubmit.id;
      }
  
      if (track?.id) {
        editMutation.mutate({ id: track.id, data: dataToSubmit });
      } else {
        createMutation.mutate(dataToSubmit);
      }
    }
  };
  

  const getImageUrl = (url: string): string => {
  console.log(url)
  if (!url) return "https://picsum.photos/seed/Bohemian%20Rhapsody/300/300";
  
  
  if (url.startsWith('https://via.placeholder.com')) return url;
  
  try {
    new URL(url);
    return url;
  } catch (e) {
    return "https://picsum.photos/seed/Bohemian%20Rhapsody/300/300";
    }
  };

  const isLoading = createMutation.isPending || editMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className={styles.form} data-testid="track-form">
      <h2>{track ? 'Edit track' : 'Create a new track'}</h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="title">Назва треку*</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter the track name"
          className={errors.title ? styles.inputError : ''}
          data-testid="input-title"
        />
        {errors.title && <div className={styles.errorMessage} data-testid="error-title">{errors.title}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="artist">Artist*</label>
        <input
          type="text"
          id="artist"
          name="artist"
          value={formData.artist}
          onChange={handleInputChange}
          placeholder="Enter the artist's name"
          className={errors.artist ? styles.inputError : ''}
          data-testid="input-artist"
        />
        {errors.artist && <div className={styles.errorMessage} data-testid="error-artist">{errors.artist}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="album">Albom</label>
        <input
          type="text"
          id="album"
          name="album"
          value={formData.album || ''}
          onChange={handleInputChange}
          placeholder="Enter the album name"
          data-testid="input-album"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="coverImage">Cover URL</label>
        <input
          type="text"
          id="coverImage"
          name="coverImage"
          value={formData.coverImage || ''}
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
          className={errors.coverImage ? styles.inputError : ''}
          data-testid="input-cover-image"
        />
        {errors.coverImage && <div className={styles.errorMessage} data-testid="error-cover-image">{errors.coverImage}</div>}
        {formData.coverImage && (
        <div className={styles.imagePreview}>
          <img 
        src={getImageUrl(formData.coverImage) || defaultCoverImage} 
        
        onError={() => setImageError(true)}
      />
        </div>
      )}
      </div>
      <div className={styles.formGroup}>
        <label>Genres*</label>
        <div className={styles.genreSelector} data-testid="genre-selector">
          <select 
            onChange={handleGenreSelect} 
            className={styles.genreSelect}
          >
            <option value="">Choose a genre</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <div className={styles.selectedGenres}>
            {formData.genres?.map((genre, index) => (
              <div key={index} className={styles.genreTag}>
                <span>{genre}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveGenre(genre)}
                  className={styles.removeGenreBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {errors.genres && <div className={styles.errorMessage} data-testid="error-genre">{errors.genres}</div>}
        </div>
      </div>
      
      <div className={styles.formActions}>
        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={isLoading}
          data-testid="submit-button"
        >
          {isLoading ? 'Preservation...' : track ? 'Update track' : 'Save track'}
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TrackForm;