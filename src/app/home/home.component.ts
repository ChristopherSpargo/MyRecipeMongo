import { Component, OnInit } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { StateService } from "@uirouter/core";

import { AboutStatus } from '../utilities/about.status.service';
import { SlideNavSvc } from './slideNavSvc';
import { UserInfo } from '../utilities/user.info.service'
import { Profile } from '../model/profile'
import { IMAGE_DIRECTORY, FORM_HEADER_ICON, APP_VERSION } from '../constants';
import { UtilSvc } from '../utilities/utilSvc'

@Component({
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
  formHeaderIcon    : string  = IMAGE_DIRECTORY+FORM_HEADER_ICON;
  version           : string  = APP_VERSION;
  searchMy         = 'SearchMy';

  constructor( private user: UserInfo, private stateService: StateService,
      private utilSvc: UtilSvc, private aboutStatus: AboutStatus, private slideNavSvc: SlideNavSvc){
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

  // return the open status of the slideNav 
  slideNavOpen = () : boolean => {
    return this.slideNavSvc.isOpen();
  }

  // open the Recipies slideNav submenu
  recipesMenuOpen = () : boolean => {
    return this.slideNavSvc.isOpenSub('Recipe');
  }

  // open the Accounts slideNav submenu
  accountMenuOpen = () : boolean => {
    return this.slideNavSvc.isOpenSub('Account');
  }

  // open the About slideNav submenu
  aboutMenuOpen = () : boolean => {
    return this.slideNavSvc.isOpenSub('About');
  }

  // close all slideNav submenus
  closeSubmenus = () => {
    this.slideNavSvc.toggleSub('None');
  }

  // cause the help panel to open/close
  toggleAbout = () => {
  this.aboutStatus.open = !this.aboutStatus.open;
  }

  // cause the slide menu to open/close
  toggleSlidenav() {
    this.slideNavSvc.toggle();
  }
  
  // return the open status of the about PANEL
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
       this.slideNavSvc.toggleSub('None');
       this.stateService.go('login');
     })
     .catch((stay) => {
       if(window.matchMedia("(min-width: 768px)").matches){
         this.closeSlidenav();
       }
     });
  }

  // make sure the slide menu is open
  openSlidenav() : void {
      this.slideNavSvc.open();
  }

  // make sure the slide menu is closed
  closeSlidenav() : void {
      this.slideNavSvc.close();
  }
  
  // Open the about (help) panel. Also, make sure the slidedown menu is closed.
  showAbout(topic : string) : void {
    this.closeSlidenav();
    this.aboutStatus.context = topic;
    this.aboutStatus.open = true;
  }

  // change the open status of the Recipes submenu of the slide menu
  toggleRecipesMenu() : void {
    this.slideNavSvc.toggleSub('Recipe');
  }

  // change the open status of the Account submenu of the slide menu
  toggleAccountMenu() : void {
    this.slideNavSvc.toggleSub('Account');
  }

  // change the open status of the About submenu of the slide menu
  toggleAboutMenu() : void {
    this.slideNavSvc.toggleSub('About');
  }

  // switch to the specified state.  Delay if menu open to wait for close animation
  menuItemSelected (newState : string, fSelect? : string) : void {
    var delay = this.slideNavSvc.isOpen() ? 500 : 0;
    this.closeSlidenav();
    setTimeout( () => {
      if(fSelect){
        this.stateService.go(newState, {'StateChoice': fSelect});
      }
      else {
        this.stateService.go(newState);
      };
    }, delay);
  }

}
