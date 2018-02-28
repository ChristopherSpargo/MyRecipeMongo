import { Component, Input, Output, EventEmitter, OnInit, TemplateRef } from '@angular/core';
import {  NgForm, FormControl } from "@angular/forms";

  const L_EMPTY           =   0;   // line is empty
  const LSW_NUMBER        =   1;   // line starts with a number
  const LSW_NUMBER_SPACE  =   2;   // line starts with a number and space(s)
  const LSW_BULLET        =   4;   // line starts with a bullet
  const LSW_OTHER         =   8;
  const LEW_SEMICOLON     =  16;   // line ends with semicolon /:$/g
  const L_NUMBER_ONLY     =  32;   // line consists of a number and spaces only
  const L_BULLET_ONLY     =  64;   // line consists of a bullet and spaces only
  const LSW_SPACE         = 128;   // line starts with one or more spaces

  interface LineInfo {
    startsWith: number,
    endsWith:   number
  }

@Component({
  selector: '<app-icon-textarea>',
  templateUrl : 'icon.textarea.component.html'
})
export class IconTextareaComponent implements OnInit {

  focused: boolean = false;
  containerOpen: boolean = false;
  lastOp:   string;   // flag used to control opening/closing of the textarea container
  selStart: number;   // selected text start or cursor position in text
  selEnd:   number;   // selected text end or cursor position in text
  el:       any;      // DOM element for this textarea
  aErrors: string[];
  aMsgs:   string[];

  @Input() fName        : string;   // unique name for field
  @Input() fCheckAll    : boolean;  // flag to check all fields for errors (not just touched fields)
  @Input() fRef         : string;   // unique name for Template Reference Variable for this field
  @Input() fForm        : NgForm;   // name of Template Reference Variable for form this input belongs to
  @Input() fRequired    : boolean = false;  // if input is required
  @Input() fDisabled    : boolean = false;  // when input should be disabled
  @Input() fReadonly    : boolean = false;  // if the field is readonly
  @Input() fList        : string = '';  // if the field should be formatted as a list (with bullets)
  @Input() fLabel       : string;   // label for input
  @Input() fIcon        : string = "";   // icon for input
  @Input() fColor       : string;   // color for icon
  @Input() fValue       : string;   // model for this field
  @Input() fErrors      : string;   // array of error key names
  @Input() fErrorMsgs   : string;   // array of messages for the error keys
  @Input() fErrorMulti  : string;   // 'true' if allow multiple error messages
  @Input() fMaxlength   : string;   // value for maxlength (if any)
  @Input() fRows        : string = "4"; //number of rows for text area
  @Input() fFocusFn     : Function; // function to execute on focus
  @Input() fOnInput     : Function; // function to execute on input
  @Input() fExtraCSS    : string;   // CSS classes to add to main div
  @Input() fTextSize    : string = 'app-smaller-font';   // CSS class to add to textarea element
  @Output() fValueChange = new EventEmitter<string>();


  constructor() {
  };
  
  ngOnInit() {
    if(this.fErrors){   // convert error names to string array
      this.aErrors = this.fErrors.split('|');
    }
    if(this.fErrorMsgs){  // convert error messages to string array
      this.aMsgs = this.fErrorMsgs.split('|');
    }
  }

  toggleContainer = ()=> { // toggle expanded state of textarea container
    if(this.lastOp !== 'blur'){ 
      this.containerOpen = !this.containerOpen;
    }
    this.lastOp = 'toggle'
  }

  showFocused = ()=> {
    this.focused = this.containerOpen = true;
    if(this.fFocusFn){ this.fFocusFn(); }
  }

  showNotFocused = ()=> {
    this.lastOp = 'blur';
    this.focused = this.containerOpen = false;
    setTimeout(()=>{  // do this so toggleContainer will work as expected after .2 second
      this.lastOp = 'toggle';
    }, 200)
  }
  
  hasValue = () : boolean => {
    return (this.fValue !== undefined && this.fValue !== '');
  }


  // return a number indicating the starting and ending characteristics for the given string
  checkLine = (l : string) : number  => {
    let result : number = L_EMPTY;
    if(l.length){
      if(/:$/g.test(l))             {result += LEW_SEMICOLON;}
      if(/^ +/g.test(l))            {result += LSW_SPACE;}
      if(/^\.*\d+\.? *$/g.test(l))  {result += L_NUMBER_ONLY;}  
      else {
        if(/^(\d|\.)/g.test(l))     {result += LSW_NUMBER;}
      }
      if(/^\u25CF *$/g.test(l))     {result += L_BULLET_ONLY;}
      else {
        if(/^\u25CF */g.test(l))    {result += LSW_BULLET;}
      }
      if(result === L_EMPTY)        {result  = LSW_OTHER;}
    }
    return result;
  }

  valueChange = (evt)=> {
    this.el = evt.target;
    if((this.fList !== '') && (this.fValue.charAt(this.el.selectionEnd-1)==='\n')){
      this.selStart = this.el.selectionStart;
      this.selEnd = this.el.selectionEnd;
      let sArray = this.fValue.split('\n');
      let lineInfo : number;
      let newVal = '';
      let lastLen = 0;
      let itemNum = 1;
      for(var i=0; i<sArray.length-1; i++){
        let l = sArray[i];
        let offset : number;
        lineInfo = this.checkLine(l);
        switch(this.fList){

          // format entries (lines) as bullet items (eg. <bullet>  1/2 cup sugar)
          // leave blank lines alone
          // treat a line that ends in semicolon as a sub-heading
          // show sub-heading in all caps but don't bullet it
          case 'bullets':         
            offset = 0;
            switch(lineInfo){
              case LSW_SPACE:
                offset = l.length;
                l = l.replace(/^ +/,'');  // remove leading spaces
                offset -= l.length;
              case LSW_NUMBER:
              case LSW_OTHER:
                break;
              case LSW_BULLET: 
              case LSW_BULLET+LEW_SEMICOLON:
                offset = l.length;
                l = l.replace(/^\u25CF */,'');  // remove leading bullet and spaces
                offset -= l.length;
                break;
              case LEW_SEMICOLON:
              case L_EMPTY:
              case L_EMPTY+L_BULLET_ONLY:
              default:
                break;
            }
            if(lineInfo !== L_EMPTY && lineInfo !== L_EMPTY+L_BULLET_ONLY){
              if(lineInfo & LEW_SEMICOLON){
                l = l.toUpperCase();
              } else {
                l = String.fromCharCode(9679) + "  " + l;
                offset -= 3;
              }
              if(newVal.length < this.selStart-offset){ 
                this.selStart -= offset;  
                this.selEnd -= offset; 
              }
            }
            newVal += l + "\n";
            break;

          // format entries (lines) as numbered items (eg. 1. Preheat oven to 450)
          // leave blank lines alone
          // treat a line that ends in semicolon as a sub-heading
          // show sub-heading in all caps but don't number it
          case 'numbers':             
            offset = 0;
            let newNum = itemNum + ". ";
            switch(lineInfo){
              case LSW_NUMBER+LEW_SEMICOLON:
                newNum = '';      // cause no number to be added
              case LSW_NUMBER:
              case LSW_SPACE:
                offset = l.length;
                l = l.replace(/^[0123456789.]*/g,'').replace(/^ */g,'');  // remove leading number and spaces
                offset -= l.length;
              case LSW_OTHER:
                itemNum++;
                break;
              case LSW_BULLET+LEW_SEMICOLON:
              case LSW_BULLET:
                offset = l.length;
                l = l.replace(/^\u25CF */,'');  // remove leading bullet and spaces
                offset -= l.length;
                itemNum++;
                break;
              case LEW_SEMICOLON:
              case L_EMPTY:
              case L_NUMBER_ONLY:
              default:
                newNum = '';
                break;
            }
            if(newVal.length < this.selStart){ 
              this.selStart += (newNum.length-offset);  
              this.selEnd += (newNum.length-offset);
            }
            if(lineInfo & LEW_SEMICOLON){
              newVal += l.toUpperCase() + "\n"
              itemNum = 1;
            } else {
              newVal += newNum + l + "\n";
            }
            break;
        }
      }
      newVal += sArray[i];
      this.fValue = newVal;
      setTimeout(() => {
        this.el.value = newVal;
        this.el.setSelectionRange(this.selEnd, this.selEnd)
      },10);
    }
    this.fValueChange.emit(this.fValue);  // emit the event
    if(this.fOnInput){ this.fOnInput(); } // call user's OnInput function (if any)
  }

}
