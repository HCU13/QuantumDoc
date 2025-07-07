import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const { loading, error, get, post, put, delete: del } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Görevleri getir
  const fetchTasks = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_TASKS, token);
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      console.error('Görevler getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Görev oluştur
  const createTask = useCallback(async (taskData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const newTask = await post(API_ENDPOINTS.CREATE_TASK, taskData, token);
      setTasks(prev => [newTask, ...prev]);
      setFilteredTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error('Görev oluşturulamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Görev güncelle
  const updateTask = useCallback(async (id, taskData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const updatedTask = await put(API_ENDPOINTS.UPDATE_TASK.replace(':id', id), taskData, token);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      setFilteredTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (error) {
      console.error('Görev güncellenemedi:', error);
      throw error;
    }
  }, [put, token]);

  // Görev sil
  const deleteTask = useCallback(async (id) => {
    if (!token) throw new Error('Token gerekli');
    try {
      await del(API_ENDPOINTS.DELETE_TASK.replace(':id', id), token);
      setTasks(prev => prev.filter(task => task.id !== id));
      setFilteredTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Görev silinemedi:', error);
      throw error;
    }
  }, [del, token]);

  // Görev durumunu değiştir
  const toggleTaskStatus = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(id, updatedTask);
    }
  }, [tasks, updateTask]);

  // Görevleri filtrele
  const filterTasks = useCallback((status, searchQuery) => {
    let filtered = [...tasks];

    // Duruma göre filtrele
    if (status === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (status === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Tarihe göre sırala (yeniden eskiye)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredTasks(filtered);
  }, [tasks]);

  // Toplu işlemler
  const markAllAsCompleted = useCallback(async () => {
    try {
      const pendingTasks = tasks.filter(task => !task.completed);
      const promises = pendingTasks.map(task => 
        updateTask(task.id, { ...task, completed: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Toplu güncelleme hatası:', error);
      throw error;
    }
  }, [tasks, updateTask]);

  const deleteCompletedTasks = useCallback(async () => {
    try {
      const completedTasks = tasks.filter(task => task.completed);
      const promises = completedTasks.map(task => deleteTask(task.id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Tamamlanan görevler silinemedi:', error);
      throw error;
    }
  }, [tasks, deleteTask]);

  // İstatistikler
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      completionRate: Math.round(completionRate)
    };
  }, [tasks]);

  // İlk yükleme - sadece token varsa
  useEffect(() => {
    if (token && !authLoading) {
      fetchTasks();
    }
  }, [fetchTasks, token, authLoading]);

  return {
    tasks,
    filteredTasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    filterTasks,
    markAllAsCompleted,
    deleteCompletedTasks,
    getTaskStats,
  };
}; 