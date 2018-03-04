import { Component, Input } from '@angular/core';

@Component({
  selector: '<app-form-messages>',
  templateUrl : 'form.messages.component.html'
})
export class FormMessagesComponent  {

  // This component is used to display various messages at the bottom of forms

  @Input() fHaveMessage       : boolean = true;           // true if message area should be open
  @Input() fMessageOpen       : boolean;                  // true if "Messages" display open

  constructor() {
  };

}
