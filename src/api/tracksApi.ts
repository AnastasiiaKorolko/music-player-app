import axios from 'axios';
import { Track } from '../types/Track';

const API_URL = 'http://localhost:8000/api';

export const getTracks = (page = '1', sortBy = '', filter = '', artist = '', genre = '', limit = 10) =>
  axios.get<{ data: Track[], total: number, page: number, limit: number, }>(`${API_URL}/tracks`, { 
    params: { page, sortBy, filter, artist, genre, limit, }
  });

export const getGenres = () =>
  axios.get<{ data: string[] }>(`${API_URL}/genres`);

export const createTrack = (track: Partial<Track>) =>
  axios.post<Track>(`${API_URL}/tracks`, track);

export const deleteTrack = (id: string) =>
  axios.delete(`${API_URL}/tracks/${id}`);

export const editTrack = (id: string, track: Partial<Track>) =>
  axios.put<Track>(`${API_URL}/tracks/${id}`, track);

export const uploadTrackFile = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_URL}/tracks/${id}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const removeTrackFile = (id: string) =>
  axios.delete(`${API_URL}/tracks/${id}/file`);