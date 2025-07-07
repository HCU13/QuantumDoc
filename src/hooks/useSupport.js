import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const { loading, error, get, post, put } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Destek taleplerini getir
  const fetchTickets = useCallback(async (status = null) => {
    if (!token || authLoading) return;
    try {
      const params = status ? `?status=${status}` : '';
      const data = await get(`${API_ENDPOINTS.GET_TICKETS}${params}`, token);
      setTickets(data);
    } catch (error) {
      console.error('Destek talepleri getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Yeni destek talebi oluştur
  const createTicket = useCallback(async (ticketData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const newTicket = await post(API_ENDPOINTS.CREATE_TICKET, ticketData, token);
      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (error) {
      console.error('Destek talebi oluşturulamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Destek talebini getir
  const getTicket = useCallback(async (ticketId) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const data = await get(API_ENDPOINTS.GET_TICKET.replace(':id', ticketId), token);
      setCurrentTicket(data);
      return data;
    } catch (error) {
      console.error('Destek talebi getirilemedi:', error);
      throw error;
    }
  }, [get, token]);

  // Destek talebini güncelle
  const updateTicket = useCallback(async (ticketId, message) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const updatedTicket = await put(API_ENDPOINTS.UPDATE_TICKET.replace(':id', ticketId), {
        message
      }, token);
      
      // Ticket listesini güncelle
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
      
      // Eğer aktif ticket ise güncelle
      if (currentTicket?.id === ticketId) {
        setCurrentTicket(updatedTicket);
      }
      
      return updatedTicket;
    } catch (error) {
      console.error('Destek talebi güncellenemedi:', error);
      throw error;
    }
  }, [put, token, currentTicket]);

  // Destek taleplerini filtrele
  const filterTickets = useCallback((status) => {
    if (!status || status === 'all') {
      return tickets;
    }
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  // Destek taleplerini arama
  const searchTickets = useCallback((query) => {
    if (!query) {
      return tickets;
    }
    const searchTerm = query.toLowerCase();
    return tickets.filter(ticket =>
      ticket.subject.toLowerCase().includes(searchTerm) ||
      ticket.message.toLowerCase().includes(searchTerm)
    );
  }, [tickets]);

  // Öncelik seviyeleri
  const priorityLevels = [
    { id: 'low', name: 'Düşük', color: '#4ECDC4' },
    { id: 'medium', name: 'Orta', color: '#FF9D55' },
    { id: 'high', name: 'Yüksek', color: '#FF6B6B' },
  ];

  // Durum seviyeleri
  const statusLevels = [
    { id: 'open', name: 'Açık', color: '#4ECDC4' },
    { id: 'pending', name: 'Beklemede', color: '#FF9D55' },
    { id: 'closed', name: 'Kapalı', color: '#666666' },
  ];

  // Destek kategorileri
  const supportCategories = [
    { id: 'general', name: 'Genel', icon: '❓' },
    { id: 'technical', name: 'Teknik', icon: '🔧' },
    { id: 'billing', name: 'Faturalama', icon: '💳' },
    { id: 'feature', name: 'Özellik İsteği', icon: '💡' },
    { id: 'bug', name: 'Hata Bildirimi', icon: '🐛' },
    { id: 'account', name: 'Hesap', icon: '👤' },
  ];

  // Hızlı şablonlar
  const quickTemplates = [
    {
      id: 'bug-report',
      title: 'Hata Bildirimi',
      subject: 'Uygulama Hatası',
      message: 'Hata detaylarını buraya yazın...',
      category: 'bug'
    },
    {
      id: 'feature-request',
      title: 'Özellik İsteği',
      subject: 'Yeni Özellik Önerisi',
      message: 'İstediğiniz özelliği detaylandırın...',
      category: 'feature'
    },
    {
      id: 'account-issue',
      title: 'Hesap Sorunu',
      subject: 'Hesap ile İlgili Sorun',
      message: 'Hesabınızla ilgili sorunu açıklayın...',
      category: 'account'
    },
  ];

  // İlk yükleme - sadece token varsa
  useEffect(() => {
    if (token && !authLoading) {
      fetchTickets();
    }
  }, [fetchTickets, token, authLoading]);

  return {
    tickets,
    currentTicket,
    loading,
    error,
    fetchTickets,
    createTicket,
    getTicket,
    updateTicket,
    filterTickets,
    searchTickets,
    priorityLevels,
    statusLevels,
    supportCategories,
    quickTemplates,
  };
}; 