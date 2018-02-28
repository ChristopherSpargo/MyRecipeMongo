import { Component, OnInit } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { StateService } from "@uirouter/core";

import { UserInfo, SlideoutStatus, AboutStatus } from '../app.globals';
import { Profile } from '../model/profile'
import { IMAGE_DIRECTORY, FORM_HEADER_ICON, APP_VERSION } from '../constants';
import { UtilSvc } from '../utilities/utilSvc'

@Component({
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
  formHeaderIcon    : string  = IMAGE_DIRECTORY+FORM_HEADER_ICON;
  version           : string  = APP_VERSION;

  constructor(private sS: SlideoutStatus, private user: UserInfo, private stateService: StateService,
      private utilSvc: UtilSvc, private aboutStatus: AboutStatus){
  }

  ngOnInit() {
    if (!this.user.profile) {                          //if the user doesn't have a profile
      this.user.profile = Profile.build();             //assign them the default profile values
    }
    this.utilSvc.displayUserMessages();
    this.aboutStatus.context = "UsingMyRecipeMongo"; // reset help context to base status
    if(window.matchMedia("(min-width: 768px)").matches){
      this.closeSlidenav();
    }
    this.utilSvc.scrollToTop();
  }

    toggleAbout = () => {
    this.aboutStatus.open = !this.aboutStatus.open;
  }


  toggleSlidenav() {
    this.sS.slidenavOpen = !this.sS.slidenavOpen;
  }

  slidenavOpen = () => {
    return this.sS.slidenavOpen;
  }
  
  aboutMenuOpen = () => {
    return this.sS.aboutMenuOpen;
  }
  
  accountMenuOpen = () => {
    return this.sS.accountMenuOpen;
  }
  
  logsMenuOpen = () => {
    return this.sS.logsMenuOpen;
  }

  publicLogsMenuOpen = () => {
    return this.sS.publicLogsMenuOpen;
  }

  listsMenuOpen = () => {
    return this.sS.listsMenuOpen;
  }
  
  aboutOpen = () => {
    return this.aboutStatus.open;
  }
  
  // return user email string
  userEmail() : string {
    return this.user.userEmail;
  }

  // the user is logged in if authData is not null
  loggedIn() : boolean {
    return !!this.user.authData;
  }

  // prompt the user for confirmation of log out and switch to login state
  logout(ev : any) : void {
    this.utilSvc.getConfirmation('Signing Out', 'Are you sure you want to Sign Out?', 'Sign Out')
     .then((leave) => {
       this.sS.aboutMenuOpen = false;
       this.sS.accountMenuOpen = false;
       this.stateService.go('login');
     })
     .catch((stay) => {
       if(window.matchMedia("(min-width: 768px)").matches){
         this.closeSlidenav();
       }
     });
  }

  openSlidenav() : void {
      this.sS.slidenavOpen = true;
  }

  closeSlidenav() : void {
      this.sS.slidenavOpen = false;
  }
  
  // Open the about (help) panel. Also, make sure the slidedown menu is closed.
  showAbout(topic : string) : void {
    this.closeSlidenav();
    this.aboutStatus.context = topic;
    this.aboutStatus.open = true;
  }

  toggleLogsMenu() : void {
    this.sS.aboutMenuOpen = false;
    this.sS.publicLogsMenuOpen = false;
    this.sS.listsMenuOpen = false;
    this.sS.accountMenuOpen = false;
    setTimeout( () => {
      this.sS.logsMenuOpen = !this.sS.logsMenuOpen;
    }, 100);
  }

  togglePublicLogsMenu() : void {
    this.sS.aboutMenuOpen = false;
    this.sS.logsMenuOpen = false;
    this.sS.listsMenuOpen = false;
    this.sS.accountMenuOpen = false;
    setTimeout( () => {
      this.sS.publicLogsMenuOpen = !this.sS.publicLogsMenuOpen;
    }, 100);
  }

  toggleListsMenu() : void {
    this.sS.aboutMenuOpen = false;
    this.sS.logsMenuOpen = false;
    this.sS.publicLogsMenuOpen = false;
    this.sS.accountMenuOpen = false;
    setTimeout( () => {
      this.sS.listsMenuOpen = !this.sS.listsMenuOpen;
    }, 100);
  }

  toggleAccountMenu() : void {
    this.sS.aboutMenuOpen = false;
    this.sS.listsMenuOpen = false;
    this.sS.logsMenuOpen = false;
    this.sS.publicLogsMenuOpen = false;
    setTimeout( () => {
      this.sS.accountMenuOpen = !this.sS.accountMenuOpen;
    }, 100);
  }

  toggleAboutMenu() : void {
    this.sS.accountMenuOpen = false;
    this.sS.listsMenuOpen = false;
    this.sS.logsMenuOpen = false;
    this.sS.publicLogsMenuOpen = false;
    setTimeout( () => {
      this.sS.aboutMenuOpen = !this.sS.aboutMenuOpen;
    }, 100);
  }

  // switch to the specified state.  Delay if menu open to wait for close animation
  menuItemSelected (newState : string, fSelect? : string) : void {
    var delay = this.sS.slidenavOpen ? 500 : 0;
    this.closeSlidenav();
    setTimeout( () => {
      if(fSelect){
        this.stateService.go(newState, {task: fSelect});
      }
      else {
        this.stateService.go(newState);
      };
    }, delay);
  }

}
