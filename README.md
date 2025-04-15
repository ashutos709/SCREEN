# Screen Sharing Application

A real-time screen sharing application with authentication.

## Features

- User authentication with email/password and Google sign-in
- Real-time screen sharing
- Room creation and joining
- Secure authentication flow
- Automatic port management
- Health monitoring endpoints

## Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your configuration:
   ```
   # Copy from .env.example or use the provided values
   ```

## Running the Application

Start both the authentication and screen sharing applications:

```bash
npm start
```

This will start:
- Authentication server at http://localhost:8080
- Screen sharing server at http://localhost:3010

## Development

Run in development mode with hot reloading:
```bash
npm run dev
```

## Troubleshooting

1. Port conflicts:
   - The application will automatically try alternative ports if the default ones are in use
   - You can also specify custom ports in the `.env` file

2. Authentication issues:
   - Check if the authentication server is running
   - Verify your credentials
   - Clear browser cookies and try again

3. Screen sharing issues:
   - Ensure you have granted the necessary permissions
   - Check your browser's compatibility
   - Verify your network connection

## License

MIT 