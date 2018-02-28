
import { Component } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';
import { AboutStatus, UserInfo } from '../app.globals';

export const HelpContextTitles = {
      UsingMyRecipeMongo      : ['local_dining','Using MyRecipeMongo'],
      RecipeSearch        : ['search','Searching for Recipes'],
      RecipesMenu         : ['search','Selecting Recipes'],
      ViewRecipe          : ['search','Viewing Recipes'],
      EnterRecipes        : ['edit','Entering Recipe Information'],
      ManageCategories    : ['vpn_key','Managing Recipe Categories'],
      ManageOrigins       : ['face','Managing Recipe Origins'],
      ManageSharedRecipesMenu: ['settings_applications','Managing Shared Recipes'],
      MakeRecipeShared    : ['add_circle_outline','Adding a Shared Recipe'],
      ManageSharedSettings: ['settings_applications','Managing Shared Settings'],
      ProfileUpdate       : ['folder_open','Updating Your Profile'],
      ChangeEmail         : ['folder_open','Changing Your Email Address'],
      ChangePassword      : ['folder_open','Changing Your Password'],
      DeleteAccount       : ['folder_open','Deleting Your Account'],
      Login               : ['person_outline','Signing In'],
      ContactUs           : ['mail_outline','Contacting Us']
    };

@Component({
  selector: '<about-container>',
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  constructor(private aboutStatus: AboutStatus, private userInfo: UserInfo){};

  aboutOpen = () => {
    return this.aboutStatus.open;
  }

  closeAbout = () => {
    this.aboutStatus.open = false;
  }

  // return current helpContext
  helpContext = () => {
    return this.aboutStatus.context;
  }

  // return the current helpContext title
  helpContextTitle = () => {
    var c = this.helpContext();
    if(c !== undefined){
      if(HelpContextTitles[c] !== undefined){ return HelpContextTitles[c][1]; }
      alert(c);
    }
    return "";
  }

  // return the current helpContext title
  helpContextIcon = () => {
    var c = this.helpContext();
    if(c !== undefined){
      if(HelpContextTitles[c] !== undefined){ return HelpContextTitles[c][0]; }
      alert(c);
    }
    return "";
  }
}