import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

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

export default Cart;