import express from 'express';
import cors from 'cors';
import { Readable } from 'stream';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/stream', (req, res) => {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Duration for streaming (2 minutes)
  const streamDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
  const endTime = Date.now() + streamDuration; // Calculate the end time
  
  let count = 0;

  // Stream data every 5 seconds for 2 minutes
  const streamInterval = setInterval(() => {
    // Check if the streaming time has passed
    if (Date.now() >= endTime) {
      clearInterval(streamInterval);
      res.write('data: "Streaming ended"\n\n'); // End the stream
      res.end();
      return;
    }

    // Send dummy data (you can replace this with actual data)
    const dummyData = {
      type: 'data',
      timestamp: new Date().toISOString(),
      value: Math.random() * 100, // Random value for demonstration
      progress: Math.round((count / 24) * 100), // Assuming 24 intervals in 2 minutes
    };

    res.write(`data: ${JSON.stringify(dummyData)}\n\n`);
    count++;
  }, 5000); // Send data every 5 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(streamInterval);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
