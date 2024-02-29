const connectToMongoDb = require('./db')

const express = require("express");
const cors = require('cors')

connectToMongoDb();
const app = express();
app.use(cors());

app.use(express.json());

app.use('/api/auth' , require('./routes/auth'))
app.use('/api/foodresp' , require('./routes/foodresp'))
app.use('/api/user' , require('./routes/user'))

var port = process.env.PORT || 4000;

app.listen(port,function(){
    console.log(`server is running on port ${port} `)
});