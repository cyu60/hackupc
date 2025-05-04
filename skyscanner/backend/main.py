# -*- coding: utf-8 -*-
"""Estimate Relaxation from Band Powers with Enhanced Metrics and WebSocket Support

This example shows how to buffer, epoch, and transform EEG data from a single
electrode into values for each of the classic frequencies (e.g. alpha, beta, theta)
Furthermore, it shows how ratios of the band powers can be used to estimate
mental state for neurofeedback.

The neurofeedback protocols described here are inspired by
*Neurofeedback: A Comprehensive Review on System Design, Methodology and Clinical Applications* by Marzbani et. al

Extended with additional brain metrics and WebSocket support for real-time data streaming.

Adapted from https://github.com/NeuroTechX/bci-workshop
"""

import asyncio
import time

import numpy as np
from pylsl import StreamInlet, resolve_byprop  # Module to receive EEG data

import utils  # Our own utility functions
from demo_inlet import DemoInlet
from metrics_tracker import MetricsTracker
from ws_server import WebSocketServer


# Handy little enum to make code more readable
class Band:
    Delta = 0
    Theta = 1
    Alpha = 2
    Beta = 3


""" EXPERIMENTAL PARAMETERS """
# Modify these to change aspects of the signal processing

# Length of the EEG data buffer (in seconds)
# This buffer will hold last n seconds of data and be used for calculations
BUFFER_LENGTH = 5

# Length of the epochs used to compute the FFT (in seconds)
EPOCH_LENGTH = 1

# Amount of overlap between two consecutive epochs (in seconds)
OVERLAP_LENGTH = 0.8

# Amount to 'shift' the start of each next consecutive epoch
SHIFT_LENGTH = EPOCH_LENGTH - OVERLAP_LENGTH

# Index of the channel(s) (electrodes) to be used
# 0 = left ear, 1 = left forehead, 2 = right forehead, 3 = right ear
INDEX_CHANNEL = [0]

# WebSocket server settings
WS_HOST = "localhost"
WS_PORT = 8765


def calculate_extended_metrics(smooth_band_powers):
    """Calculate additional EEG metrics beyond the basic ones"""
    # Basic metrics (already in the original code)
    alpha_metric = smooth_band_powers[Band.Alpha] / smooth_band_powers[Band.Delta]
    beta_metric = smooth_band_powers[Band.Beta] / smooth_band_powers[Band.Theta]
    theta_metric = smooth_band_powers[Band.Theta] / smooth_band_powers[Band.Alpha]

    # Additional metrics:

    # 1. Engagement Index: Beta / (Alpha + Theta)
    # Higher values indicate higher engagement/attention
    engagement_index = smooth_band_powers[Band.Beta] / (smooth_band_powers[Band.Alpha] + smooth_band_powers[Band.Theta])

    # 2. Arousal Index: Beta / Alpha
    # Indicates cognitive arousal or alertness
    arousal_index = smooth_band_powers[Band.Beta] / smooth_band_powers[Band.Alpha]

    # 3. Frustration/Anxiety Index: (Beta + Theta) / Alpha
    # Higher values may indicate frustration or anxiety
    frustration_index = (smooth_band_powers[Band.Beta] + smooth_band_powers[Band.Theta]) / smooth_band_powers[
        Band.Alpha
    ]

    # 4. Mindfulness Index: Theta / Beta
    # Higher values may indicate a meditative or mindful state
    mindfulness_index = smooth_band_powers[Band.Theta] / smooth_band_powers[Band.Beta]

    return {
        "alpha_relaxation": alpha_metric,
        "beta_concentration": beta_metric,
        "theta_relaxation": theta_metric,
        "engagement_index": engagement_index,
        "arousal_index": arousal_index,
        "frustration_index": frustration_index,
        "mindfulness_index": mindfulness_index,
    }


if __name__ == "__main__":
    """ 1. CONNECT TO EEG STREAM """

    # Search for active LSL streams
    print("Looking for an EEG stream...")
    streams = resolve_byprop("type", "EEG", timeout=2)
    if len(streams) == 0:
        print("No EEG stream found. Switching to fake EEG data generator.")
        inlet = DemoInlet(fs=256)
        fs = inlet.info().nominal_srate()
        asyncio.sleep(10)
    else:
        inlet = StreamInlet(streams[0], max_chunklen=12)
        eeg_time_correction = inlet.time_correction()
        info = inlet.info()
        description = info.desc()
        fs = int(info.nominal_srate())

    """ 2. INITIALIZE BUFFERS AND SERVICES """

    # Initialize raw EEG data buffer
    eeg_buffer = np.zeros((int(fs * BUFFER_LENGTH), 1))
    filter_state = None  # for use with the notch filter

    # Compute the number of epochs in "buffer_length"
    n_win_test = int(np.floor((BUFFER_LENGTH - EPOCH_LENGTH) / SHIFT_LENGTH + 1))

    # Initialize the band power buffer (for plotting)
    # bands will be ordered: [delta, theta, alpha, beta]
    band_buffer = np.zeros((n_win_test, 4))

    # Initialize metrics tracker
    metrics_tracker = MetricsTracker()

    # Initialize and start WebSocket server
    ws_server = WebSocketServer(WS_HOST, WS_PORT)
    ws_thread = ws_server.start()
    print(f"WebSocket server running at ws://{WS_HOST}:{WS_PORT}")

    """ 3. GET DATA """

    # The try/except structure allows to quit the while loop by aborting the
    # script with <Ctrl-C>
    print("Press Ctrl-C in the console to break the while loop.")

    try:
        # Acquires data, computes band powers, and calculates neurofeedback metrics based on those band powers
        while True:
            """ 3.1 ACQUIRE DATA """
            eeg_data, timestamp = inlet.pull_chunk(timeout=1, max_samples=int(SHIFT_LENGTH * fs))
            ch_data = np.array(eeg_data)[:, INDEX_CHANNEL]  # Only keep the channel we're interested in
            eeg_buffer, filter_state = utils.update_buffer(eeg_buffer, ch_data, notch=True, filter_state=filter_state)

            """ 3.2 COMPUTE BAND POWERS """
            # Get the newest samples from the buffer
            data_epoch = utils.get_last_data(eeg_buffer, EPOCH_LENGTH * fs)

            # Compute band powers
            band_powers = utils.compute_band_powers(data_epoch, fs)
            band_buffer, _ = utils.update_buffer(band_buffer, np.asarray([band_powers]))
            # Compute the average band powers for all epochs in buffer
            # This helps to smooth out noise
            smooth_band_powers = np.mean(band_buffer, axis=0)

            """ 3.3 COMPUTE NEUROFEEDBACK METRICS """
            # Calculate all metrics (basic and extended)
            metrics = calculate_extended_metrics(smooth_band_powers)

            # Add metrics to tracker
            metrics_tracker.add_metrics(
                metrics["alpha_relaxation"],
                metrics["beta_concentration"],
                metrics["theta_relaxation"],
                metrics["engagement_index"],
                metrics["arousal_index"],
                metrics["frustration_index"],
                metrics["mindfulness_index"],
            )

            # Send real-time data via WebSocket
            ws_data = {"type": "real_time", "metrics": metrics, "timestamp": time.time()}
            ws_server.send_data(ws_data)

            # Check if we should generate and send a summary
            if metrics_tracker.should_summarize():
                summary = metrics_tracker.get_summary()
                print("\n=== SUMMARY ANALYSIS (Last 50 readings) ===")
                print(summary["metrics"])

                # Send summary via WebSocket
                ws_data = {"type": "summary", "metrics": summary["metrics"], "timestamp": time.time()}
                ws_server.send_data(ws_data)

    except KeyboardInterrupt:
        print("Closing!")
