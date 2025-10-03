import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { cartAPI } from '../api';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  totalPrice: 0,
  loading: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        totalPrice: action.payload.totalPrice || 0,
        loading: false,
      };
    case 'ADD_TO_CART':
    case 'UPDATE_CART':
      return {
        ...state,
        items: action.payload.items || [],
        totalPrice: action.payload.totalPrice || 0,
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: action.payload.items || [],
        totalPrice: action.payload.totalPrice || 0,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalPrice: 0,
      };
    case 'CART_ERROR':
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, user]);

  // Load cart from server
  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: cartData });
    } catch (error) {
      console.error('Failed to load cart:', error);
      dispatch({ type: 'CART_ERROR' });
    }
  };

  // Add item to cart
  const addToCart = async (itemData) => {
    try {
      const updatedCart = await cartAPI.addToCart(itemData);
      dispatch({ type: 'ADD_TO_CART', payload: updatedCart });
      return updatedCart;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  // Update cart item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await cartAPI.updateCartItem({ productId, quantity });
      dispatch({ type: 'UPDATE_CART', payload: updatedCart });
      return updatedCart;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await cartAPI.removeFromCart(productId);
      dispatch({ type: 'REMOVE_FROM_CART', payload: updatedCart });
      return updatedCart;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  // Calculate cart totals
  const cartItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = state.totalPrice;

  const value = {
    cartItems: state.items,
    cartTotal,
    cartItemsCount,
    loading: state.loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };