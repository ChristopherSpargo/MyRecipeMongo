import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, FormMsgList } from '../app.globals';
import { UserSvc } from '../model/userSvc'
import { CookieSvc } from '../utilities/cookieSvc';
import { RecipeService } from '../model/recipeSvc'

    // COMPONENT for DELETE ACCOUNT feature

@Component({
  templateUrl: 'account.delete.component.html'
})
export class AccountDeleteComponent implements OnInit {

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private userSvc: UserSvc,
    private recipeSvc: RecipeService, private cookieSvc: CookieSvc){
  };
    
  checkAll           : boolean   = false; //true if form fields to be checked for errors (touched or not)
  userEmail          : string;
  password           : string = "";
  requestStatus      = new FormMsgList();
  formOpen           : boolean = false;

  ngOnInit() {
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      this.userEmail = this.user.userEmail;
      //update the current help context and open the Account Delete form
      this.utilSvc.setCurrentHelpContext("DeleteAccount"); //note current state
      this.utilSvc.displayUserMessages();
      setTimeout( () => { this.formOpen = true; }, 300 );
    }
  }

  // process request to delete user account and data
  submitRequest(form: NgForm) : void {
    this.clearRequestStatus();
    this.checkAll = true;
    if(form.invalid){
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    // Double check with user that they really want to do this
    this.utilSvc.getConfirmation('Delete Account', 
      'Are you sure you want to delete your account?  All of your recipes will be permanently removed.', 
      'Delete Account')
     .then((proceed) => {
      this.utilSvc.displayWorkingMessage(true, 'Deleteing Account');
      // first, try to delete the user's login account
        this.userSvc.deleteAccount(this.userEmail, this.password)
        .then((userAccountGone) => {
          // next, try to delete their profile and recipe database items
          this.deleteUserItems() 
          .then((userItemsGone) => {
            this.utilSvc.displayWorkingMessage(false);
          })
          .catch((somethingHappenedBut) => {
            this.utilSvc.displayWorkingMessage(false);
          });
        })
        .catch((accountDeleteFailed) => {
          switch (accountDeleteFailed) {  // decide which status message to give
            case "INVALID_PASSWORD":
              this.requestStatus.addMsg('incorrectPassword');
              break;
            case "INVALID_USER":
              this.requestStatus.addMsg('unrecognizedEmail');
              break;
            default:
              this.utilSvc.setUserMessage("accountDeleteFailed");
          }
          this.requestStatus.addMsg('deleteFail');
          this.utilSvc.displayWorkingMessage(false);
        });
      })
      .catch((neverMind) => {
      });
  }

  // Finish up Account Delete process.  Remove user's cookie, profile & data.
  // Report status message.
  deleteUserItems() : Promise<any> {
    return new Promise((resolve, reject) => {
      this.userSvc.removeUserProfile(this.user)
      .then((profileGone) => {
        this.user.userEmail = "";
        this.user.password = "";
        this.cookieSvc.deleteCookie();
        this.recipeSvc.removeUserData(this.user.authData.uid)
        .then((success) => {
          this.user.authData = null;
          this.utilSvc.setUserMessage("accountDeleted");
          this.closeForm();
          resolve('Ok');
        })
        .catch((error)=> {
          this.user.authData = null;
          this.utilSvc.setUserMessage(error);      // display what happened
          this.utilSvc.setUserMessage("accountDeleted");
          this.closeForm();
          resolve('Errors');
        })
      })
      .catch((error) => {
          this.utilSvc.setUserMessage("profileDeleteFail");
          reject('Fail');
      });
    })
  }

  // clear status messages object
  clearRequestStatus = ()=> {
    this.requestStatus.clearMsgs();
  }

  //indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  //set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = ()=>  {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}