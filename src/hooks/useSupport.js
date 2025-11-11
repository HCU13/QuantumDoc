import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, TABLES } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

// Helper: JSONB i18n alanından doğru dili al
const getLocalizedField = (i18nField, language, fallback = '') => {
  if (!i18nField) return fallback;
  return i18nField[language] || i18nField['tr'] || i18nField['en'] || fallback;
};

export const useSupport = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (!user?.id) {
      setTickets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Format data to match frontend structure
      const formattedTickets = data.map(ticket => ({
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      }));

      setTickets(formattedTickets);
    } catch (err) {
      setError('Destek talepleri yüklenemedi');
      if (__DEV__) console.error('Tickets fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createTicket = useCallback(async (ticketData) => {
    if (!user?.id) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .insert({
          user_id: user.id,
          subject: ticketData.subject,
          message: ticketData.message,
          priority: ticketData.priority || 'medium',
          status: 'open',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newTicket = {
        id: data.id,
        userId: data.user_id,
        subject: data.subject,
        message: data.message,
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setTickets(prev => [newTicket, ...prev]);

      return { success: true, ticket: newTicket };
    } catch (err) {
      setError('Destek talebi oluşturulamadı');
      if (__DEV__) console.error('Ticket creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateTicket = useCallback(async (ticketId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .update(updateData)
        .eq('id', ticketId);

      if (updateError) throw updateError;

      // Update local state
      setTickets(prev => prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, ...updateData, updatedAt: new Date().toISOString() }
          : ticket
      ));

      return { success: true };
    } catch (err) {
      setError('Destek talebi güncellenemedi');
      if (__DEV__) console.error('Ticket update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const closeTicket = useCallback(async (ticketId) => {
    return await updateTicket(ticketId, { status: "closed" });
  }, [updateTicket]);

  const getTicketById = useCallback(async (ticketId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select('*')
        .eq('id', ticketId)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        userId: data.user_id,
        subject: data.subject,
        message: data.message,
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      if (__DEV__) console.error('Ticket fetch error:', err);
      return null;
    }
  }, []);

  const getTicketStats = useCallback(async () => {
    if (!user?.id) {
      return {
        total: 0,
        open: 0,
        pending: 0,
        closed: 0,
      };
    }

    try {
      const { data, error: fetchError } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select('status')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const totalTickets = data.length;
      const openTickets = data.filter(t => t.status === 'open').length;
      const pendingTickets = data.filter(t => t.status === 'pending').length;
      const closedTickets = data.filter(t => t.status === 'closed').length;

      return {
        total: totalTickets,
        open: openTickets,
        pending: pendingTickets,
        closed: closedTickets,
        averageResponseTime: "2.5 saat",
        satisfactionRate: "4.8/5"
      };
    } catch (err) {
      if (__DEV__) console.error('Ticket stats error:', err);
      return {};
    }
  }, [user?.id]);

  const getFAQ = useCallback(async (category = null) => {
    try {
      let query = supabase
        .from(TABLES.FAQ)
        .select('*')
        .order('order_index', { ascending: true });

      // Category filter (optional)
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // i18n desteği ile formatla
      const currentLanguage = i18n.language;
      const localizedFAQ = (data || []).map(item => ({
        id: item.id,
        question: getLocalizedField(item.question_i18n, currentLanguage, item.question),
        answer: getLocalizedField(item.answer_i18n, currentLanguage, item.answer),
        category: item.category,
        isPopular: item.is_popular,
        orderIndex: item.order_index,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return localizedFAQ;
    } catch (err) {
      if (__DEV__) console.error('FAQ error:', err);
      return [];
    }
  }, [i18n]);

  const getContactInfo = useCallback(async () => {
    try {
      // Mock contact info
      return {
        email: "support@quorax.app",
        phone: "+90 212 555 0123",
        address: "İstanbul, Türkiye",
        workingHours: "Pazartesi - Cuma: 09:00 - 18:00",
        responseTime: "24 saat içinde"
      };
    } catch (err) {
      if (__DEV__) console.error('Contact info error:', err);
      return {};
    }
  }, []);

  const submitFeedback = useCallback(async (feedbackData) => {
    setLoading(true);
    setError(null);

    try {
      // Mock feedback submission
      return { success: true, message: "Geri bildiriminiz için teşekkürler!" };
    } catch (err) {
      setError('Geri bildirim gönderilemedi');
      if (__DEV__) console.error('Feedback submission error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    closeTicket,
    getTicketById,
    getTicketStats,
    getFAQ,
    getContactInfo,
    submitFeedback,
  };
};