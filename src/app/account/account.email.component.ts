import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, FormMsgList } from '../app.globals';
import { UserSvc } from '../model/userSvc'
import { CookieSvc } from '../utilities/cookieSvc';
import { CrossSvc } from '../app.bank'

    // COMPONENT for CHANGE EMAIL feature

@Component({
  templateUrl: 'account.email.component.html'
})
export class AccountEmailComponent implements OnInit {

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private userSvc: UserSvc,
              private cookieSvc: CookieSvc, private crossSvc: CrossSvc){
  };
    
    // COMPONENT for CHANGE EMAIL address feature

  checkAll           : boolean   = false; //true if form fields to be checked for errors (touched or not)
  currEmail          : string = this.user.userEmail;
  password           : string = "";
  newEmail           : string = "";
  requestStatus      = new FormMsgList();
  rememberLogin      : boolean = (this.currEmail == this.cookieSvc.getCookieItem('userEmail'));
  formOpen           : boolean = false;

  ngOnInit() {
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      //update the current help context and open the Email Change form
      this.utilSvc.setCurrentHelpContext("ChangeEmail"); //note current state
      this.utilSvc.displayUserMessages();
      setTimeout( () => {
        this.formOpen = true;}, 300);
    }
  }

  //finish up Email Change process.  Update user's cookie and profile.  Report status message.
  reportEmailChange() {
    this.user.userEmail = this.user.profile.email = this.newEmail;
    if (this.rememberLogin) {
      this.cookieSvc.setCookieItem('password', this.crossSvc.cross(this.user.userEmail, this.user.password));
      this.cookieSvc.setCookieItem('userEmail', this.user.userEmail);
    }
    this.userSvc.updateUserProfile(this.user)
    .then((success) => {
      this.utilSvc.displayThisUserMessage("emailChanged");
      this.closeForm();
    })
    .catch((failure) => {
      this.utilSvc.setUserMessage("profileEmailChangeFailed");
      this.utilSvc.displayWorkingMessage(false);
      this.closeForm();
    })
  }

  //send change email request to Firebase service
  submitRequest(form : NgForm) {
    this.checkAll = true;
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    this.utilSvc.displayWorkingMessage(true);
    this.userSvc.changeEmail(this.currEmail, this.password, this.newEmail)
    .then((success) => {
      this.reportEmailChange();
    })
    .catch((error) => {
      switch (error) {  //decide which status message to give
        case "EMAIL_TAKEN":
          this.requestStatus.addMsg('newEmailInUse');
          break;
        case "INVALID_EMAIL":
          this.requestStatus.addMsg('newEmailInvalid');
          break;
        case "INVALID_PASSWORD":
          this.requestStatus.addMsg('incorrectPassword');
          break;
        case "INVALID_USER":
          this.requestStatus.addMsg('unrecognizedEmail');
          break;
        default:
          this.utilSvc.setUserMessage("emailChangeFailed");
      }
      this.requestStatus.addMsg('emailChangeFail');
      this.utilSvc.displayWorkingMessage(false);
    });
  }

  // clear status messages object
  clearRequestStatus= ()=> {
    this.requestStatus.clearMsgs();
  }

  //indicate whether there are any status messages
  haveStatusMessages = () :boolean => {
    return !this.requestStatus.empty();
  }

  //set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = ()=>  {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}