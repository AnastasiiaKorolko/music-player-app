import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import './App.css';
import  ScrollButton from './components/ScrollButton'

import TracksPage from './pages/TracksPage';
import Modal from './modals/Modal';
import TrackForm from './components/TrackForm';
import { Track } from './types/Track';
import { deleteTrack } from './api/tracksApi';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTrack, setEditTrack] = useState<Partial<Track> | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const headerRef = useRef<HTMLHeadingElement>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tracks']);
      showToast('Track successfully deleted', 'success');
    },
    onError: () => {
      showToast('Error deleting track', 'error');
    }
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
    
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  const handleCreateTrack = () => {
    setEditTrack(null);
    setIsModalOpen(true);
  };

  const handleEdit = (track: Track) => {
    setEditTrack(track);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);
  console.log(headerRef)

  return (
    <div className="App">
      <header ref={headerRef} className="app-header">
        <h1>Music</h1>
        <button 
          onClick={handleCreateTrack} 
          className="create-button"
          data-testid="create-track-button"
        >
          Create track
        </button>
      </header>

      <main>
        <TracksPage 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <TrackForm track={editTrack} onClose={handleCloseModal} />
        </Modal>
      )}
      {isToastVisible && (
        <div 
          className={`toast ${toastType}`} 
          data-testid={`toast-${toastType}`}
          data-toast-container="true"
        >
          {toastMessage}
        </div>
      )}
    <ScrollButton headerRef={headerRef}/>
    </div>
    
  );
};

export default App;