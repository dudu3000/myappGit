const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const Sequelize = require('sequelize');



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
app.use(cors());


app.use('/', home);
app.use('/user', user);
app.use('/post', post);


//Error handling middleware
app.use(function(err, req, res, next){
    if(err instanceof Sequelize.ValidationError)
        res.status(422).send({error: 'Username or email already used!'});
    else if(err instanceof Sequelize.ForeignKeyConstraintError)
        res.status(422).send({error: 'You can not do this action with this account!'});
    else{
        res.status(422).send({error: err.message});
        console.log(err);
    }
});



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
