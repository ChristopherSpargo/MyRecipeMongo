import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { UserSvc } from '../model/userSvc'
import { CookieSvc } from '../utilities/cookieSvc';
import { CrossSvc } from '../app.bank'

    // COMPONENT for CHANGE EMAIL feature

@Component({
  templateUrl: 'account.password.component.html'
})
export class AccountPasswordComponent implements OnInit {

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private userSvc: UserSvc,
              private cookieSvc: CookieSvc, private crossSvc: CrossSvc){
  };
    
    // COMPONENT for CHANGE PASSWORD address feature

  checkAll           : boolean   = false; //true if form fields to be checked for errors (touched or not)
  userEmail          : string;
  currPassword       : string = "";
  newPassword        : string = "";
  requestStatus      : { [key: string]: any } = {};
  rememberLogin      : boolean;
  working            : boolean = false;
  formOpen           : boolean = false;

  ngOnInit() {
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      this.userEmail = this.user.userEmail;
      this.rememberLogin = (this.userEmail == this.cookieSvc.getCookieItem('userEmail'));
      //update the current help context and open the Email Change form
      this.utilSvc.setCurrentHelpContext("ChangePassword"); //note current state
      this.utilSvc.displayUserMessages();
      setTimeout( () => {
        this.formOpen = true;}, 300);
    }
  }

  // finish up Password Change process.  Update user's cookie.  Report status message.
  reportPasswordChange() : void {
    this.user.password = this.newPassword;
    if (this.rememberLogin) {
      this.cookieSvc.setCookieItem('password', 
            this.crossSvc.cross(this.userEmail, this.newPassword));
    }
    this.utilSvc.displayThisUserMessage("passwordChanged");
    this.closeForm();
  }

  // send change password request to Firebase service
  submitRequest(form : NgForm) : void {
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.working = true;
    this.userSvc.changePassword(this.userEmail, this.currPassword, this.newPassword)
    .then((success) => {
      this.working = false;
      this.reportPasswordChange();
    })
    .catch((error) => {
      switch (error) {  //decide which status message to give
        case "INVALID_PASSWORD":
          this.requestStatus.incorrectCurrentPassword = true;
          break;
        case "INVALID_USER":
          this.requestStatus.unrecognizedEmail = true;
          break;
        default:
          this.utilSvc.displayThisUserMessage("passwordChangeFailed");
      }
      this.requestStatus.passwordChangeFail = true;
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