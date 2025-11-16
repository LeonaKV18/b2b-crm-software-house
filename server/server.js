const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const database = require('./config/database');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// // Initialize Oracle DB
// database.initialize();

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running with Oracle DB' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
// process.on('SIGINT', async () => {
//   await database.close();
//   process.exit(0);
// });