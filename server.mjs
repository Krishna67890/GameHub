import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import history from 'connect-history-api-fallback';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable history API fallback
app.use(history({
  index: '/index.html',
  verbose: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err.message);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see your application`);
});