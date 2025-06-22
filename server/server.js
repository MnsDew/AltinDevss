const express = require('express');
const connectDB = require('./config/db'); // Import the database connection function
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


//example : http://localhost:4000/api/users , !!!!!! don't forget to add / before api!!!

app.use("/api/users", require("./routes/users")); // Import user routes
app.use("/api/posts", require("./routes/posts")); // Import post routes
app.use("/api/profiles", require("./routes/profiles")); // Import profile routes
connectDB(); // Call the function to connect to the database
// Middleware to handle JSON requests 
app.get('/', (req, res) => res.send('Server is working nicely and correctly! 1000'));
// Middleware to parse JSON bodies
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

