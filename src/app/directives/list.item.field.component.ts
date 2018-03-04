import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: '<app-list-item-field>',
  templateUrl : 'list.item.field.component.html'
})
export class ListItemFieldComponent implements OnInit  {
  focused: boolean = false;

  @Input() fForm        : NgForm;   // name of form this input belongs to
  @Input() fCheckAll    : boolean;  // flag to check all fields for errors (not just touched fields)
  @Input() fName        : string;   // unique name for <select> field
  @Input() fRef         : string;   // unique name for Template Reference Variable (TRV) for this field
  @Input() fValue       : string;   // model for <select> field
  @Input() fList        : any[];    // array of list items for <select>
  @Input() fListValue   : string = "";   // indicates how to structure <select> options
  @Input() fLabel       : string;   // label for <select>
  @Input() fIcon        : string;   // icon for <select>
  @Input() fColor       : string;   // color for icon
  @Input() fRequired    : boolean;  // if input is required
  @Input() fDisabled    : string;   // indicates field is disabled
  @Input() fOnDelete    : Function; // function for item delete action
  @Input() fOnFocus     : Function; // function to execute on <select> focus
  @Input() fOnChange    : Function; // function to execute on <select> change
  @Input() fShowNew     : boolean = false; // allow a "New" selection but don't collect the new value
  @Input() fAllowNew    : boolean = true;  // should <select> have a New Item (value '999') entry at the top
  @Input() fActionButtons : boolean = true; // should <input> field have action buttons
  @Input() fAllowAny    : boolean = false;  // should <select> have a Any Item (value '') entry at the top
  @Input() fEqual       : boolean;  // true if test select value EQUAL_TO fNewTest string
  @Input() fNewTest     : string;   // string to test against to see if selected item can be edited
                                    // use fEqual="true" and fNewTest="999" if only new items can be edited
                                    // use fEqual="false" and fNewTest="" if all items can be edited
  @Input() fNewValue    : string;   // location to store new item value
  @Input() fCapitalize  : boolean = false; // true if capitalize each word in new value
  @Input() fNewLabel    : string;   // new item label
  @Input() fNewName     : string;   // unique name for new item field
  @Input() fNewRef      : string;   // unique name for TRV for new item field
  @Input() fNewItemCheck: string;   // when to show text input errors
  @Input() fErrorMulti  : string;   // 'true' if allow multiple error messages
  @Input() fExtraCSS    : string = "";   // additional css classes to include on main div
  @Input() fNewOpen     : boolean = false; // true if new item field always open
  @Output() fValueChange = new EventEmitter<string>();
  @Output() fNewValueChange = new EventEmitter<string>();
  @Output() fCheckAllChange = new EventEmitter<boolean>();

  constructor() {
  };

  ngOnInit() {
    if(this.fNewLabel === undefined) { this.fNewLabel = this.fLabel;}
  }
  
  currentLabel = () : string => {
    return this.fLabel + ' (' + (this.fList && this.fList.length ? this.fList.length : 'empty') + ')';
  }

  showFocused = ()=> {
    this.focused = true;
    if(this.fOnFocus){ this.fOnFocus(); }
  }

  showNotFocused = ()=> {
    this.focused = false;
  }

  // return true if the fValue field has a non-empty value
  hasValue = () : boolean => {
    return (this.fValue !== undefined && this.fValue !== '');
  }

  valueChange = ()=> {
    this.fValueChange.emit(this.fValue);
    if(this.fOnChange){ this.fOnChange(); }
    if(this.fAllowNew && (this.fEqual ? (this.fValue == this.fNewTest) : (this.fValue != this.fNewTest))){
      this.focusOnField(this.fNewName);
    }
  }

  newValueChange = ()=> {
    this.fNewValueChange.emit(this.fNewValue);
  }

  deleteItem = ()=> {
    this.fOnDelete(this.fForm);
  }

  cancelEdit = ()=> {
    if(this.fNewName) {
      this.fNewValue = "";
      this.newValueChange();
      this.fForm.controls[this.fNewName].markAsUntouched();
    }
    this.fValue = "";
    this.fCheckAll = false;
    this.fCheckAllChange.emit(this.fCheckAll);
    this.fForm.controls[this.fName].markAsUntouched();
    this.valueChange();
    if(this.fOnFocus){ this.fOnFocus(); }
  }

  focusOnField = (name : string) => {
    setTimeout(()=>{
      document.getElementById(name + "ID").focus();
    },400)    
  }
}

