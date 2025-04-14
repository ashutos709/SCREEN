// This is a simple API endpoint for Vercel to test the deployment
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from SCREEN API!',
    timestamp: new Date().toISOString()
  });
}; 