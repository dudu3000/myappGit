const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

//Require .env for configuration
require('dotenv').config();

//Require every controller and the index fo db
const home = require('./controller/HomeController.js');
const user = require('./controller/UserController.js');
const post = require('./controller/PostController.js');
const db = require('./db/index.js');


//Parsing JSON
app.use(express.json());
app.use(fileUpload());

app.use('/', home);
app.use('/user', user);
app.use('/post', post);



//Establish db connection and stop the server if the connection fails.
//!db.sequelize.authenticate().then((force)
db.sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
    //Listen for requests
    app.listen(process.env.SV_PORT, () => console.log(`Example app listening at http://localhost`));
}).catch(err => {
    console.error('Unable to connect to the database:', err);
    return process.exit(22);
});
