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
import json
import threading
import time
from collections import deque

import numpy as np
import websockets
from pylsl import StreamInlet, resolve_byprop  # Module to receive EEG data

import utils  # Our own utility functions


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

# Tracking iterations for summary analysis
SUMMARY_INTERVAL = 50


# Store metrics for summary analysis
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


# WebSocket server to broadcast EEG metrics
class WebSocketServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.clients = set()
        self.latest_data = None
        self.server = None
        self.server_task = None

    async def ws_handler(self, websocket, path):
        """Handle WebSocket connections"""
        # Register client
        self.clients.add(websocket)
        try:
            # If we have data already, send it immediately to the new client
            if self.latest_data:
                await websocket.send(self.latest_data)

            # Keep connection alive and handle incoming messages if needed
            async for message in websocket:
                # Handle any client messages if necessary
                pass
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            # Unregister client
            self.clients.remove(websocket)

    async def broadcast(self, message):
        """Broadcast message to all connected clients"""
        if not self.clients:
            return

        # Store latest data
        self.latest_data = message

        # Send to all clients
        disconnected_clients = set()
        for client in self.clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)

        # Remove disconnected clients
        for client in disconnected_clients:
            self.clients.remove(client)

    async def start_server(self):
        """Start the WebSocket server"""
        self.server = await websockets.serve(self.ws_handler, self.host, self.port)
        print(f"WebSocket server started at ws://{self.host}:{self.port}")
        await self.server.wait_closed()

    def run_server(self):
        """Run the server in a separate thread with its own event loop"""
        asyncio.set_event_loop(asyncio.new_event_loop())
        loop = asyncio.get_event_loop()
        self.server_task = loop.create_task(self.start_server())
        loop.run_forever()

    def start(self):
        """Start the WebSocket server in a background thread"""
        thread = threading.Thread(target=self.run_server, daemon=True)
        thread.start()
        return thread

    def send_data(self, data):
        """Send data to all clients"""
        json_data = json.dumps(data)
        asyncio.run(self.broadcast(json_data))


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
        raise RuntimeError("Can't find EEG stream.")

    # Set active EEG stream to inlet and apply time correction
    print("Start acquiring data")
    inlet = StreamInlet(streams[0], max_chunklen=12)
    eeg_time_correction = inlet.time_correction()

    # Get the stream info and description
    info = inlet.info()
    description = info.desc()

    # Get the sampling frequency
    # This is an important value that represents how many EEG data points are
    # collected in a second. This influences our frequency band calculation.
    # for the Muse 2016, this should always be 256
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
            # Obtain EEG data from the LSL stream
            eeg_data, timestamp = inlet.pull_chunk(timeout=1, max_samples=int(SHIFT_LENGTH * fs))

            # Only keep the channel we're interested in
            ch_data = np.array(eeg_data)[:, INDEX_CHANNEL]

            # Update EEG buffer with the new data
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
                print(
                    f"Average Alpha Relaxation: {summary['metrics']['alpha_relaxation']:.2f} - {summary['mental_state']['relaxation']}"
                )
                print(
                    f"Average Beta Concentration: {summary['metrics']['beta_concentration']:.2f} - {summary['mental_state']['concentration']}"
                )
                print(
                    f"Average Theta Calm: {summary['metrics']['theta_relaxation']:.2f} - {summary['mental_state']['calm']}"
                )
                print(
                    f"Average Engagement: {summary['metrics']['engagement_index']:.2f} - {summary['mental_state']['engagement']}"
                )
                print(
                    f"Average Arousal: {summary['metrics']['arousal_index']:.2f} - {summary['mental_state']['arousal']}"
                )
                print(
                    f"Average Frustration: {summary['metrics']['frustration_index']:.2f} - {summary['mental_state']['frustration']}"
                )
                print(
                    f"Average Mindfulness: {summary['metrics']['mindfulness_index']:.2f} - {summary['mental_state']['mindfulness']}"
                )
                print("==============================================\n")

                # Send summary via WebSocket
                ws_data = {"type": "summary", "data": summary}
                print(ws_data)
                ws_server.send_data(ws_data)

    except KeyboardInterrupt:
        print("Closing!")
