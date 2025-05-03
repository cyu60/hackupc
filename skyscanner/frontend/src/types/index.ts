
export interface EEGMetrics {
  alpha_relaxation: number;
  beta_concentration: number;
  theta_relaxation: number;
  engagement_index: number;
  arousal_index: number;
  frustration_index: number;
  mindfulness_index: number;
}

export interface MentalState {
  relaxation: string;
  concentration: string;
  calm: string;
  engagement: string;
  arousal: string;
  frustration: string;
  mindfulness: string;
}

export interface EEGSummaryData {
  metrics: EEGMetrics;
  mental_state: MentalState;
  timestamp: number;
  iterations_analyzed: number;
}

export interface EEGRealtimeData {
  timestamp: number;
  channels: {
    AF3: number;
    F7: number;
    F3: number;
    FC5: number;
    T7: number;
    P7: number;
    O1: number;
    O2: number;
    P8: number;
    T8: number;
    FC6: number;
    F4: number;
    F8: number;
    AF4: number;
  };
}

export interface EEGMessage {
  type: 'summary' | 'real_time';
  data: EEGSummaryData | EEGRealtimeData;
}

export interface City {
  name: string;
  images: string[];
  vibe: string;
  liked?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  topCity: City;
  hasVoted: boolean;
  vote?: string;
}

export interface GroupVote {
  cityName: string;
  votes: number;
  voters: string[];
  images: string[];
  vibe: string;
}
