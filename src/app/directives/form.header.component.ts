import { Component, Input } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';
import { AboutStatus } from '../utilities/about.status.service';

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
  
  @Input() closeButtonTheme   : string = 'app-white-text-medium';   // CSS style for close button
  @Input() appBarItems        : any[];    // array of menu button objects for title bar
  @Input() headerType         : string;   // differentiates different header configurations
  @Input() closeLabel         : string = 'Exit'; // text to use for the close button
  @Input() headerClose        : Function; // link to closeForm function of form's controller
  @Input() printMsg           : string;   // message to emit if print icon present and clicked
  @Input() showHelp           : boolean = false; // flag to switch title icon to help icon

  constructor(private aboutStatus: AboutStatus, private utilSvc: UtilSvc) { }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  printFunc = () => {
    this.emit(this.printMsg);
  }

  toggleAbout = () => {
    this.aboutStatus.toggle();
  }

  appBarItemSelected = (action: string) => {
    this.emit(action);
  }

}
