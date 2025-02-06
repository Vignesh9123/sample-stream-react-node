import express from 'express';
import cors from 'cors';
import fs from 'fs';
import {
  TextRun,
  Packer,
  Document,
  Paragraph
} from 'docx'
const app = express();
const port = 3000;

app.use(cors({
  origin:"*"
}));
app.use(express.json());

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let count = 0;
  const maxEvents = 24; // 2 minutes with 5-second intervals
  
  const streamInterval = setInterval(async() => {
    if (count >= maxEvents) {
      clearInterval(streamInterval);

      const doc = new Document(
        {
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'This is a sample document.' })],
                }),
              ],
            },
          ],
        }
      );

      const buffer = await Packer.toBuffer(doc);
      const base64File = buffer.toString('base64');
      res.write(`data: ${JSON.stringify({ type: 'end', buffer: base64File })}\n\n`);
      res.end();      
      return;
    }

    const data = {
      type: 'data',
      timestamp: new Date().toISOString(),
      value: Math.random() * 100,
      progress: Math.round((count / maxEvents) * 100)
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
    count++;
  }, 5000); // Send data every 5 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(streamInterval);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});