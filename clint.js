const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let server = require('./qr'),
    code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 100; // Reduced to prevent memory issues
app.use(express.static(path.join(__dirname))); // Serve static files
app.use('/qr', server);
app.use('/code', code);
app.use('/pair', async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, 'pair.html'));
  } catch (err) {
    console.error('Error serving pair.html:', err);
    res.status(500).send('Internal Server Error: Unable to load pair.html');
  }
});
app.use('/', async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, 'main.html'));
  } catch (err) {
    console.error('Error serving main.html:', err);
    res.status(500).send('Internal Server Error: Unable to load main.html');
  }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
  console.log(`
Don't Forget To Give Star

 Server running on http://localhost:${PORT}`);
});

module.exports = app;