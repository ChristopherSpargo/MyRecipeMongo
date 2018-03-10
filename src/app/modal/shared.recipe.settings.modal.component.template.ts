import { Component, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { IMAGE_DIRECTORY, FORM_HEADER_ICON  } from '../constants'
import { UtilSvc } from '../utilities/utilSvc';
import { FormMsgList } from '../directives/form.msg.list';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'shared.recipe.settings.modal.component.html'
})

export class SharedRecipeSettingsModalComponentTemplate {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  @Input() mode         : string;
  @Input() heading      : string;
  @Input() itemList     : string[] = [];
  @Input() recipeTitle  : string;
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
  requestStatus       = new FormMsgList();

  constructor(public activeModal: NgbActiveModal) {}


  // delete the item that has been selected
  deleteSelectedItem = (form : NgForm) => {
    this.deleteItem = true;
    this.submitRequest(form)
  }

  // clear the list of items
  clearItemList = () => {
    this.itemList = [];
    this.clearRequestStatus();
    this.requestStatus.addMsg('itemListCleared');
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
    this.requestStatus.addMsg(msgId);
    this.resetForm(form);
  }

  // return the list index position for the item with the given name
  getListItemIndexByName = (n : string) : number => {
    for(let i=0; i<this.itemList.length; i++){
      if(this.itemList[i].toLowerCase() === n.toLowerCase() ){ return i;}
    }
    return -1;    //not found
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
  canDeleteItem = () : boolean => {
    return ((this.selectedItem != "") && (this.selectedItem != "999"));
  } 

  // return true if there is a restricted users list
  sharingWith = () : string => {
    let msg : string;

    switch(this.itemList.length){
      case 0:
        msg = 'everyone';
        break;
      case 1:
        msg = '1 other user';
        break;
      default:
        msg = this.itemList.length + ' other users';
    }
    return msg;
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs();
  }

  //indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  // return true if there is something wrong with the form input
  checkForProblems(form: NgForm) : boolean {
    if(form.invalid){
       this.requestStatus.addMsg('formHasErrors');
      return true;
    }
    if(this.selectedItem == "999"){  // user specify new item name?
      if(this.getListItemIndexByName(this.newItemName) !== -1){
        this.requestStatus.addMsg('itemAlreadyInList');
        return true;
      }
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
