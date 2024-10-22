const express = require("express");
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
const CatagoryAdsRouter = require("./routers/CatagoryAdsRouter")
const app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/v1/oauth', authRoutes);
app.use('/api/v2/oauth',  profileImage);
app.use('/api/v3/oauth', userAds);
app.use('/api/v4/oauth', userLogin);
app.use('/api/v5/oauth', productList);
app.use('/api/v6/oauth', myAdsRouter);
app.use('/api/v7/oauth', adDelete);
app.use('/api/v8/oauth', ProductDetailsRouter);
app.use('/api/v9/oauth', OtherRelatedProductRouter);
app.use('/api/v10/oauth', userProfileImage);
app.use('/api/v11/oauth', soldOutRouter);
app.use('/api/v12/oauth', userCartItem);
app.use('/api/v13/oauth', cartItemRouter);
app.use('/api/v14/oauth', PasswordChangeRouter);
app.use('/api/v15/oauth', CatagoryAdsRouter);

app.use(authMiddleware); // Add authentication middleware
app.use(errorHandler); // Add error handling middleware

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