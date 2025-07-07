import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { showError, showSuccess } from '../utils/toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const get = useCallback(async (endpoint, token = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet(endpoint, token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (endpoint, data, token = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPost(endpoint, data, token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const put = useCallback(async (endpoint, data, token = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPut(endpoint, data, token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const del = useCallback(async (endpoint, data = null, token = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiDelete(endpoint, data, token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
}; 