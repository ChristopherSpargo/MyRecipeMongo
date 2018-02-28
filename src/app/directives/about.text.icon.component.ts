import { Component, Input } from '@angular/core';

    // COMPONENT to insert icons into help text
    // Example: 
    // <app-about-text-icon fIcon="personOutline" fColor="app-primary"></app-about-text-icon>

@Component({
  selector: '<app-about-text-icon>',
  templateUrl : 'about.text.icon.component.html'
})
export class AboutTextIconComponent  {

  @Input() fIcon        : string;   // name of icon to display
  @Input() fSize        : string = 'S';   // size of icon to display
  @Input() fColor       : string  = "app-about-icon-color";   // CSS class for the icon color
  @Input() fBtn         : boolean = false;                  // 'true' if display icon on a button
  @Input() fFab         : boolean = false;                  // 'true' if display icon as a fab
  @Input() fFabColor    : string  = "app-bg-gwhite";    // CSS class for button color
  @Input() fLabel       : string  = ''; // label to go with icon
  @Input() fLabelCSS    : string  = ''; // css to be applied to the label only
  @Input() fReverse     : boolean = false; // true if label goes before icon
  @Input() fExtraCSS    : string = 'app-about-text-icon-label'; // css applied to main div


  constructor() {
  };

}
