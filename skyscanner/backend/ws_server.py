import asyncio
import json
import threading

import websockets


class WebSocketServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.clients = set()
        self.latest_data = None
        self.server = None
        self.server_task = None

    async def ws_handler(self, websocket):
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
