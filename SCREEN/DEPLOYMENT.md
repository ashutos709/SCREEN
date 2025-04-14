# SCREEN Deployment Guide for Render.com

This guide will help you deploy the SCREEN WebRTC application on Render.com, which is a free alternative to Vercel that better supports WebRTC and Socket.io applications.

## Prerequisites

- A GitHub account with your SCREEN repository
- A Render.com account (free)

## Deployment Steps

1. **Sign up for Render.com**
   - Go to [render.com](https://render.com) and create an account
   - Connect your GitHub account

2. **Create a New Web Service**
   - Click "New" and select "Web Service"
   - Connect your GitHub repository containing the SCREEN application

3. **Configure the Web Service**
   - Name: `screen-webrtc` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. **Add Environment Variables**
   - Click on "Environment" tab
   - Add all the environment variables from your `.env` file
   - Make sure to update any URLs to point to your Render deployment

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application

## Important Configuration Notes

### WebRTC Configuration

For WebRTC to work properly on Render, you need to ensure:

1. **TURN/STUN Servers**: Configure your TURN/STUN servers in your environment variables
2. **WebRTC Ports**: Render automatically handles port mapping, but make sure your application is listening on the port provided by the `PORT` environment variable

### Socket.io Configuration

For Socket.io to work properly:

1. Make sure your Socket.io client is configured to use the correct URL
2. Update any hardcoded URLs in your code to use environment variables

## Troubleshooting

If you encounter issues with WebRTC or Socket.io:

1. Check the Render logs for any errors
2. Verify that your environment variables are correctly set
3. Ensure your client-side code is using the correct URLs for the deployed application

## Scaling

The free tier of Render has limitations. If you need to scale:

1. Consider upgrading to a paid plan
2. Implement load balancing if needed
3. Use a CDN for static assets

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [WebRTC Best Practices](https://webrtc.org/getting-started/overview)
- [Socket.io Deployment Guide](https://socket.io/docs/v4/deployment/) 