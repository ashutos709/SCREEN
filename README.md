# Screen Sharing Application

A real-time screen sharing application with authentication.

## Features
- User authentication (login/signup)
- Google Sign-in
- Screen sharing functionality
- Real-time communication

## Setup
1. Clone the repository:
```bash
git clone [your-repo-url]
cd screen-sharing-app
```

2. Install dependencies:
```bash
npm install
cd log && npm install
cd ../SCREEN && npm install
```

3. Start the application:
```bash
npm start
```

This will start both the authentication server (port 8080) and the screen sharing application (port 3010).

## Usage
1. Open http://localhost:8080 in your browser
2. Log in or sign up
3. You will be automatically redirected to the screen sharing application at http://localhost:3010

## Technologies Used
- React
- Node.js
- Supabase (Authentication)
- WebRTC (Screen Sharing)
- Material-UI
- Vite 