import { select, templates, classNames } from '../settings.js';
import utils from '../utils.js';
import Flickity from '../../vendor/flickity.pkgd.js';


class HomePage {
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    // console.log('home js dziala');
    thisHome.initWidgets();
    thisHome.initLinks();

  }


  render(element){
    const thisHome = this;
    const generatedHTML = templates.homeSite();
    const elementDom = utils.createDOMFromHTML(generatedHTML);
    // console.log(generatedHTML);

    thisHome.dom = {};

    thisHome.dom.wrapper = element;
    thisHome.dom.carousel = elementDom.querySelector(select.widgets.carousel.wrapper);
    thisHome.dom.boxLinks = elementDom.querySelectorAll(select.home.boxLinks);
    element.appendChild(elementDom);


    

  }

  initLinks(){
    const thisHome = this;

    for(let link of thisHome.dom.boxLinks){
      
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        // console.log(thisHome.dom.boxLinks);

        const id = clickedElement.getAttribute('href').replace('#', '');
        
        /* run thisHome.activatePage with that id */ 

        thisHome.activatePage(id);

        /* change URL hash */

        // window.location.hash = '#/' + id;
      });
    }
  }
  // /* add class "active" to matching pages, remove fron non-matching */

  activatePage(pageId){
    const thisHome = this;
    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navlinks = document.querySelectorAll(select.nav.links);

    /* add class "active" to matching pages, remove fron non-matching */
    for(let page of thisHome.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
  
    /* add class "active" to matching links, remove fron non-matching */
  
    for(let link of thisHome.navlinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  }

  initWidgets(){
    const thisHome = this;

    thisHome.flickity = new Flickity (thisHome.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      prevNextButtons: false,
      wrapAround: true,
      imagesLoaded: true,
      autoPlay: 4000,
    });
  }

  //   initWidgets(){
  //     const thisHome = this;

      

//     thisHome.flickity = new Flickity (thisHome.dom.carousel, {
//       cellAlign: 'left',
//       contain: true,
//       prevNextButtons: false,
//       wrapAround: true,
//       autoPlay: 3000,
//     });
//   }
}

export default HomePage;
      
