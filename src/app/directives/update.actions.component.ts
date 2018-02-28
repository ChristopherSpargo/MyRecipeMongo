import { Component, Input } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: '<app-update-actions>',
  templateUrl : 'update.actions.component.html'
})
export class UpdateActionsComponent  {

  @Input() fForm        : NgForm;           // name of form this input belongs to
  @Input() fDeleteCheck : boolean = false;  // true if delete button should be shown
  @Input() fOnDelete    : Function;         // called by a delete fab when fDeleteCheck is true
  @Input() fAddCheck    : boolean = false;  // true if add button should be shown
  @Input() fDisabled    : boolean = false;  // true if button disabled
  @Input() fLabels      : boolean = false;  // true if create small fabs with labels
  @Input() fALabel      : string = 'Add';   // text to put in the label of an Add button if labels in use
  @Input() fSLabel      : string = 'Save';  // text to put in the label of a Save button if labels in use
  @Input() fRLabel      : string = 'Remove';// text to put in the label of a Remove button if labels in use

  constructor() {
  };
  
}
