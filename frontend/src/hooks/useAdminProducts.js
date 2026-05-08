import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for paginated admin products
 * Optimized for admin panel performance
 */
export const useAdminProducts = (initialPage = 1, limit = 20) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [search, setSearch] = useState('');

  const fetchProducts = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const res = await api.get(`/products?${params}`);
      const data = res.data;

      setProducts(data.data || []);
      setPagination(data.pagination || {
        page: data.page || 1,
        limit: data.limit || limit,
        total: data.total || 0,
        pages: data.pages || 0,
        hasNextPage: data.hasNextPage || false,
        hasPrevPage: data.hasPrevPage || false
      });
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchProducts(page, search);
    }
  };

  const searchProducts = (searchTerm) => {
    setSearch(searchTerm);
    fetchProducts(1, searchTerm);
  };

  const refresh = () => {
    fetchProducts(pagination.page, search);
  };

  // Initial load
  useEffect(() => {
    fetchProducts(initialPage);
  }, []);

  return {
    products,
    loading,
    pagination,
    search,
    goToPage,
    searchProducts,
    refresh
  };
};