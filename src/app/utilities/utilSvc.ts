
  //SERVICE to perform various UTILITY functions
import { Injectable } from '@angular/core';
import { StateService } from "@uirouter/angular";
import { ToasterService, Toast, BodyOutputType } from 'angular2-toaster';
import { AboutStatus } from '../utilities/about.status.service';
import { UserInfo } from '../utilities/user.info.service';
import { ModalComponent } from '../modal/modal.component';

@Injectable()
export class UtilSvc {

    constructor(private user: UserInfo, private stateService: StateService, private aboutStatus: AboutStatus,
      private toasterService: ToasterService, private modalSvc: ModalComponent) {
    }

    // scroll to top of window
    scrollToTop = () => {
      this.scrollToYPos(0);
    }

    // scroll window to the given Y-position
    scrollToYPos = (pos: number) => {
      window.scrollTo(0,pos);             // doesn't work if HTML has overflow-?: hidden
      // document.body.scrollTo(0,pos);   //not supported in Safari Mobile
    }

    // get the amount the window has been scrolled in the Y direction
    pageYOffset = () => {
      return window.pageYOffset;          // doesn't work if HTML has overflow-?: hidden
      // return document.body.scrollTop;  //not supported in Safari Mobile
    }

    //emit a custom event with the given name and detail data (if any)
    emitEvent(name : string, data? : any) : void {
      document.dispatchEvent(new CustomEvent(name, {detail: data}));
    }

    // return a random integer from 0 upto but not icluding the given value
    randomIndex(maxVal: number) : number {
      return Math.floor(Math.random() * maxVal);
    };

    // format a given date to hh:mm a
    formatTime(t?: Date) : string {
      var dt    : Date    = t ? new Date(t) : new Date();
      var h     : number  = dt.getHours();
      var m     : number  = dt.getMinutes();
      var ampm  : string  = "AM";    
      var fd    : string;

      if( h > 11 ){
        ampm = "PM";
        if( h > 12){
          h -= 12;
        }
      }
      fd = ((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + " " + ampm);
      return fd;
    };

    // format a given date to MM/dd/yyyy
    formatDate(d?: Date) : string {
      var dt    : Date    = d ? new Date(d) : new Date();
      var month : number  = dt.getMonth() + 1;
      var day   : number  = dt.getDate();
      var year  : number  = dt.getFullYear();
      var fd    : string;

      fd = ((month < 10 ? "0" : "") + month + "/" + (day < 10 ? "0" : "") + day + "/" + year);
      return fd;
    };

    // format a given date to MM/yyyy
    formatDateNoDay(d?: Date) : string {
      var dt    : Date    = d ? new Date(d) : new Date();
      var month : number  = dt.getMonth() + 1;
      var year  : number  = dt.getFullYear();
      var fd    : string;

      fd = ((month < 10 ? "0" : "") + month + "/" + year);
      return fd;
    };

    // format a given date to yyyy
    formatDateJustYear(d?: Date) : string {
      var dt    : Date    = d ? new Date(d) : new Date();

      return dt.getFullYear().toString();
    };

    // create a date-time string for sorting as yyyyMMddhhmm from the given date and time fields
    formatSortDate(d?: any, t?: string) : string {
      var dt    : Date;
      var year  : number;
      var month : number;
      var day   : number;
      var h     : number;   // hour
      var m     : number;   // minute
      var fd    : string;

      if(d){
        dt = t ? new Date(d + ' ' + t) : new Date(d);
      } else {
        dt = new Date();    // no date, use current time
      }
      year = dt.getFullYear();
      month = dt.getMonth() + 1;
      day = dt.getDate();
      h = dt.getHours();
      m = dt.getMinutes();
      fd = (year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day + 
              (h < 10 ? "0" : "") + h + (m < 10 ? "0" : "") + m);
      return this.extendSortDate(fd);
    };

    // attach current second and millisecond values to given sort date
    extendSortDate(sd : string) : string {
      var sms   : Date;
      var s     : number;   // second
      var ms    : number;   // millisecond

      sms = new Date();   
      s = sms.getSeconds();
      ms = sms.getMilliseconds();
      sd += (s < 10 ? "0" : "") + s + (ms < 100 ? "0" : "") + (ms < 10 ? "0" : "") + ms;
      return sd;
    }

    // format a date to yyyyMM
    formatSortDateShort(d?: any, t?: string) : string {
      return this.formatSortDate(d).substr(0,6);
    }

    //set an item in the user.message object so the corresponding message can be displayed
    setUserMessage(msg: string, text?: string) : void {
      if (this.user.messages === null){
        this.user.messages = {};
      } 
      this.user.messages[msg] = text ? text : true;
    };

    //display the given message now
    displayThisUserMessage(msg: string, text?: string) : void {
      this.setUserMessage(msg, text);
      this.displayUserMessages();
    };

    // close open toast message and clear the user messages object
    closeUserMessage = () => {
      clearTimeout(this.user.openToastTimer);
      this.user.openToastTimer = null;
      this.toasterService.clear(this.user.openToastId);
      this.user.openToastId = null;
    }

    // remove the given property from the messages object
    removeUserMessage = (key: string) => {
      if(this.user.messages && this.user.messages[key]){
        delete this.user.messages[key];   //remove this message
      }
    }

    // display a toast that indicates Working...
    displayWorkingMessage = (show: boolean, msg : string = 'Working') => {
      this.closeUserMessage();                  // close the open message
      this.removeUserMessage('workingMessage'); // remove working message key from messages object
      if(show){
        this.user.messages = null;              // kill any pending messages
        this.setUserMessage('workingMessage', msg); // place working message into messages object
      }
      this.displayUserMessages();               // initiate message display
    }

    //display a toast for each message in user.messages object
    displayUserMessages() : void {
      if ((this.user.messages !== null) && (this.user.openToastId === null)) {
        var self = this;
        var msgArray = Object.getOwnPropertyNames(this.user.messages);  //get messages from object to array
        if (msgArray.length) {    //if there are any messages left...
          var msgText = "";
          var msgType = 'info';
          var msgDuration = 2000;
          var key = msgArray[0];  //get next message from messages object
          switch (key) {          //decide which message to display

            // GENERAL messages
            case 'workingMessage':
              msgText = this.user.messages[key] + " ...";
              msgDuration = 5000;
              break;
            case 'noWriteAccess':
              msgText = "This account has no WRITE access.";
              msgType = 'error';
              msgDuration = 2500;
              break;
            case 'databaseAccessError':
              msgText = "Database access error";
              msgType = 'error';
              break;
            case 'featureNotAvailable':
              msgText = "Feature is not available";
              msgType = 'error';
              break;

            // SIGN-IN related messages
            case 'signInSuccess':
              msgText = "You are now signed in.";
              msgType = 'success';
              break;
            case 'signOutSuccess':
              msgText = "You are now signed out.";
              msgType = 'success';
              break;
            case 'noProfile':
              msgText = "Unable to create user profile.";
              msgType = 'error';
              break;
            case 'signInToAccessRecipes':
              msgText = "Please sign in to Access recipes.";
              msgDuration = 2500;
              break;
            case 'signInToEnterRecipes':
              msgText = "Please sign in to enter recipes.";
              msgDuration = 2500;
              break;
            case 'signInToAccessAccount':
              msgText = "Please sign in for account access.";
              msgDuration = 2500;
              break;
            case 'signInToAccessCategories':
              msgText = "Please sign in to manage categories.";
              msgDuration = 2500;
              break;

              // ACCOUNT function related messages
            case 'profileUpdated':
              msgText = "Profile successfully updated.";
              msgType = 'success';
              break;
            case 'profileUpdateFail':
              msgText = "Profile not updated.";
              msgType = 'error';
              break;
            case 'emailChanged':
              msgText = "Email address has been changed.";
              msgType = 'success';
              break;
            case 'emailChangeFailed':
              msgText = "Email not changed.";
              msgType = 'error';
              break;
            case 'profileEmailChangeFailed':
              msgText = "Email changed but not in profile.";
              msgType = 'error';
              break;
            case 'passwordChanged':
              msgText = "Password has been changed.";
              msgType = 'success';
              break;
            case 'passwordChangeFailed':
              msgText = "Password not changed.";
              msgType = 'error';
              break;
            case 'accountDeleted':
              msgText = "Account has been deleted.";
              msgType = 'success';
              break;
            case 'accountDeleteFailed':
              msgText = "Account not deleted.";
              msgType = 'error';
              break;
            case 'profileDeleteFail':
              msgText = "Unable to delete user profile.";
              msgType = 'error';
              break;
            case 'dataDeleteFail':
              msgText = "Unable to delete user data.";
              msgType = 'error';
              break;
            
            // CATEGORY list related messages
            case 'errorReadingList':
              msgText = "Error reading "+this.user.messages[key]+" list";
              msgType = 'error';
              break;
            case 'initializingList':
              msgText = "Initializing "+this.user.messages[key]+" list";
              msgType = 'error';
              break;
            case 'errorInitializingList':
              msgText = "Error initializing "+this.user.messages[key]+" list";
              msgType = 'error';
              break;
            case 'errorupdatingList':
              msgText = "Error updating "+this.user.messages[key]+" list";
              msgType = 'error';
              break;
            case 'listItemAdded':
              msgType = 'success';
              msgText = this.user.messages[key]+" added to list.";
              break;
            case 'listItemUpdated':
              msgText = this.user.messages[key]+" updated.";
              msgType = 'success';
              break;
            case 'listItemRemoved':
              msgText = this.user.messages[key]+" removed from list.";
              msgType = 'success';
              break;
            case 'errorDeletingCategories':
              msgText = "Error deleting categories table.";
              msgType = 'error';
              break;
            case 'errorUpdatingCategoryList':
              msgText = "Error updating category list";
              msgType = 'error';
              break;
            case 'errorReadingCategoryList':
              msgText = "Error reading category list";
              msgType = 'error';
              break;

            // RECIPE access related messages
            case 'noRecipesFound':
              msgText = "No recipes match this search.";
              msgType = 'warning';
              break;
            case 'errorReadingRecipesForUpdate':
              msgText = "Error reading recipes for update.";
              msgType = 'warning';
              break;
            case 'errorReadingRecipesForDelete':
              msgText = "Error reading recipes for delete.";
              msgType = 'warning';
              break;
            case 'errorUpdatingRecipes':
              msgText = "Error updating affected recipes.";
              msgType = 'warning';
              break;
            case 'errorReadingRecipesTable':
              msgText = "Error reading Recipes table.";
              msgType = 'error';
              break;
            case 'errorReadingRecipe':
              msgText = "Error reading recipe.";
              msgType = 'error';
              break;
            case 'errorReadingExtraImages':
              msgText = "Error reading extra images.";
              msgType = 'error';
              break;
            case 'errorReadingPictures':
              msgText = "Error reading picture(s).";
              msgType = 'error';
              break;
            case 'errorCompressingPicture':
              msgText = "Error compressing picture \'" + this.user.messages[key] + "\'.";
              msgType = 'error';
              break;
            case 'recipeDeleted':
              msgText = "Recipe deleted.";
              msgType = 'success';
              break;
            case 'errorDeletingRecipe':
              msgText = "Recipe not deleted.";
              msgType = 'error';
              break;
            case 'errorDeletingRecipes':
              msgText = "Recipes not deleted.";
              msgType = 'error';
              break;
            case 'recipeSaved':
              msgText = "Recipe saved.";
              msgType = 'success';
              break;
            case 'errorSavingRecipe':
              msgText = "Recipe not saved.";
              msgType = 'error';
              break;
            case 'recipeShared':
              msgText = "Copy of recipe is now shared";
              msgType = 'success';
              break;
            case 'recipeMadePrivate':
              msgText = "Shared copy of recipe removed";
              msgType = 'success';
              break;
            case 'sharedCopyUpdated':
              msgText = "Shared copy of recipe updated";
              msgType = 'success';
              break;
            case 'errorUpdatingSharedCopy':
              msgText = "Error saving Shared copy of recipe";
              msgType = 'success';
              break;
            case 'recipeRestrictionsUpdated':
              msgText = "Authorized user list updated";
              msgType = 'success';
              break;
            case 'errorUpdatingRecipeRestrictions':
              msgText = "Error updating authorized user list";
              msgType = 'success';
              break;
            case 'errorSharingRecipe':
              msgText = "Error making shared copy of recipe";
              msgType = 'error';
              break;
            case 'errorUpdatingPersonalRecipe':
              msgText = "Error updating personal version of recipe";
              msgType = 'error';
              break;
            case 'errorDeletingSharedCopy':
              msgText = "Error removing shared copy of recipe";
              msgType = 'error';
              break;
            case 'errorReadingSharedCopy':
              msgText = "Error reading shared copy of recipe";
              msgType = 'error';
              break;
            default:
          }
          var toast: Toast = {
            type: msgType,
            timeout: msgDuration,
            // title: 'Here is a Toast Title',
            body: msgText
            // body: "<div class='app-toast-msg'>" + msgText + "</div>",
            // bodyOutputType: BodyOutputType.TrustedHtml
          };
          this.user.openToastId = this.toasterService.pop(toast).toastId;
          this.user.openToastTimer = setTimeout(() => {
            this.removeUserMessage(key);
            this.toasterService.clear(this.user.openToastId);
            this.user.openToastId = null;
            this.user.openToastTimer = null;
            self.displayUserMessages();     //see if there are any more messages
          }, msgDuration)
        } 
      }
    };

    //set the current help context
    setCurrentHelpContext(help: string) : void {
      this.aboutStatus.context = help;
    };

    //get the current help context
    getCurrentHelpContext() : string {
      return this.aboutStatus.context;
    };

    // switch to home state after setting the given user message
    returnToHomeMsg(msg: string, delay?: number, text?: string) : void {
      this.setUserMessage(msg, text);
      this.returnToHomeState(delay);
    };

    // switch states to the prior state after "delay" milliseconds
    returnToHomeState(delay = 100) : void {
      var self = this;
      setTimeout(function () {
        self.stateService.go("home");
        }, delay);
    };

    // Issue a confirmation dialog for an action involving a recipe
    // return a Promise
    confirmRecipeAction(heading: string, recipeTitle: string, 
                       okText: string, cancelText = "Cancel") : Promise<any> {
      return this.modalSvc.recipeActionOpen(heading, recipeTitle, cancelText, okText);
    };

    // Define a function to issue a confirmation dialog
    // return a Promise
    openSharedRecipeSettings(heading: string, emailList: string[], recipeTitle: string,
       mode: string, okText ?: string, deleteText ?: string, cancelText ?:string) : Promise<any> {
      return this.modalSvc.sharedSettingsOpen(heading, emailList, recipeTitle, mode,
                                              this.aboutStatus.toggle, okText, deleteText, cancelText);
    };

    // Define a function to issue a confirmation dialog
    // return a Promise
    getConfirmation(title: string, content: string, okText: string, cancelText = "Cancel") : Promise<any> {
      return this.showDialog(title, content, cancelText, okText);
    };

    // Define a function to issue a notice dialog
    // return a Promise
    giveNotice(title: string, content: string, okText: string) : Promise<any> {
      return this.showDialog(title, content, "", okText);
    };

    // display the ConfirmDialog template according to the given parameters
    // returns: Promise
    showDialog(title: string, content: string, cancelText: string, okText: string) : Promise<any> {
      return this.modalSvc.simpleOpen(title, content, cancelText, okText);
    }
}
