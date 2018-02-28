import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { UserSvc } from '../model/userSvc'
import { RecipeService, ORIGIN_TABLE_NAME, ListTableItem } from '../model/recipeSvc';

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
  profile            : any = {};
  originList         : ListTableItem[] = [];
  requestStatus      : { [key: string]: any } = {};
  working            : boolean = false;
  formOpen           : boolean = false;

  ngOnInit(){
    if (!this.userInfo.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessAccount"); //let user know they need to log in
    }
    else{
      // set initial values for form fields
      this.profile.defaultRecipeOrigin = this.userInfo.profile.defaultRecipeOrigin.toString() || "";
      this.recipeSvc.getList(ORIGIN_TABLE_NAME, this.userInfo.authData.uid ) //read list of origins
      .then((oList) => {
        this.originList = oList.items.sort((a,b) : number => {return a.name < b.name ? -1 : 1;});  
        //the next line will call open<id>Tab from the (tabChange) handler of the TABS element
        this.formOpen = true;
      })
      .catch((error) => {
        this.utilSvc.returnToHomeMsg("errorReadingList", 400, 'Origins');
      })

      // update the current help context and open the Profile Update form
      this.utilSvc.setCurrentHelpContext("ProfileUpdate"); //note current state
    }
  }

  // send profile update request to Data service
  submitRequest(form : NgForm) : void {
    this.checkAll = true;
    this.clearRequestStatus();
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.userInfo.profile.defaultRecipeOrigin =  parseInt(this.profile.defaultRecipeOrigin,10);
    this.working = true;
    this.userSvc.updateUserProfile(this.userInfo)
    .then((success) => {
      this.utilSvc.displayThisUserMessage("profileUpdated");
      this.closeForm();
    })
    .catch((failure) => {
      this.utilSvc.displayThisUserMessage("profileUpdateFail");
      this.closeForm();
    })
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
