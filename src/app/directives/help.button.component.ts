import { Component, Input } from '@angular/core';
import { AboutStatus } from '../app.globals';

@Component({
  selector: '<app-help-button>',
  templateUrl : 'help.button.component.html'
})
export class HelpButtonComponent {

  @Input() fPosition       : string = 'absolute'; // true if button uses 'position: absolute'
                                                // host container must be positioned relative for this

  constructor(private aboutStatus: AboutStatus) { }

  toggleAbout = () => {
    this.aboutStatus.toggle();
  }

}
