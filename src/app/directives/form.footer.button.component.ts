import { Component, Input } from '@angular/core';
import { AboutStatus } from '../app.globals';

@Component({
  selector: '<app-footer-button>',
  templateUrl : 'form.footer.button.component.html'
})
export class FormFooterButtonComponent  {

  @Input() fLabel       : string = "Exit";  // label for the button
  @Input() fOnClick     : Function;  // function to call when clicked

  constructor(private aboutStatus: AboutStatus) { 
  };

  toggleAbout = () => {
    this.aboutStatus.open = !this.aboutStatus.open;
  }
  
}
