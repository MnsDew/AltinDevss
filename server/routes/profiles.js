const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation    

router.get('/', (req, res) => {
  res.send('Profile route is working correctly!');
}); 

module.exports = router;  