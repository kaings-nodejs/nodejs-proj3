const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// generates associations between Product and User. This will generate userId as foreignkey in Product
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'}); // ref: http://docs.sequelizejs.com/manual/associations.html
User.hasMany(Product); // this is optional, the above is enough. This is basically similar as the above line

// sync() creates model that is defined into connected database
sequelize
.sync({force: true})    // to force recreate all the tables. This will create `userId` column in the newly recreated Product table
.then(result => {
    console.log(result);
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});
