const express = require ("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require('./middleware/errorHandler');
require('express-async-errors');

const userLogin= require('./routers/UserLoginRouter')

const bodyParser = require('body-parser');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000' // Allow only this origin
  }));
  

require('dotenv').config();

app.use(bodyParser.json());





const PORT = process.env.PORT || 3000;

app.use(express.json());



app.use(process.env.API_V4_OAUTH,userLogin);




app.get('/', (req, res) => {
    res.send('Hello from Express');
  });












const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL,{
           
        })
        console.log("MongoDb Connected");
    
        
    } catch (error) {
        console.error("Eorror While Connecting", error)
        
    }

}

// Start server and connect to DB
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
  });


