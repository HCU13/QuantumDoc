import { useState, useCallback, useEffect } from 'react';

export const useSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // useAuth importu kaldırıldı

  // Mock support data
  const mockTickets = [
    {
      id: 1,
      userId: 1,
      subject: "Token kullanımı hakkında",
      message: "Token'larımı nasıl daha verimli kullanabilirim?",
      priority: "medium",
      status: "open",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      userId: 1,
      subject: "Matematik çözücü sorunu",
      message: "Matematik çözücü bazı problemleri çözemiyor",
      priority: "high",
      status: "pending",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      userId: 1,
      subject: "Premium özellikler",
      message: "Premium özellikler hakkında bilgi almak istiyorum",
      priority: "low",
      status: "closed",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const fetchTickets = useCallback(async () => {
    // useAuth importu kaldırıldı
    if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock tickets fetch
      setTickets(mockTickets);
    } catch (err) {
      setError('Destek talepleri yüklenemedi');
      console.error('Tickets fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  const createTicket = useCallback(async (ticketData) => {
    // useAuth importu kaldırıldı
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock ticket creation
      const newTicket = {
        id: Date.now(),
        userId: 1,
        ...ticketData,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTickets(prev => [newTicket, ...prev]);
      
      return { success: true, ticket: newTicket };
    } catch (err) {
      setError('Destek talebi oluşturulamadı');
      console.error('Ticket creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateTicket = useCallback(async (ticketId, updateData) => {
    // useAuth importu kaldırıldı
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock ticket update
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, ...updateData, updatedAt: new Date().toISOString() }
          : ticket
      ));
      
      return { success: true };
    } catch (err) {
      setError('Destek talebi güncellenemedi');
      console.error('Ticket update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const closeTicket = useCallback(async (ticketId) => {
    // useAuth importu kaldırıldı
    if (!token) return;
    
    return await updateTicket(ticketId, { status: "closed" });
  }, [token, updateTicket]);

  const getTicketById = useCallback(async (ticketId) => {
    // useAuth importu kaldırıldı
    if (!token) return null;
    
    try {
      // Mock ticket fetch by ID
      const ticket = mockTickets.find(t => t.id === ticketId);
      return ticket || null;
    } catch (err) {
      console.error('Ticket fetch error:', err);
      return null;
    }
  }, [token]);

  const getTicketStats = useCallback(async () => {
    // useAuth importu kaldırıldı
    if (!token) return {};
    
    try {
      // Mock ticket stats
      const totalTickets = mockTickets.length;
      const openTickets = mockTickets.filter(t => t.status === 'open').length;
      const pendingTickets = mockTickets.filter(t => t.status === 'pending').length;
      const closedTickets = mockTickets.filter(t => t.status === 'closed').length;
      
      return {
        total: totalTickets,
        open: openTickets,
        pending: pendingTickets,
        closed: closedTickets,
        averageResponseTime: "2.5 saat",
        satisfactionRate: "4.8/5"
      };
    } catch (err) {
      console.error('Ticket stats error:', err);
      return {};
    }
  }, [token]);

  const getFAQ = useCallback(async () => {
    // useAuth importu kaldırıldı
    if (!token) return [];
    
    try {
      // Mock FAQ data
      return [
        {
          id: 1,
          question: "Token'larımı nasıl kullanabilirim?",
          answer: "Token'larınızı chat, matematik çözücü, çeviri ve diğer AI özelliklerinde kullanabilirsiniz. Her işlem belirli miktarda token gerektirir.",
          category: "tokens"
        },
        {
          id: 2,
          question: "Premium üyeliğe nasıl geçebilirim?",
          answer: "Profil sayfanızdan 'Abonelik' bölümüne giderek Premium planını seçebilirsiniz. Ödeme işlemi güvenli bir şekilde gerçekleştirilir.",
          category: "subscription"
        },
        {
          id: 3,
          question: "Matematik çözücü nasıl çalışır?",
          answer: "Matematik çözücü, yazdığınız veya fotoğrafını çektiğiniz matematik problemlerini AI teknolojisi ile çözer. Desteklenen konular: cebir, geometri, kalkülüs.",
          category: "features"
        },
        {
          id: 4,
          question: "Çeviri özelliği hangi dilleri destekler?",
          answer: "Çeviri özelliği 10 farklı dili destekler: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Portekizce, Rusça, Japonca ve Korece.",
          category: "features"
        },
        {
          id: 5,
          question: "Hesabımı nasıl silebilirim?",
          answer: "Hesabınızı silmek için Profil > Hesap Bilgileri > Hesabı Sil bölümüne gidin. Bu işlem geri alınamaz.",
          category: "account"
        }
      ];
    } catch (err) {
      console.error('FAQ error:', err);
      return [];
    }
  }, [token]);

  const getContactInfo = useCallback(async () => {
    // useAuth importu kaldırıldı
    if (!token) return {};
    
    try {
      // Mock contact info
      return {
        email: "support@quantumdoc.app",
        phone: "+90 212 555 0123",
        address: "İstanbul, Türkiye",
        workingHours: "Pazartesi - Cuma: 09:00 - 18:00",
        responseTime: "24 saat içinde"
      };
    } catch (err) {
      console.error('Contact info error:', err);
      return {};
    }
  }, [token]);

  const submitFeedback = useCallback(async (feedbackData) => {
    // useAuth importu kaldırıldı
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock feedback submission
      console.log('Feedback submitted:', feedbackData);
      
      return { success: true, message: "Geri bildiriminiz için teşekkürler!" };
    } catch (err) {
      setError('Geri bildirim gönderilemedi');
      console.error('Feedback submission error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // useAuth importu kaldırıldı
    if (token && !authLoading) {
      fetchTickets();
    }
  }, [fetchTickets, token, authLoading]);

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