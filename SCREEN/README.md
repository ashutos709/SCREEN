# SCREEN WebRTC Implementation Analysis

## Architecture Overview

SCREEN uses a Selective Forwarding Unit (SFU) architecture for WebRTC communication, primarily implemented using the **mediasoup** library. The application follows a client-server model where:

1. **Client-side**: Implemented in `RoomClient.js` using mediasoup-client
2. **Server-side**: Implemented in `Server.js` and `Room.js` using mediasoup

## Key Components

### Server Components

1. **Server.js**: 
   - Main entry point for the application
   - Sets up Express server, Socket.IO for signaling
   - Manages HTTP endpoints and Socket.IO event handlers
   - Handles room creation and management

2. **Room.js**:
   - Manages a single WebRTC room
   - Creates and manages mediasoup router
   - Handles WebRTC transports, producers, and consumers
   - Implements room features like locking, lobbies, and chat

3. **Peer.js** (not fully examined):
   - Represents a single participant in a room
   - Manages user's transports, producers, and consumers

### Client Components

1. **RoomClient.js**:
   - Establishes connection with the server using Socket.IO
   - Creates and manages local media streams (audio, video, screen)
   - Sets up WebRTC transports, producers, and consumers
   - Handles UI events and updates

2. **MediasoupClient.js**:
   - A compiled version of the mediasoup-client library
   - Used by the browser to communicate with the mediasoup server

## WebRTC Flow Implementation

### 1. Connection Establishment

- When a user joins a room, the client connects to the server via Socket.IO
- The server creates a mediasoup router for the room if not already exists
- The client loads the mediasoup-client library

### 2. Device Loading and RTP Capabilities Exchange

- The client loads a mediasoup Device
- The client retrieves RTP capabilities from the server's router
- The client loads the device with the server's RTP capabilities

### 3. Transport Creation

- **Producer Transport** (client → server):
  - Client requests a WebRTC transport from the server
  - Server creates a transport using `router.createWebRtcTransport()` with ICE, DTLS parameters
  - Transport parameters are sent back to the client
  - Client creates a send transport with the received parameters

- **Consumer Transport** (server → client):
  - Similar process but for receiving media
  - Client creates a receive transport with parameters from the server

### 4. Media Production and Consumption

- **Production**:
  - Client gets local media streams (getUserMedia for camera/mic, getDisplayMedia for screen)
  - Client creates producers for audio/video/screen using the producer transport
  - On successful producer creation, other peers are notified

- **Consumption**:
  - When a new producer is added, all other peers are notified
  - Each peer creates a consumer for the new producer
  - The consumer is connected to the consumer transport
  - Media begins flowing from producer to consumers through the SFU

### 5. Connection Monitoring and Recovery

- The implementation includes ICE connection monitoring
- Reconnection logic for handling network issues
- Connection state change handlers for both transports

## Advanced Features

1. **Audio Level Observation**:
   - Tracks active speakers using mediasoup's AudioLevelObserver
   - Sends volume information to all clients

2. **Media Codecs**:
   - Supports VP8, VP9, H264, and AV1 codecs
   - Includes force options for specific codecs

3. **Simulcast**:
   - Implements video simulcast for different quality levels
   - Configurable number of simulcast streams for webcam and screen sharing

4. **RTMP Streaming**:
   - Supports streaming to RTMP servers
   - Can stream from files or URLs

5. **Recording**:
   - Client-side recording capability
   - Server-side recording syncing

## Summary

The SCREEN application implements a comprehensive WebRTC solution using mediasoup's SFU architecture. It provides a robust infrastructure for video conferencing with features like simulcast, active speaker detection, and various media codec options. The codebase is well-structured with separation between client and server components and includes error handling and connection recovery mechanisms.

The implementation is designed to handle multiple participants efficiently by using the SFU architecture, which is more scalable than mesh networks for multi-party video conferencing. 