import { Component } from '@angular/core';
import { IMAGE_DIRECTORY, FORM_HEADER_ICON } from '../constants';

// Help component for ABOUT MATCHLOG

@Component({
  selector: '<app-about-my-recipe-mongo>',
  templateUrl : 'about.my.recipe.mongo.component.html'
})
export class AboutMyRecipeMongoComponent  {
  icon : string = IMAGE_DIRECTORY + FORM_HEADER_ICON;

  constructor() {};

}
