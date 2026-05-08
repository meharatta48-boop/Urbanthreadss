import axios from 'axios';
import { SERVER_URL } from '../services/api';

/**
 * Keep-alive system for Render backend
 * Prevents backend from sleeping due to inactivity
 */

class KeepAliveManager {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
    this.pingInterval = 10 * 60 * 1000; // 10 minutes
  }

  start() {
    if (this.isActive) return;
    if (typeof window !== "undefined" && window.location.hostname.includes("localhost")) return;

    this.isActive = true;
    console.log('🚀 Starting backend keep-alive system');

    // Ping immediately
    this.ping();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.pingInterval);
  }

  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏹️ Stopped backend keep-alive system');
  }

  async ping() {
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const response = await axios.get(`${SERVER_URL}/api/health`, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.status === 200) {
        console.log('💚 Backend ping successful');
      }
    } catch (error) {
      console.warn('💔 Backend ping failed:', error.message);
    }
  }
}

export const keepAliveManager = new KeepAliveManager();