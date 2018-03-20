import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {  NgForm } from "@angular/forms";

@Component({
  selector: '<app-icon-input>',
  templateUrl : 'icon.input.component.html'
})
export class IconInputComponent implements OnInit {
  focused: boolean = false;
  aErrors: string[];
  aMsgs:   string[];

  @Input() fName        : string;   // unique name for field
  @Input() fCheckAll    : boolean;  // flag to check all fields for errors (not just touched fields)
  @Input() fRef         : string;   // unique name for Template Reference Variable for this field
  @Input() fForm        : NgForm;   // name of Template Reference Variable for form this input belongs to
  @Input() fRequired    : boolean = false;  // if input is required
  @Input() fDisabled    : boolean = false;  // when input should be disabled
  @Input() fReadonly    : boolean = false;  // if the field is readonly
  @Input() fType        : string;   // input type (password, email,..)
  @Input() fAccept      : string;   // accept value for file input type
  @Input() fLabel       : string;   // label for input
  @Input() fFocusedLabel : string = ''; // label for field when focused or has a value
  @Input() fIcon        : string = "";   // icon for input
  @Input() fColor       : string;   // color for icon
  @Input() fInputCSS    : string;   // extra css for the input element
  @Input() fValue       : any;      // model for this field
  @Input() fClearFn     : Function; // function to use to clear the field, causes clear button on field
  @Input() fErrors      : string;   // array of error key names
  @Input() fErrorMsgs   : string;   // array of messages for the error keys
  @Input() fErrorMulti  : string;   // 'true' if allow multiple error messages
  @Input() fMinlength   : string;   // value for minlength (if any)
  @Input() fMaxlength   : number;   // value for maxlength (if any)
  @Input() fPattern     : string;   // value for pattern (if any)
  @Input() fFocusFn     : Function; // function to execute on focus
  @Input() fOnInput     : Function; // function to execute on input
  @Input() fExtraCSS    : string;   // CSS classes to add to main div
  @Input() fCapitalize  : boolean = false; // true if input should be capitalized
  @Output() fValueChange = new EventEmitter<string>();


  constructor() {
  };
  
  ngOnInit() {
    if(this.fErrors){
      this.aErrors = this.fErrors.split('|');
    }
    if(this.fErrorMsgs){
      this.aMsgs = this.fErrorMsgs.split('|');
    }
  }

  showFocused = ()=> {
    this.focused = true;
    if(this.fFocusFn){ this.fFocusFn(); }
  }

  showNotFocused = ()=> {
    this.focused = false;
  }

  hasValue = () : boolean => {
    return (this.fValue !== undefined && this.fValue !== '');
  }

  valueChange = (evt)=> {
    if(this.fCapitalize){ // capitalize every word?
      this.fValue = this.fValue.toLowerCase();
      this.fValue = this.fValue.replace(/\b[a-z]/g,
                       (x :string) : string =>{ return x.charAt(0).toUpperCase() + x.substr(1); })
    }
    if(this.fType === 'file'){
      var input : any = document.getElementById(this.fName + 'ID');
      this.fValue = input.files;
    }
    this.fValueChange.emit(this.fValue);
    if(this.fOnInput){ this.fOnInput(); }
  }
}
