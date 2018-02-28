import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: '<app-radio-group>',
  templateUrl : 'radio.group.component.html'
})
export class RadioGroupComponent implements OnChanges  {

  @Input() fTitle       : string;   // title for the group
  @Input() fDisabled    : boolean = false; // true if field is disabled
  @Input() fVertical    : boolean = false; // true if stack items vertically
  @Input() fIcon        : string = "";   // name of icon for group
  @Input() fIconSpace   : boolean = false; // true if show empty icon space when fIcon not given
  @Input() fIconColor   : string;   // CSS to include for icon (color)
  @Input() fExtraCSS    : string = '';   // CSS to include for radio group div
  @Input() fOnFocus     : Function; // function to execute on input focus
  @Input() fName        : string;   // value to  use for the input elements' name attribute
  @Input() fModel       : string;   // where value is stored
  @Input() fOnChange    : Function; // function to execute on input change
  @Input() fValues      : string;   // list of values for each choice separated by |
  @Input() fLabels      : string;   // list of labels for each choice separated by |
  @Input() fDividerAfter: boolean = true; // true if field divider displayed after
  
  @Output() fModelChange = new EventEmitter<string>();

  aValues: string[];
  aLabels: string[];

  constructor() {
  };

  ngOnChanges() {
    if(this.fValues) {
      this.aValues = this.fValues.split('|');
    }
    if(this.fLabels) {
      this.aLabels = this.fLabels.split('|');
    }

  }

  valueChange = () => {
    this.fModelChange.emit(this.fModel);
    if(this.fOnChange) { this.fOnChange(); };
  }

  onFocus = () => {
    if(this.fOnFocus) { this.fOnFocus(); };
  }

}
