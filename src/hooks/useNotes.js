import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const { loading, error, get, post, put, delete: del } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Notları getir
  const fetchNotes = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_NOTES, token);
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error('Notlar getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Not oluştur
  const createNote = useCallback(async (noteData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const newNote = await post(API_ENDPOINTS.CREATE_NOTE, noteData, token);
      setNotes(prev => [newNote, ...prev]);
      setFilteredNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (error) {
      console.error('Not oluşturulamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Not güncelle
  const updateNote = useCallback(async (id, noteData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const updatedNote = await put(API_ENDPOINTS.UPDATE_NOTE.replace(':id', id), noteData, token);
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      setFilteredNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      return updatedNote;
    } catch (error) {
      console.error('Not güncellenemedi:', error);
      throw error;
    }
  }, [put, token]);

  // Not sil
  const deleteNote = useCallback(async (id) => {
    if (!token) throw new Error('Token gerekli');
    try {
      await del(API_ENDPOINTS.DELETE_NOTE.replace(':id', id), token);
      setNotes(prev => prev.filter(note => note.id !== id));
      setFilteredNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Not silinemedi:', error);
      throw error;
    }
  }, [del, token]);

  // Notları filtrele
  const filterNotes = useCallback((searchQuery, category) => {
    let filtered = [...notes];

    // Kategoriye göre filtrele
    if (category && category !== 'all') {
      filtered = filtered.filter(note => note.category === category);
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Öncelikle sabitlenmiş notları göster
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    setFilteredNotes(filtered);
  }, [notes]);

  // Notu sabitle/sabitlemeyi kaldır
  const togglePin = useCallback(async (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const updatedNote = { ...note, isPinned: !note.isPinned };
      await updateNote(id, updatedNote);
    }
  }, [notes, updateNote]);

  // AI ile not oluştur
  const createNoteWithAI = useCallback(async (prompt, category = 'general') => {
    if (!token) throw new Error('Token gerekli');
    try {
      const aiNote = await post(API_ENDPOINTS.ADD_NOTE_AI, {
        prompt,
        category
      }, token);
      
      setNotes(prev => [aiNote, ...prev]);
      setFilteredNotes(prev => [aiNote, ...prev]);
      return aiNote;
    } catch (error) {
      console.error('AI ile not oluşturulamadı:', error);
      throw error;
    }
  }, [post, token]);

  // İlk yükleme - sadece token varsa
  useEffect(() => {
    if (token && !authLoading) {
      fetchNotes();
    }
  }, [fetchNotes, token, authLoading]);

  return {
    notes,
    filteredNotes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    filterNotes,
    togglePin,
    createNoteWithAI,
  };
}; 