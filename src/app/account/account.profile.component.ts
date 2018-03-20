import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { FormMsgList } from '../directives/form.msg.list';
import { UserSvc } from '../model/userSvc'
import { RecipeService, ListTableItem } from '../model/recipeSvc';
import { UserInfo } from '../utilities/user.info.service';

    // COMPONENT for PROFILE UPDATE feature

@Component({
  templateUrl: 'account.profile.component.html'
})
export class AccountProfileComponent implements OnInit {

  constructor(private userInfo: UserInfo, private utilSvc: UtilSvc, private userSvc: UserSvc,
              private recipeSvc: RecipeService){
  };
    // COMPONENT for PROFILE UPDATE feature

  checkAll           : boolean   = false; //true if form fields to be checked for errors (touched or not)
  itemName            : string    = "";
  itemList            : string[]  = [];
  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  requestStatus      = new FormMsgList();
  formOpen           : boolean = false;

  ngOnInit(){
    if (!this.userInfo.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      // set initial values for form fields
      this.itemList =
       this.userInfo.profile.defaultSharedUsers ? this.userInfo.profile.defaultSharedUsers : [];

      // update the current help context and open the Profile Update form
      this.utilSvc.setCurrentHelpContext("ProfileUpdate"); //note current state
      this.formOpen = true;
    }
  }

  // clear the list of items
  clearItemList = () => {
    this.clearRequestStatus();
    if(this.itemList.length){
      this.itemList = [];
      this.requestStatus.addMsg('itemListCleared');
    }
  }

  // return true if itemList is not empty
  itemsInList = () : boolean => {
    return this.itemList.length !== 0;
  }
  
  // send profile update request to Data service
  submitUpdate = (form : NgForm) : void => {
    this.checkAll = true;
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    this.userInfo.profile.defaultSharedUsers = this.itemList;
    this.utilSvc.displayWorkingMessage(true);
    this.userSvc.updateUserProfile(this.userInfo)
    .then((success) => {
      this.utilSvc.setUserMessage("profileUpdated");
      this.utilSvc.displayWorkingMessage(false);
      this.closeForm();
    })
    .catch((failure) => {
      this.utilSvc.setUserMessage("profileUpdateFail");
      this.utilSvc.displayWorkingMessage(false);
      this.closeForm();
    })
  }

  // delete the item that has been selected
  deleteSelectedItem = (form : NgForm) => {
    this.deleteItem = true;
    this.userListAction(form)
  }


  // process a user list action
  userListAction = (form : NgForm) : void => {
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
      form.controls['itemName'].markAsUntouched();
      form.controls['newIName'].markAsUntouched();
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

  // return the list index position for the item with the given name
  getListItemIndexByName = (n : string) : number => {
    for(let i=0; i<this.itemList.length; i++){
      if(this.itemList[i].toLowerCase() === n.toLowerCase() ){ return i;}
    }
    return -1;    //not found
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


  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs();
  }

  //indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
