import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: '<app-delete-entry>',
  templateUrl : 'delete.entry.component.html'
})
export class DeleteEntryComponent  {

  @Input() fValue       : boolean;  // where the delete status is stored
  @Input() fCanDelete   : Function;  // boolean indicates whether item can be deleted
  @Input() fMessage     : string = "Remove this entry"; // message to show next to checkbox
  @Output() fValueChange = new EventEmitter<boolean>();

  constructor() {
  };

  valueChange = ()=> {
    this.fValueChange.emit(this.fValue);
  }
}
