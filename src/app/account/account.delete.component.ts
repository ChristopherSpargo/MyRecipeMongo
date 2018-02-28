import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { UserSvc } from '../model/userSvc'
import { CookieSvc } from '../utilities/cookieSvc';

    // COMPONENT for DELETE ACCOUNT feature

@Component({
  templateUrl: 'account.delete.component.html'
})
export class AccountDeleteComponent implements OnInit {

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private userSvc: UserSvc,
              private cookieSvc: CookieSvc){
  };
    
  checkAll           : boolean   = false; //true if form fields to be checked for errors (touched or not)
  userEmail          : string;
  password           : string = "";
  requestStatus      : { [key: string]: any } = {};
  working            : boolean = false;
  formOpen           : boolean = false;

  ngOnInit() {
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      this.userEmail = this.user.userEmail;
      //update the current help context and open the Email Change form
      this.utilSvc.setCurrentHelpContext("DeleteAccount"); //note current state
      this.utilSvc.displayUserMessages();
      setTimeout( () => { this.formOpen = true; }, 300 );
    }
  }

  // Finish up Account Delete process.  Remove user's cookie, profile & data.
  // Report status message.
  deleteUserItems() : void {
    this.user.userEmail = "";
    this.user.password = "";
    this.cookieSvc.deleteCookie();
    this.userSvc.removeUserProfile(this.user)
    .catch((error) => {
        this.utilSvc.setUserMessage("profileDeleteFail");
    });
    // this.userSvc.removeUserData(this.user)
    // .then((success) => {
    //   this.user.authData = null;
    //   this.utilSvc.setUserMessage("accountDeleted");
    //   this.closeForm();
    // })
    // .catch((error)=> {
    //   this.user.authData = null;
    //   this.utilSvc.setUserMessage("accountDeleted");
    //   this.closeForm();
    // })
  }

  // send delete request to Firebase service
  submitRequest(form: NgForm) : void {
    this.clearRequestStatus();
    this.checkAll = true;
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.working = true;
    this.userSvc.deleteAccount(this.userEmail, this.password)
    .then((success) => {
      this.deleteUserItems(); // finish account delete process
      this.utilSvc.displayUserMessages();
    })
    .catch((error) => {
      switch (error) {  // decide which status message to give
        case "INVALID_PASSWORD":
          this.requestStatus.incorrectPassword = true;
          break;
        case "INVALID_USER":
          this.requestStatus.unrecognizedEmail = true;
          break;
        default:
          this.utilSvc.displayThisUserMessage("accountDeleteFailed");
      }
      this.requestStatus.deleteFail = true;
      this.working = false;
    });
  }

  // clear status messages object
  clearRequestStatus = ()=> {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  //set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = ()=>  {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}