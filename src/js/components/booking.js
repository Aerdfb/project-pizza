import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    const elementDom = utils.createDOMFromHTML(generatedHTML);
    console.log(elementDom);


    thisBooking.dom = {};
    thisBooking.dom.wrapper = element; 
    thisBooking.dom.peopleAmount = elementDom.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = elementDom.querySelector(select.booking.hoursAmount);
    
    element.appendChild(elementDom);


  }  

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }

}

export default Booking;