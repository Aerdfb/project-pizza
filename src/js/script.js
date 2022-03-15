/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      // console.log('new Product:', thisProduct);

      thisProduct.getElements();

      thisProduct.initOrderForm();

      thisProduct.initAmountWidget();

      thisProduct.processOrder();

      thisProduct.initAccordion();
      
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */

      const generatedHTML = templates.menuProduct(thisProduct.data);
      // console.log(generatedHTML);

      /*create element using utilis.createElementFromHTML */

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu containter */

      const menuContainter = document.querySelector(select.containerOf.menu);

      /* add element to menu */
    
      menuContainter.appendChild(thisProduct.element);
    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(clickableTrigger);
  
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        // console.log(activeProduct);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct != null && activeProduct != thisProduct.product ){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
  
    }

    initOrderForm(){
      const thisProduct = this;
      // console.log('start function initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    processOrder(){
      const thisProduct = this;
      // console.log('start function processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) {
            
            // check if the option is not default
            if(!option.default) {
              // add option price to price variable
              price += option.price;
              
            }
          } else {
            // check if the option is default
            if(option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
          const imageOption = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          // console.log(thisProduct.imageWrapper);

          if(imageOption){

            if(optionSelected){

              imageOption.classList.add(classNames.menuProduct.imageVisible);

            } else {

              imageOption.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }  
      // multiply price by amount
      price *= thisProduct.amountWidget.value;
      // console.log(price);

      thisProduct.priceSingle = price;
      // console.log(thisProduct.priceSingle);

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
      


    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
 
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepereCartProduct());
    }

    prepereCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams()
      };

      return productSummary;

    }

    prepareCartProductParams() {
      const thisProduct = this;
      // console.log('prepareCartProductParams');
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for (let optionId in param.options) {
          const option = param.options[optionId];
          // console.log(optionId, option);
          let optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }

    
  
  }
  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      
      // console.log('AmountWidet:', thisWidget);
      // console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      if (thisWidget.value !== newValue && !isNaN(newValue) && settings.amountWidget.defaultMin <= newValue && settings.amountWidget.defaultMax >= newValue) {
        
        thisWidget.value = newValue;
        // console.log(newValue);
        thisWidget.announce();
      }
      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        // console.log('change Work!:', thisWidget);
      });

      thisWidget.linkDecrease.addEventListener('click',function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
        // console.log('Decrease Work!:', thisWidget);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
        // console.log('increase Work!:', thisWidget);
      });

    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      
      thisCart.getElements(element);
      thisCart.initActions();

      // console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      // console.log(thisCart.dom.productList);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });

    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });
      // console.log('thisCart.products', thisCart.products);
    }
    
    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      // console.log(thisCart.deliveryFee);
      thisCart.totalNumber = 0;
      thisCart.subTotalPrice = 0;

      for(let productCart of thisCart.products){
        thisCart.totalNumber += productCart.amount;
        thisCart.subTotalPrice += productCart.price;
        // console.log('totalNumber', productCart);
      }

      if(thisCart.totalNumber === 0){
        thisCart.totalPrice = 0;
      } else{
        thisCart.totalPrice = thisCart.subTotalPrice + thisCart.deliveryFee;
        for (let price of thisCart.dom.totalPrice) {
          price.innerHTML = thisCart.totalPrice;
        }
      }

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

      // console.log('totalPrice', thisCart.totalPrice);
      // console.log('totalNumber', thisCart.totalNumber);
    }
    remove(cartProduct){
      const thisCart = this;
      const indexOfProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProduct, 1);
      cartProduct.dom.wrapper.remove();

      thisCart.update();

    }

    
    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;



      const payload = {};
      payload.address = thisCart.dom.address.value;
      payload.phone = thisCart.dom.phone.value;
      payload.totalPrice = thisCart.dom.totalPrice.innerHTML;
      payload.subtotalPrice = thisCart.dom.subTotalPrice.innerHTML;
      payload.totalNumber = thisCart.dom.totalNumber.innerHTML;
      payload.deliveryFee = thisCart.dom.deliveryFee.innerHTML;
      payload.products = [];
      console.log('payload', payload);

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
        console.log(payload.products.push(prod.getData()));
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }


  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      
      // console.log('thisCartProduct', thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);

    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        }, 
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
        console.log('remove product', thisCartProduct);
        
      });


    }

    getData(){
      const thisCartProduct = this;

      const orderProducts = {};

      orderProducts.id = thisCartProduct.id;
      orderProducts.name = thisCartProduct.name;
      orderProducts.amount = thisCartProduct.amountWidget.value;
      orderProducts.priceSingle = thisCartProduct.priceSingle;
      orderProducts.price = thisCartProduct.priceSingle;
      orderProducts.params = thisCartProduct.params;

      console.log('orderProducts', orderProducts);
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      // console.log('thisApp.data:', thisApp.data);
      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);

      }

    },

    initData: function(){
      const thisApp = this;
  
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          // console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products */

          thisApp.data.products = parsedResponse;

          /* execute initMenu method */

          thisApp.initMenu();
        });

      // console.log ('thisApp.data', JSON.stringify(thisApp.data));  
    },

    initCart: function(){
      const thisApp = this;
      
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      // thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
