import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Service for monitoring network connectivity status
 */
class NetworkService {
  constructor() {
    this.isConnected = false;
    this.connectionType = null;
    this.listeners = [];
    this.unsubscribe = null;
  }

  /**
   * Initialize the network monitoring
   */
  initialize() {
    if (!this.unsubscribe) {
      this.unsubscribe = NetInfo.addEventListener(state => {
        const wasConnected = this.isConnected;
        this.isConnected = state.isConnected;
        this.connectionType = state.type;
        
        // Notify listeners if connection state changed
        if (wasConnected !== this.isConnected) {
          this.notifyListeners();
        }
      });
    }
  }

  /**
   * Clean up network monitoring
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Get current network state
   * @returns {Promise<{isConnected: boolean, connectionType: string}>}
   */
  async getCurrentState() {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      connectionType: state.type
    };
  }

  /**
   * Add a listener for network state changes
   * @param {Function} listener - Callback function to be called when network state changes
   * @returns {Function} - Function to remove the listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of network state changes
   */
  notifyListeners() {
    const state = {
      isConnected: this.isConnected,
      connectionType: this.connectionType
    };
    
    this.listeners.forEach(listener => {
      listener(state);
    });
  }
}

// Create a singleton instance
const networkService = new NetworkService();

/**
 * React hook to use network status in components
 * @returns {{isConnected: boolean, connectionType: string}}
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState({
    isConnected: false,
    connectionType: null
  });

  useEffect(() => {
    // Initialize on first use
    networkService.initialize();
    
    // Get initial state
    networkService.getCurrentState().then(setNetworkState);
    
    // Subscribe to changes
    const unsubscribe = networkService.addListener(setNetworkState);
    
    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
};

export default networkService;
