const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {   // this will be run when there is any incoming request. it is put on top of all routes. All incoming request will trigger this middleware
    User.findByPk(1)
    .then(user => {
        req.user = user;    // store sequelize object "user" into "req.user" so that it can be called/used globally
        next();     // move to the next middleware
    })
    .catch(err => {console.log(err)});
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// generates associations between Product and User. This will generate userId as foreignkey in Product
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'}); // ref: http://docs.sequelizejs.com/manual/associations.html
User.hasMany(Product); // this is optional, the above is enough. This is basically similar as the above line

Cart.belongsTo(User);   // one-to-one. Either one is OK
User.hasOne(Cart);      // one-to-one. Either one is OK

// many-to-many
Cart.belongsToMany(Product, { through: CartItem });  
Product.belongsToMany(Cart, { through: CartItem });

// sync() creates model that is defined into connected database
sequelize
.sync({force: true})    // to force recreate all the tables. This will create `userId` column in the newly recreated Product table
//.sync()
.then(result => {
    User.findByPk(1)
    .then(user => {
        if (!user) {
            return User.create({
                name: 'Will',
                email: 'will@test.com'
            });
        }
        return user;
    })
    .then(user => {
        console.log(user);
        app.listen(3000);
    })
    .catch(err => {console.log(err)});
})
.catch(err => {
    console.log(err);
});
