import { Component, Input } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';
import { AboutStatus } from '../app.globals';

@Component({
  selector: '<app-form-header>',
  templateUrl : 'form.header.component.html'
})
export class FormHeaderComponent {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  @Input() headerIcon         : string = 'local_dining';   // icon for header
  @Input() headerTitle        : string;   // title string for header
  @Input() headerTheme        : string;   // CSS style for header
  @Input() headerTextColor    : string = 'app-white';   // CSS style for header text color
  
  @Input() closeButtonTheme   : string = 'app-faint-white-text';   // CSS style for close button
  @Input() appBarItems        : any[];    // array of menu button objects for title bar
  @Input() headerType         : string;   // type of form (center or right)
  @Input() headerClose        : Function; // link to closeForm function of form's controller

  constructor(private aboutStatus: AboutStatus, private utilSvc: UtilSvc) { }

  toggleAbout = () => {
    this.aboutStatus.open = !this.aboutStatus.open;
  }

  appBarItemSelected = (action: string) => {
    this.utilSvc.emitEvent(action);
  }

}
