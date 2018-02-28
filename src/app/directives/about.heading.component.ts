import { Component, Input } from '@angular/core';

    // COMPONENT to insert headings into help text
    // Examples: 
    // <app-about-heading aah-icon="clipboard" aah-text="Why Use MatchLog?" aah-color='app-primary'></app-about-heading>
    // <app-about-heading aah-image="aC.formHeaderIcon" aah-text="Getting Help" aah-divider="true"></app-about-heading>


@Component({
  selector: '<app-about-heading>',
  templateUrl : 'about.heading.component.html'
})
export class AboutHeadingComponent  {

  @Input() fText        : string;                             // text for the heading
  @Input() fColor       : string = "app-primary";             // CSS class for the text color
  @Input() fImage       : string;                             // source for an image to display before the text
  @Input() fIcon        : string;                             // icon to display before the text
  @Input() fIconColor   : string = "app-about-icon-color";    // CSS class for color of icon to display before the text
  @Input() fButton      : string;                             // text to display on a button
  @Input() fButtonColor : string = "app-primary";             // CSS class for button color
  @Input() fFab         : boolean = false;                    // if display as FAB button
  @Input() fFabColor    : string = "app-bg-gwhite";           // background color for FAB button
  @Input() fDivider     : boolean = false;                    // 'true' for divider line above title

  constructor() {
  };
}
