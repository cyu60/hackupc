
import { EEGMessage, EEGRealtimeData } from "../types";

class MockWebSocketService {
  private callbacks: ((data: EEGMessage) => void)[] = [];
  private intervalSummary: NodeJS.Timeout | null = null;
  private intervalRealtime: NodeJS.Timeout | null = null;
  private connected: boolean = false;

  connect(): void {
    if (this.connected) return;
    
    this.connected = true;
    console.log("Mock WebSocket connected");
    
    // Send initial summary data
    setTimeout(() => {
      this.sendMockSummaryData();
    }, 1000);

    // Send initial realtime data
    setTimeout(() => {
      this.sendRealtimeData();
    }, 500);

    // Set up intervals to send data periodically
    this.intervalSummary = setInterval(() => {
      this.sendMockSummaryData();
    }, 5000); // Send summary data every 5 seconds
    
    this.intervalRealtime = setInterval(() => {
      this.sendRealtimeData();
    }, 300); // Send realtime data every 300ms
  }

  disconnect(): void {
    if (this.intervalSummary) {
      clearInterval(this.intervalSummary);
      this.intervalSummary = null;
    }
    
    if (this.intervalRealtime) {
      clearInterval(this.intervalRealtime);
      this.intervalRealtime = null;
    }
    
    this.connected = false;
    console.log("Mock WebSocket disconnected");
  }

  onMessage(callback: (data: EEGMessage) => void): void {
    this.callbacks.push(callback);
  }

  private sendMockSummaryData(): void {
    const isPositive = Math.random() > 0.4; // 60% chance of positive feedback
    
    const mockData: EEGMessage = {
      type: 'summary',
      data: {
        metrics: {
          alpha_relaxation: Number((Math.random() * (isPositive ? 2 : 0.5)).toFixed(2)),
          beta_concentration: Number((Math.random() * (isPositive ? 0.8 : 0.2)).toFixed(2)),
          theta_relaxation: Number((Math.random() * (isPositive ? 1 : 3)).toFixed(2)),
          engagement_index: Number((Math.random() * (isPositive ? 0.8 : 0.2)).toFixed(2)),
          arousal_index: Number((Math.random() * (isPositive ? 0.6 : 0.2)).toFixed(2)),
          frustration_index: Number((Math.random() * (isPositive ? 0.4 : 2.5)).toFixed(2)),
          mindfulness_index: Number((Math.random() * (isPositive ? 30 : 10)).toFixed(2)),
        },
        mental_state: {
          relaxation: isPositive ? 'high' : 'low',
          concentration: isPositive ? 'high' : 'low',
          calm: isPositive ? 'high' : 'low',
          engagement: isPositive ? 'high' : 'low',
          arousal: isPositive ? 'medium' : 'low',
          frustration: isPositive ? 'low' : 'high',
          mindfulness: isPositive ? 'high' : 'medium',
        },
        timestamp: Date.now() / 1000,
        iterations_analyzed: 50
      }
    };

    this.callbacks.forEach(callback => callback(mockData));
  }

  // For real-time data simulation
  sendRealtimeData(): void {
    // Create fluctuating values for each channel
    const generateChannelValue = () => {
      return Math.random() * 100;
    };
    
    const realtimeData: EEGMessage = {
      type: 'real_time',
      data: {
        timestamp: Date.now() / 1000,
        channels: {
          AF3: generateChannelValue(),
          F7: generateChannelValue(),
          F3: generateChannelValue(),
          FC5: generateChannelValue(),
          T7: generateChannelValue(),
          P7: generateChannelValue(),
          O1: generateChannelValue(),
          O2: generateChannelValue(),
          P8: generateChannelValue(),
          T8: generateChannelValue(),
          FC6: generateChannelValue(),
          F4: generateChannelValue(),
          F8: generateChannelValue(),
          AF4: generateChannelValue(),
        }
      } as EEGRealtimeData
    };

    this.callbacks.forEach(callback => callback(realtimeData));
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const mockWebSocketService = new MockWebSocketService();
