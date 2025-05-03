import time
from collections import deque

import numpy as np

# Tracking iterations for summary analysis
SUMMARY_INTERVAL = 50


class MetricsTracker:
    def __init__(self, max_size=SUMMARY_INTERVAL):
        self.alpha_relaxation = deque(maxlen=max_size)
        self.beta_concentration = deque(maxlen=max_size)
        self.theta_relaxation = deque(maxlen=max_size)
        self.engagement_index = deque(maxlen=max_size)
        self.arousal_index = deque(maxlen=max_size)
        self.frustration_index = deque(maxlen=max_size)
        self.mindfulness_index = deque(maxlen=max_size)
        self.iterations = 0

    def add_metrics(self, alpha, beta, theta, engagement, arousal, frustration, mindfulness):
        self.alpha_relaxation.append(alpha)
        self.beta_concentration.append(beta)
        self.theta_relaxation.append(theta)
        self.engagement_index.append(engagement)
        self.arousal_index.append(arousal)
        self.frustration_index.append(frustration)
        self.mindfulness_index.append(mindfulness)
        self.iterations += 1

    def should_summarize(self):
        return self.iterations % SUMMARY_INTERVAL == 0 and self.iterations > 0

    def get_summary(self):
        """Generate a summary of the mental state based on accumulated metrics"""
        avg_alpha = np.mean(self.alpha_relaxation)
        avg_beta = np.mean(self.beta_concentration)
        avg_theta = np.mean(self.theta_relaxation)
        avg_engagement = np.mean(self.engagement_index)
        avg_arousal = np.mean(self.arousal_index)
        avg_frustration = np.mean(self.frustration_index)
        avg_mindfulness = np.mean(self.mindfulness_index)

        # Determine overall mental state
        mental_state = {
            "relaxation": "high" if avg_alpha > 1.5 else "medium" if avg_alpha > 1.0 else "low",
            "concentration": "high" if avg_beta > 1.5 else "medium" if avg_beta > 1.0 else "low",
            "calm": "high" if avg_theta > 1.2 else "medium" if avg_theta > 0.8 else "low",
            "engagement": "high" if avg_engagement > 1.5 else "medium" if avg_engagement > 1.0 else "low",
            "arousal": "high" if avg_arousal > 1.5 else "medium" if avg_arousal > 1.0 else "low",
            "frustration": "high" if avg_frustration > 1.5 else "medium" if avg_frustration > 1.0 else "low",
            "mindfulness": "high" if avg_mindfulness > 1.5 else "medium" if avg_mindfulness > 1.0 else "low",
        }

        return {
            "metrics": {
                "alpha_relaxation": float(avg_alpha),
                "beta_concentration": float(avg_beta),
                "theta_relaxation": float(avg_theta),
                "engagement_index": float(avg_engagement),
                "arousal_index": float(avg_arousal),
                "frustration_index": float(avg_frustration),
                "mindfulness_index": float(avg_mindfulness),
            },
            "mental_state": mental_state,
            "timestamp": time.time(),
            "iterations_analyzed": SUMMARY_INTERVAL,
        }
