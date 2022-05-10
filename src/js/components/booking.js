import {classNames, select, settings, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';



class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
    thisBooking.selectedTable = '';
  }

  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log(params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    // fetch(urls.booking)
    //   .then(function(bookingResponse){
    //     return bookingResponse.json();
    //   })
    //   .then(function(bookings){
    //     console.log(bookings);
    //   });
    // console.log('getData urls', urls);


    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])

      .then(function(allResponses){
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]); 
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log(thisBooking.booked);
    
    thisBooking.updateDOM();
    
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);



    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hoursPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    
  

  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    const elementDom = utils.createDOMFromHTML(generatedHTML);
    // console.log(elementDom);


    thisBooking.dom = {};
    thisBooking.dom.wrapper = element; 
    thisBooking.dom.peopleAmount = elementDom.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = elementDom.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateWrapper = elementDom.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hoursWrapper = elementDom.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = elementDom.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesPlan = elementDom.querySelector(select.booking.tablesPlan);
    thisBooking.dom.phone = elementDom.querySelector(select.booking.phone);
    thisBooking.dom.adress = elementDom.querySelector(select.booking.address);
    thisBooking.dom.starters = elementDom.querySelectorAll(select.booking.starters);
    thisBooking.dom.form = elementDom.querySelector(select.booking.form);

    element.appendChild(elementDom);

    console.log(thisBooking.dom);

  }  

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateWrapper);
    thisBooking.hoursPicker = new HourPicker(thisBooking.dom.hoursWrapper);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.resetTable();
    
    
    });
    thisBooking.dom.tablesPlan.addEventListener('click', function(event){
      event.preventDefault;
      thisBooking.initTables(event);
      console.log(thisBooking.selectedTable);
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
      console.log('wysłany order');
    });
  }

  initTables(event){
    const thisBooking = this;
    console.log(event);

    // console.log(thisBooking);

    thisBooking.resetTable();
    const clickedElement = parseInt(event.target.getAttribute('data-table'));

      
      
    if(event.target.classList.contains('table') 
      && !event.target.classList.contains('booked')){

      thisBooking.selectedTable = clickedElement;
      event.target.classList.add('selected');
      console.log(thisBooking.selectedTable);

    } else if(event.target.classList.contains('selected')) {
      console.log(event.target);
    } else if(event.target.classList.contains('booked')){
      alert('to miejsvce jest już zajęte!');
    } 
    
  }

  resetTable(){
    const thisBooking = this;

    for(let table of thisBooking.dom.tables){
      table.classList.remove('selected');
    }

  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {};
    payload.date = thisBooking.datePicker.value;
    payload.hour = thisBooking.hoursPicker.value;
    payload.table = thisBooking.selectedTable;
    payload.duration = thisBooking.hoursAmount.value;
    payload.ppl = thisBooking.peopleAmount.value;
    payload.starters = [];
    payload.phone = thisBooking.dom.phone.value;
    payload.adress = thisBooking.dom.adress.value;
    
    console.log(thisBooking.dom.starters);
    for (let starter of thisBooking.dom.starters){
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);

    console.log(thisBooking.booked);

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

export default Booking;