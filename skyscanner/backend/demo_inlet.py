import time

import numpy as np


class DemoInlet:
    def __init__(self, fs, num_channels=1):
        self.fs = fs
        self.num_channels = num_channels
        self.last_pull = time.time()

    def pull_chunk(self, timeout=1, max_samples=256):
        # Enforce real-time pacing
        expected_duration = max_samples / self.fs
        now = time.time()
        elapsed = now - self.last_pull
        delay = expected_duration - elapsed
        if delay > 0:
            time.sleep(delay)
        self.last_pull = time.time()

        # Generate fake EEG signal
        t = np.linspace(0, max_samples / self.fs, max_samples, endpoint=False)
        fake_signal = (
            10 * np.sin(2 * np.pi * 10 * t)  # Alpha (10 Hz)
            + 5 * np.sin(2 * np.pi * 20 * t)  # Beta (20 Hz)
            + 3 * np.random.randn(max_samples)  # Noise
        )
        data = np.expand_dims(fake_signal, axis=1)  # Shape (samples, 1 channel)
        timestamps = list(self.last_pull + t)
        return data.tolist(), timestamps

    def time_correction(self):
        return 0.0

    def info(self):
        class Info:
            def nominal_srate(self_inner):
                return self.fs

            def desc(self_inner):
                return {}

        return Info()
