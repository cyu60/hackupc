
import { EEGSummaryData } from "../types";

export const analyzeEEGFeedback = (data: EEGSummaryData): { isPositive: boolean; reason: string } => {
  // Count positive mental states
  const { mental_state, metrics } = data;
  const positiveStates = Object.values(mental_state).filter(state => 
    ['high', 'medium'].includes(state.toLowerCase())
  ).length;
  
  // Check metrics for additional indicators
  const lowFrustration = metrics.frustration_index < 1.0;
  const highEngagement = metrics.engagement_index > 0.4;
  const highMindfulness = metrics.mindfulness_index > 15;
  
  // Determine if feedback is positive
  const isPositive = positiveStates >= 4 || 
                    (lowFrustration && highEngagement) || 
                    highMindfulness;
  
  // Generate a reason for the decision
  let reason = '';
  if (isPositive) {
    if (mental_state.relaxation === 'high') {
      reason = 'You seemed relaxed viewing this city';
    } else if (mental_state.engagement === 'high') {
      reason = 'You appeared engaged with this city';
    } else if (metrics.mindfulness_index > 20) {
      reason = 'This city captured your mindful attention';
    } else {
      reason = 'Your brain signals showed positive feedback';
    }
  } else {
    if (mental_state.frustration === 'high') {
      reason = 'You seemed frustrated viewing this city';
    } else if (mental_state.relaxation === 'low' && mental_state.concentration === 'low') {
      reason = 'You appeared disinterested in this city';
    } else if (metrics.engagement_index < 0.1) {
      reason = 'This city failed to engage your interest';
    } else {
      reason = 'Your brain signals showed negative feedback';
    }
  }
  
  return { isPositive, reason };
};

export const getNextActionText = (isPositive: boolean, reason: string): string => {
  if (isPositive) {
    return `Showing a city with similar vibe - ${reason}`;
  } else {
    return `Showing a different city - ${reason}`;
  }
};
