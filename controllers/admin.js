const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // to create data to populate in the database table
  /* using Magic Association method. Since User hasMany Product/ Product belongsTo User.
  Sequelize automatically generates this createProduct() 
  (in our case since the DB is named 'copy_sqlz_product', the func is createCopy_sqlz_product()) in User model which we can use to 
  create new product without having to manually specify the foreignkey. Previously, we have set globally the user in
  app.js. Now, we can create product which belongs to that user as follows (we do not need to manually set the userId foreignkey) */
  req.user.createCopy_sqlz_product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  })
  .then(result => {
    console.log(result);
    res.redirect('/');
  })
  .catch(err => {
    console.log(err);
  });

  console.log('user..... ', req.user.__proto__);  // to console.log all the Magic Methods
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;

  req.user
  .getCopy_sqlz_products({ where: {id: prodId} })
  .then(products => {
    if (!products) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: products[0]
    });
  })
  .catch(err => {console.log(err)});
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  // way 1 to update DB content

  Product.findByPk(prodId)
  .then(product => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;

    return product.save();   // save the data to DB, if the product does not exist, it will create new one (same as create)
  })
  .then(result => {
    console.log(result);
    res.redirect('/admin/products');
  })
  .catch(err => {console.log(err)});
  

  // way 2 to update DB content
  /*
  Product.findByPk(prodId)
  .then(product => {

    const updatedProduct = {
      title: updatedTitle,
      price: updatedPrice,
      description: updatedDesc,
      imageUrl: updatedImageUrl
    }

    return product.update(updatedProduct);  // update DB. ref: http://docs.sequelizejs.com/manual/instances.html#updating---saving---persisting-an-instance
  })
  .then(result => {
    console.log(result);
    res.redirect('/admin/products');
  })
  .catch(err => {console.log(err)});
  */

};

exports.getProducts = (req, res, next) => {
  req.user
  .getCopy_sqlz_products()
  .then(products => {
    console.log('getProducts..... ', products);

    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err => {console.log(err)});
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId);
  res.redirect('/admin/products');
};
