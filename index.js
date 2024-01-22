const express = require('express');
const csdn = require('./csdn.js');
 
const app = express();
 
app.use(csdn);
 
app.listen(3000, function() {
  console.log('running in http://127.0.0.1:3000');
});