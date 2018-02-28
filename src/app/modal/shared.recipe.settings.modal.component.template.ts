import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { IMAGE_DIRECTORY, FORM_HEADER_ICON  } from '../constants'

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'shared.recipe.settings.modal.component.html'
})

export class SharedRecipeSettingsModalComponentTemplate implements OnInit {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  @Input() mode         : string;
  @Input() heading      : string;
  @Input() itemList     : string[];
  @Input() recipeTitle  : string;
  @Input() origin       : string;
  @Input() originDate   : string;
  @Input() okText       : string;
  @Input() deleteText   : string;
  @Input() cancelText   : string;
  @Input() openModal    : boolean;
  @Input() toggleAbout  : Function;

  checkAll            : boolean   = false; //true if form fields to be checked for errors (touched or not)
  deleteRecipe        : boolean   = false;
  itemName            : string    = "";
  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  requestStatus       : { [key: string]: any }  = {};
  working             : boolean   = false;

  constructor(public activeModal: NgbActiveModal) {}


  ngOnInit() {
    if(this.itemList === undefined){ this.itemList = [];}
  }

  // delete the item that has been selected
  deleteSelectedItem = (form : NgForm) => {
    this.deleteItem = true;
    this.submitRequest(form)
  }


  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var msg   : string, 
        msgId : string,
        action: string,
        index: number;

    this.checkAll = true;
    this.clearRequestStatus();
    if(this.checkForProblems(form)){   // can't do anything yet, form still has errors
      return;
    }
    this.working = true;
    this.itemName = this.newItemName;
    msg = "Email " + "'" + this.itemName + "'";
    // now set the action to perform and the status message for the user
    if(this.selectedItem == "999"){  // user specify new item name?
      msgId = "listItemAdded";
      action = "Add";
    } 
    else {
      if(!this.deleteItem){
        msgId = "listItemUpdated";
        action = "Update";
      } else {
        msgId = "listItemRemoved";
        action = "Remove";
      }
    }
    index = parseInt(this.selectedItem);
    switch(action){
      case "Update":
        this.itemList[index] = this.itemName;      // update entry
      break;
      case "Remove":
        this.itemList.splice(index,1);    // remove entry
      break;
      case "Add":
      default:
        this.itemList.push(this.itemName);         // Add entry          
      break;
    }
    this.requestStatus[msgId] = true;
    this.resetForm(form);
    this.working = false;
  }

  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    setTimeout( () => {
      if(this.selectedItem != "999"){
        this.newItemName = this.itemList[this.selectedItem];
      }
      else{
        this.newItemName = "";
      }
    }, 50);
  }

  // get the form ready for another operation
  resetForm(form : NgForm) : void {
    if(form){
      form.resetForm();
   }
    this.checkAll = false;
    this.selectedItem = "";
    this.deleteItem   = false;
    this.newItemName  = "";
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () => {
    return ((this.selectedItem != "") && (this.selectedItem != "999"));
  } 

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // return true if there is something wrong with the form input
  checkForProblems(form: NgForm) : boolean {
    if(form.invalid){
       this.requestStatus.formHasErrors = true;
      return true;
    }
    return this.selectedItem == "";
  }

  // call the resolve method after waiting for closing animation
  close = () => {
    var result : any = {};
    result.delete = this.deleteRecipe;
    result.create = this.mode === 'Create';
    result.list = this.itemList.length ? this.itemList : undefined;
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.close(result);
    }, 400)
  }

  // call the resolve method after waiting for closing animation
  dismiss = () => {
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.dismiss("CANCEL");
    }, 400)
  }

}
