import { useState, useCallback, useEffect } from 'react';

export const useMath = () => {
  const [mathHistory, setMathHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // useAuth importu kaldırıldı

  // Mock math history data
  const mockMathHistory = [
    {
      id: 1,
      question: "x²+5x+6=0",
      answer: "x = -2 veya x = -3\n\nÇözüm:\nx²+5x+6 = (x+2)(x+3)\nBu durumda x = -2 veya x = -3 olur.",
      imageUrl: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      userId: 1
    },
    {
      id: 2,
      question: "2x + 3 = 7",
      answer: "x = 2\n\nÇözüm:\n2x + 3 = 7\n2x = 7 - 3\n2x = 4\nx = 2",
      imageUrl: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      userId: 1
    },
    {
      id: 3,
      question: "∫ x² dx",
      answer: "∫ x² dx = (x³/3) + C\n\nÇözüm:\n∫ x² dx = (x^(2+1))/(2+1) + C\n= x³/3 + C",
      imageUrl: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: 1
    }
  ];

  const solveMath = useCallback(async (question, imageUri = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock math solving
      let answer = "";
      
      if (question.includes("x²") && question.includes("=")) {
        answer = "Bu bir ikinci derece denklemdir. Çözüm için faktörlere ayırma veya kuadratik formül kullanılabilir.";
      } else if (question.includes("∫")) {
        answer = "Bu bir integral problemidir. Uygun integral kuralları kullanılarak çözülmelidir.";
      } else if (question.includes("+") || question.includes("-") || question.includes("=")) {
        answer = "Bu bir lineer denklemdir. Bilinmeyen terimleri bir tarafa, sabitleri diğer tarafa toplayarak çözülür.";
      } else {
        answer = "Matematik problemi analiz ediliyor... Bu bir mock yanıttır.";
      }
      
      const newMathLog = {
        id: Date.now(),
        question,
        answer,
        imageUrl: imageUri,
        createdAt: new Date().toISOString(),
        userId: 1
      };
      
      setMathHistory(prev => [newMathLog, ...prev]);
      
      return {
        success: true,
        answer,
        log: newMathLog
      };
    } catch (err) {
      setError('Matematik problemi çözülemedi');
      console.error('Math solving error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const solveMathWithImage = useCallback(async (imageUri) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock image-based math solving
      const question = "Fotoğraftan algılanan matematik problemi";
      const answer = "Bu bir mock yanıttır. Gerçek API entegrasyonu ile fotoğraftan matematik problemi algılanacak ve çözülecektir.";
      
      const newMathLog = {
        id: Date.now(),
        question,
        answer,
        imageUrl: imageUri,
        createdAt: new Date().toISOString(),
        userId: 1
      };
      
      setMathHistory(prev => [newMathLog, ...prev]);
      
      return {
        success: true,
        answer,
        log: newMathLog
      };
    } catch (err) {
      setError('Fotoğraf analizi başarısız');
      console.error('Image math solving error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMathImage = useCallback(async (imageUri) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock image upload
      const question = "Fotoğraftan algılanan matematik problemi";
      const answer = "Bu bir mock yanıttır. Gerçek API entegrasyonu ile fotoğraftan matematik problemi algılanacak ve çözülecektir.";
      
      const newMathLog = {
        id: Date.now(),
        question,
        answer,
        imageUrl: imageUri,
        createdAt: new Date().toISOString(),
        userId: 1
      };
      
      setMathHistory(prev => [newMathLog, ...prev]);
      
      return {
        success: true,
        answer,
        log: newMathLog
      };
    } catch (err) {
      setError('Fotoğraf yükleme başarısız');
      console.error('Math image upload error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMathHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock math history fetch
      setMathHistory(mockMathHistory);
    } catch (err) {
      setError('Matematik geçmişi yüklenemedi');
      console.error('Math history fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMathHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock clear history
      setMathHistory([]);
      return { success: true };
    } catch (err) {
      setError('Geçmiş temizlenemedi');
      console.error('Clear math history error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMathStats = useCallback(async () => {
    try {
      // Mock math stats
      return {
        totalProblems: mathHistory.length,
        solvedToday: mathHistory.filter(item => {
          const today = new Date();
          const itemDate = new Date(item.createdAt);
          return itemDate.toDateString() === today.toDateString();
        }).length,
        averageTime: "2.5 dakika",
        favoriteTopics: ["Cebir", "Geometri", "Kalkülüs"]
      };
    } catch (err) {
      console.error('Math stats error:', err);
      throw err;
    }
  }, [mathHistory]);

  useEffect(() => {
    fetchMathHistory();
  }, [fetchMathHistory]);

  return {
    mathHistory,
    loading,
    error,
    solveMathProblem: solveMath,
    solveImageProblem: solveMathWithImage,
    uploadMathImage,
    fetchMathHistory,
    clearMathHistory,
    getMathStats,
  };
}; 