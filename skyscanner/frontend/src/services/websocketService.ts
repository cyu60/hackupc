
import { EEGMessage } from "../types";

class WebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: ((data: EEGMessage) => void)[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.log("WebSocket already connected or connecting");
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as EEGMessage;
          this.callbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.tryReconnect();
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.socket?.close();
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.tryReconnect();
    }
  }

  private tryReconnect(): void {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        this.connect();
      }, 3000); // Reconnect after 3 seconds
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    console.log("WebSocket disconnected");
  }

  onMessage(callback: (data: EEGMessage) => void): void {
    this.callbacks.push(callback);
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService("ws://localhost:5000/ws");
