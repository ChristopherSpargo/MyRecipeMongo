import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-fab>',
  templateUrl : 'app.fab.component.html'
})
export class AppFabComponent  {
  clicked : boolean = false;

  @Input() fType        : string = 'submit';        // Type for button
  @Input() fLabel       : string = '';              // creates a small fab with a label
  @Input() fLabelCSS    : string = '';              // CSS to apply to label
  @Input() fAlignment   : string = 'align-items-center'; //alignment of label with icon (when present)
  @Input() fLink        : string = '';              // creates a link with a label
  @Input() fReverse     : boolean = false;          // reverse side for label
  @Input() fButtonCSS   : string = '';              // css classes to assign to the button
  @Input() fOpen        : boolean = false ;         // true if assign app-open class to button
  @Input() fAria        : string;                   // aria label text
  @Input() fIcon        : string = 'check_circle_outline'; // Icon to put on the button
  @Input() fIconColor   : string = 'app-primary';   // color for Icon 
  @Input() fIconCSS     : string; // css classes to assign to the icon
  @Input() fOnClick     : Function;                 // Function to call on click of fType = 'button'
  @Input() fDelay       : number = 300;             // delay before calling OnClick function
  @Input() fParam       : any = null;               // param to pass to OnClick function
  @Input() fDisabled    : boolean = false;          // true if button is disabled
  @Input() fVertical    : boolean = false;          // true if label is above or below icon

  constructor() {
  };

  fabClicked = ()=> {
    this.clicked = true;
    setTimeout( () => {
      this.clicked = false;
    }, 300);
    if(this.fOnClick) { 
      setTimeout( () => {
        this.fOnClick(this.fParam);
      },this.fDelay);
    }
  }
}
