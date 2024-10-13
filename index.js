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
const app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/profile-image',  profileImage);
app.use('/api/usersads', userAds);
app.use('/api/userlogin' ,userLogin);
app.use('/api/allads', productList);
app.use('/api/viewsads', myAdsRouter);
app.use('/api/deletead', adDelete);
app.use('/api/product/details',ProductDetailsRouter );
app.use('/api/product/details/others',OtherRelatedProductRouter );
app.use('/api/user-profile-image', userProfileImage );
app.use('/api/userproducts/solded', soldOutRouter );
app.use('/api/usercart/item', userCartItem );
app.use('/api/usercart/navigate', cartItemRouter );
app.use('/api/security', PasswordChangeRouter);












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


