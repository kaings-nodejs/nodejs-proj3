const Product = require('../models/product');
const Cart = require('../models/cart');
const User = require('../models/user');
const CartItem = require('../models/cart-item');

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findByPk(prodId)
  .then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch(err => {
    console.log(err);
  });

// the following approach also works the same
/* 
  Product.findAll({where: {id: prodId}})
  .then(products => {
    res.render('shop/product-detail', {
      product: products[0],
      pageTitle: products[0].title,
      path: '/products'
    });
  })
  .catch(err => {console.log(err)});
   */
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
  .then(products => {
    //console.log(products)
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => {
    console.log(err)
  });
};

exports.getCart = (req, res, next) => {
  req.user
  .getCart()
  .then(cart => {
    console.log('getCart_cart.....', cart);
    return cart.getCopy_sqlz_products();
  })
  .then(products => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  })
  .catch(err => {console.log(err)});
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let qty = 1;

  req.user
  .getCart()
  .then(cart => {
    //console.log('postCart_cart.....', cart);
    fetchedCart = cart;
    cart
    .getCopy_sqlz_products({ where: { id: prodId } })
    .then(products => {
      console.log('postCart_products..... ', products)
      if (products.length > 0) {
        const product = products[0];
        qty += product.cartItem.quantity;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      fetchedCart.addCopy_sqlz_product(product, {
        through: { quantity: qty }
      });
    })
    .then(result => {
      console.log('postCart_result..... ', result);
      res.redirect('/cart');
    })
    .catch(err => {console.log(err)})
  })
  .catch(err => {console.log(err)})
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
  .getCart()
  .then(cart => {
    console.log('postCartDeleteProduct_cart..... ', cart);
    return cart.getCopy_sqlz_products({where: {id: prodId}});
  })
  .then(products => {
    console.log('postCartDeleteProduct_products..... ', products);
    console.log('postCartDeleteProduct_product.cartItem..... ', products[0].cartItem);
    const product = products[0];
    return product.cartItem.destroy();
  })
  .then(result => {
    console.log('result..... ', result);
    res.redirect('/cart');
  })
  .catch(err => {console.log(err)})
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
  .getCart()
  .then(cart => {
    fetchedCart = cart;

    console.log('postOrder_cart..... ', cart);
    console.log('postOrder_cart.cartItem..... ', cart.cartItem); // undefined
    return cart.getCopy_sqlz_products();
  })
  .then(products => {
    console.log('postOrder_products..... ', products);
    products.map(product => {console.log('postOrder_product.cartItem..... ', product.cartItem.quantity)}); // cartItem can be accessed via product

    return req.user
    .createOrder()
    .then(order => {
      return order.addCopy_sqlz_products(products.map(product => {
        product.orderItem = {quantity: product.cartItem.quantity};
        return product;
      }));
    })
    .then(result => {
      fetchedCart.setCopy_sqlz_products(null);

      res.redirect('/orders');
    })
    .catch(err => {console.log(err)});
  })
  .catch(err => {console.log(err)})
};

exports.getOrders = (req, res, next) => {
  req.user
  .getOrders({include: ['copy_sqlz_products']})
  .then(orders => {
    console.log('getOrders_orders..... ', orders);
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })

  
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
