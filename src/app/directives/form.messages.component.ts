import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-form-messages>',
  templateUrl : 'form.messages.component.html'
})
export class FormMessagesComponent  {

  @Input() fHaveMessage       : boolean = true;    // true if message area should be open
  @Input() fWorkingOpen       : boolean;    // true if "Working" status to be shown
  @Input() fMessageOpen       : boolean;    // true if "Messages" display open
  @Input() fMessageObj        : { [key: string]: any };        // object containing message keys

  constructor() {
  };

}
