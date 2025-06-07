const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Server is working nicely and correctly! 1000'));
// Middleware to parse JSON bodies
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

