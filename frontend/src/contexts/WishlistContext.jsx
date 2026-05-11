import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null
};

// Action types
const WISHLIST_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_WISHLIST: 'SET_WISHLIST',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  TOGGLE_WISHLIST: 'TOGGLE_WISHLIST'
};

// Reducer
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case WISHLIST_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case WISHLIST_ACTIONS.SET_WISHLIST:
      return { ...state, items: action.payload, loading: false, error: null };
    
    case WISHLIST_ACTIONS.ADD_TO_WISHLIST:
      return { 
        ...state, 
        items: [...state.items, action.payload], 
        loading: false, 
        error: null 
      };
    
    case WISHLIST_ACTIONS.REMOVE_FROM_WISHLIST:
      return { 
        ...state, 
        items: state.items.filter(item => item.wishlistId !== action.payload), 
        loading: false, 
        error: null 
      };
    
    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return { ...state, items: [], loading: false, error: null };
    
    case WISHLIST_ACTIONS.TOGGLE_WISHLIST:
      const exists = state.items.some(item => item.productId === action.payload.productId);
      if (exists) {
        return {
          ...state,
          items: state.items.filter(item => item.productId !== action.payload.productId),
          loading: false,
          error: null
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
          loading: false,
          error: null
        };
      }
    
    default:
      return state;
  }
};

// Create context
const WishlistContext = createContext();

// Provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          const wishlist = JSON.parse(savedWishlist);
          dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: wishlist });
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Failed to load wishlist' });
      }
    };

    loadWishlist();
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('wishlist');
    }
  }, [state.items]);

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return state.items.some(item => item.productId === productId);
  };

  // Add item to wishlist
  const addToWishlist = async (product) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });

      const wishlistItem = {
        wishlistId: `${product._id}-${Date.now()}`,
        productId: product._id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images?.[0],
        category: product.category?.name,
        addedAt: new Date().toISOString()
      };

      // Check if item already exists
      if (isInWishlist(product._id)) {
        toast.info('Item already in wishlist');
        dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      dispatch({ type: WISHLIST_ACTIONS.ADD_TO_WISHLIST, payload: wishlistItem });
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Failed to add to wishlist' });
      toast.error('Failed to add to wishlist');
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (wishlistId, productName) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_FROM_WISHLIST, payload: wishlistId });
      toast.success(`${productName} removed from wishlist`);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Failed to remove from wishlist' });
      toast.error('Failed to remove from wishlist');
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });

      const wishlistItem = {
        wishlistId: `${product._id}-${Date.now()}`,
        productId: product._id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images?.[0],
        category: product.category?.name,
        addedAt: new Date().toISOString()
      };

      dispatch({ type: WISHLIST_ACTIONS.TOGGLE_WISHLIST, payload: wishlistItem });
      
      if (isInWishlist(product._id)) {
        toast.success(`${product.name} removed from wishlist`);
      } else {
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Failed to update wishlist' });
      toast.error('Failed to update wishlist');
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Failed to clear wishlist' });
      toast.error('Failed to clear wishlist');
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return state.items.length;
  };

  // Get wishlist total
  const getWishlistTotal = () => {
    return state.items.reduce((total, item) => total + item.price, 0);
  };

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    getWishlistTotal
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
