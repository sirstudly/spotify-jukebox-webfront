/*
 * Bootstrap for Plesk
 * https://stackoverflow.com/questions/51228526/deploying-a-create-react-app-to-plesk-onyx
 */
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 3001);