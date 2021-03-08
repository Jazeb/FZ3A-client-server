const express = require("express");
var app = express();

app.get('/', (req, res) => res.status(200).json({ status: true, message: 'server is running' }));

module.exports = app;