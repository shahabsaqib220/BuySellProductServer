const express = require ("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require('./middleware/errorHandler');
require('express-async-errors');
const authRoutes = require('./routers/registrationUserRouter');
const loginUser = require("./routers/UserLoginRouter")
const profileImage = require("./routers/ProfileImageUserRouter");
const authMiddleware = require('./middleware/authMiddleware')
const userAds = require('./routers/UsersAdsRouter')
const userLogin= require('./routers/UserLoginRouter')
const adDelete = require("./routers/DeleteUserAdRouter")
const productList = require('./routers/ProductListRouter')
const OtherRelatedProductRouter = require("./routers/OtherRelatedProductRouter")
const myAdsRouter = require('./routers/UserViewAdsRouter')
const ProductDetailsRouter = require('./routers/ProductDetailsRouter')
const userProfileImage = require('./routers/userProfileImageRouter')
const bodyParser = require('body-parser');
const soldOutRouter = require("./routers/UserSoldOutProductRouter")
const userCartItem = require("./routers/UserCartItemRouter")
const cartItemRouter = require("./routers/CartItemNavigatiorRouter")
const PasswordChangeRouter = require("./routers/PasswordChangeRouter")
const FilteredAdsRouter = require("./routers/FiteredAdsRouter")
const CatagoryAdsRouter = require("./routers/CatagoryAdsRouter")
const UserForgetPasswordRouter = require("./routers/UserForgetPasswordRouter")
const app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());





const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());



app.use(process.env.API_V1_OAUTH, authRoutes);
app.use(process.env.API_V2_OAUTH,  profileImage);
app.use(process.env.API_V3_OAUTH, userAds);
app.use(process.env.API_V4_OAUTH,userLogin);
app.use(process.env.API_V5_OAUTH, productList);
app.use(process.env.API_V6_OAUTH, myAdsRouter);
app.use(process.env.API_V7_OAUTH, adDelete);
app.use(process.env.API_V8_OAUTH,ProductDetailsRouter );
app.use(process.env.API_V9_OAUTH,OtherRelatedProductRouter );
app.use(process.env.API_V10_OAUTH, userProfileImage );
app.use(process.env.API_V11_OAUTH, soldOutRouter );
app.use(process.env.API_V12_OAUTH, userCartItem );
app.use(process.env.API_V13_OAUTH, cartItemRouter );
app.use(process.env.API_V14_OAUTH, PasswordChangeRouter);
app.use(process.env.API_V15_OAUTH,CatagoryAdsRouter)
app.use(process.env.API_V16_OAUTH,FilteredAdsRouter)
app.use(process.env.API_V17_OAUTH,UserForgetPasswordRouter)




app.get('/', (req, res) => {
    res.send('Hello from Express');
  });











  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_DB_URL, {
   
      });
      console.log("MongoDB Connected");
    } catch (error) {
      console.error("Error While Connecting", error);
    }
  };


  app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
    connectDB();
    console.log("All Done")
});

module.exports = (req, res) => {
  res.status(200).json({ message: "Hello from the API!" });
};

  
  




