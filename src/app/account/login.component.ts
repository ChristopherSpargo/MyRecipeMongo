import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import {UIROUTER_DIRECTIVES} from '@uirouter/angular';
import { UtilSvc } from '../utilities/utilSvc';
import { CookieSvc } from '../utilities/cookieSvc';
import { UserInfo } from '../app.globals';
import { Profile } from '../model/profile'
import { UserSvc } from '../model/userSvc'
import { RecipeService, CATEGORY_TABLE_NAME, ORIGIN_TABLE_NAME } from '../model/recipeSvc'
import { CrossSvc } from '../app.bank'

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {

  checkAll              : boolean = false; //true if form fields to be checked for errors (touched or not)
  formOpen              : boolean = false;
  userEmail             : string = '';
  userPassword          : string = '';
  passwordConfirm       : string = '';
  requestStatus         : { [key: string]: any } = {};
  createAccount         : boolean = false;
  newAccount            : boolean = false;
  rememberLogin         : boolean = true;

  constructor(private user: UserInfo, private utilSvc: UtilSvc, private cookieSvc: CookieSvc,
              private userSvc: UserSvc, private recipeSvc: RecipeService, private crossSvc: CrossSvc){
  };

  ngOnInit() {
     this.utilSvc.displayUserMessages();
     // determine if user is loggin in or logging out
     if (this.user.authData) { //user needs to log out
         this.user.authData = null;
         this.user.profile = Profile.build();
         this.utilSvc.setUserMessage("signOutSuccess");
         this.utilSvc.returnToHomeState();
     }
     else { // user needs to log in
         this.userEmail = "";
         this.userPassword = "";

         // fetch email and password from cookie if possible
         this.userEmail = this.cookieSvc.getCookieItem('userEmail');
         if (this.userEmail != "") {
           this.userPassword = this.cookieSvc.getCookieItem('password');
           this.userPassword = this.crossSvc.uncross(this.userEmail, this.userPassword);
         }
         // update the current help context and open the Login form
         this.utilSvc.setCurrentHelpContext("Login"); 
         setTimeout( () => { this.formOpen = true; }, 300 );
     }
  }

  // finish up Login process.  Update user's cookie and read user's profile.  Report status message.
  reportLogin(authData : any) : void {
    this.user.userEmail = this.userEmail;
    this.user.password = this.userPassword;
    this.user.authData = authData;
    this.utilSvc.setUserMessage("signInSuccess");
    if (this.rememberLogin) {
      this.cookieSvc.setCookieItem('password', this.crossSvc.cross(this.userEmail, this.userPassword));
      this.cookieSvc.setCookieItem('userEmail', this.user.userEmail);
    } else {
      this.cookieSvc.setCookieItem('password', "");
      this.cookieSvc.setCookieItem('userEmail', "");
    }
    this.userSvc.readUserProfile(this.user)
    .then((profile) => {
      // maybe check here for difference in email in profile and login to correct error in 
      // Change Email updating profile. 
      this.user.profile = profile;
    })
    .catch((failure) => {
      this.user.profile = Profile.build();     // no profile yet, create a profile
      this.user.profile.id = authData.uid;
      this.user.profile.email = this.user.userEmail;
      this.userSvc.createUserProfile(this.user)
      .then((profile) => {
        this.user.profile = <Profile>profile;
        this.recipeSvc.initializeTable(CATEGORY_TABLE_NAME, authData.uid) //initialize Categories List
        .then((success) => {
          this.recipeSvc.initializeTable(ORIGIN_TABLE_NAME, authData.uid)  //initialize Origins List
          .then((success) => {})
          .catch((error) => {
            this.utilSvc.setUserMessage("errorInitializingOriginsList");
          })
        })
        .catch((error) => {
            this.utilSvc.setUserMessage("errorInitializingCategoriesList");
        })
      })
      .catch((failure) => {
        this.utilSvc.setUserMessage("noProfile");
      })
    });
    this.utilSvc.displayWorkingMessage(false);
    this.closeForm();
  }

  // send login request to Firebase service
  sendLoginRequest(form : NgForm) : void {
    this.checkAll = true;
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return;
    }
    if (this.createAccount && !this.newAccount) {  // creating new account
      this.utilSvc.displayWorkingMessage(true, 'Creating New Account');
      this.userSvc.createAccount(this.userEmail, this.userPassword)
      .then((success) => {
        this.requestStatus.createSuccess = true;
        this.requestStatus.accountCreated = true;
        this.newAccount = true;
        this.utilSvc.displayWorkingMessage(false);
      })
      .catch((failure) => {
        this.requestStatus.createFail = true;
        switch (failure) {
          case "EMAIL_TAKEN":
            this.requestStatus.emailInUse = true;
            break;
          case "INVALID_EMAIL":
            this.requestStatus.emailInvalid = true;
            break;
          default:
            this.requestStatus.weirdProblem = true;
        }
        this.utilSvc.displayWorkingMessage(false);
      })
    }
    else {  // logging in
      this.utilSvc.displayWorkingMessage(true, 'Authorizing');
      this.userSvc.authWithPassword(this.userEmail, this.userPassword)
      .then((authData) => {
        this.reportLogin(authData);
      })
      .catch((error) => {
        switch (error) {  // decide which message to give
          case "INVALID_USER":
            this.requestStatus.unrecognizedEmail = true;
            break;
          case "INVALID_EMAIL":
            this.requestStatus.emailInvalid = true;
            break;
          case "INVALID_PASSWORD":
            this.requestStatus.incorrectPassword = true;
            break;
          default:
            this.requestStatus.weirdProblem = true;
        }
        this.requestStatus.authFail = true;
        this.user.authData = null;
        this.utilSvc.displayWorkingMessage(false);
      })
    }
  }

  // user got their password wrong and has clicked the FORGOT PASSWORD button
  // confirm that this is the case and allow them to receive an email with a temporary password
  requestPasswordReset = () => {
    this.clearRequestStatus();
    this.utilSvc.getConfirmation('Forgot Password:', 'You can receive an email containing a temporary password '+
      'that you can use to log in.  You can then set your password to something else.' +
      '  Or, you can try to sign in again now.','Send Email','Try Again')
    .then(function () {
      this.utilSvc.displayWorkingMessage('Sending Email');
      this.userSvc.resetPassword(this.userEmail)
      .then((success) => {
        this.utilSvc.displayWorkingMessage(false);
        this.requestStatus.passwordResetSent = true;
        this.requestStatus.enterTempPassword = true;
        this.haveStatusMessages = true;
      })
      .catch((error) => {
        switch (error) {  //decide which message to give
          case "INVALID_USER":
            this.requestStatus.unrecognizedEmail = true;  //this probably should not happen
            break;
          default:
        }
        this.utilSvc.displayWorkingMessage(false);
        this.requestStatus.passwordResetFail = true;
        this.haveStatusMessages = true;
      })
    });
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  // determine if fields for new account should be showing in Login form
  showNewAccountFields = ()=> {
    return (this.createAccount && !this.newAccount);
  }

  // reset some fields associated with a new account
  clearNewAccountFields = ()=> {
    this.clearRequestStatus();
    this.passwordConfirm = "";
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  //set form closed flag, wait for animation to complete before changing states
  closeForm = ()=>  {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
