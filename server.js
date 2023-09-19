const express = require('express');
const app = express();
const cors = require('cors');



//Require .env for configuration
require('dotenv').config();

const post = require('./controller/PostController.js');


app.use(express.json());
app.use(cors());
app.use('/post', post);

app.listen(process.env.SV_PORT, () => console.log(`Example app listening at http://localhost`));