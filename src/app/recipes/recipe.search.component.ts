import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentRecipe  } from '../app.globals';
import { SHARED_USER_ID } from '../constants'
import { UserSvc } from '../model/userSvc';
import { MENU_TAB, MENU_TAB_ID } from '../recipes/recipe.access.component'
import { Recipe, RecipeData, } from '../model/recipe'
import { RecipeService, ListTable, ListTableItem, RecipeFilterData } from '../model/recipeSvc'

@Component({
  selector: '<app-recipe-search>',
  templateUrl: 'recipe.search.component.html'
})
export class RecipeSearchComponent implements OnInit, OnDestroy {
@Input() searchTabOpen    : boolean;
@Input() viewShared       : boolean = false;  // indicates user is viewing shared recipes

  checkAll    : boolean   = false; //true if form fields to be checked for errors (touched or not)
  dataSet     : string = 'Personal';
  origin      : string = '';
  categories  : number[] = [];
  keywords    : string = '';
  startDate   : number;
  endDate     : number;
  sortOrder   : string = 'D';
  recipeList  : Recipe[];
  requestStatus    : { [key: string]: any } = {};
  selectedItems    : boolean[] = [];
  recipeViewOpen   : boolean = false;
  working          : boolean = false;

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private recipeSvc : RecipeService,
              private currentRecipe: CurrentRecipe){};

  ngOnInit() {
    if(!this.userInfo.authData) { return; }
    this.setMessageResponders();
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  // set all the message responders needed in this module
  setMessageResponders() : void {
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  public submitFilter(form : NgForm) : void {
    var request = <RecipeFilterData>{};
    this.checkAll = true;
    this.clearRequestStatus();
    if(this.checkForProblems(form)){return;}
    if(this.startDate){
      request.startDate = this.utilSvc.formatOriginDate(this.startDate.toString());
    }
    if(this.endDate){
      request.endDate = this.utilSvc.formatOriginDate(this.endDate.toString());
    }
    if(this.checkForProblems(form, request.startDate, request.endDate)){return;}
    this.working = true;

    request.collectionOwnerId = this.viewShared ? SHARED_USER_ID : this.userInfo.authData.uid;
    if(this.origin && this.origin !== '0'){request.origin = parseInt(<string>this.origin,10);} 
    this.working = true;
    if(this.categories.length){ request.categories = this.categories; }
    if(this.keywords) {  // clean up any wierd leading/trailing commas or comma-space combos
      this.keywords = this.keywords.replace(/( , | ,|, )/g,',').replace(/(^,|,$)/,'');
      request.keywords = this.keywords
    }
    if(this.viewShared && (this.userInfo.authData.uid !== SHARED_USER_ID)){
      request.checkEmail = this.userInfo.authData.uid + ':' + this.userInfo.userEmail;
    }
    request.projection = {extraImages: 0};
    
    this.currentRecipe.recipeList = undefined;

    this.utilSvc.emitEvent("searchUpdate");
    this.recipeViewOpen = false;
    this.checkAll = false;
    this.recipeSvc.getRecipes(request)
    .then((list : any) => {
      this.working = false;
      this.currentRecipe.recipeList = [];
      for(let i=0; i<list.length; i++){
        this.currentRecipe.recipeList.push(Recipe.build(list[i]));
      }
      this.utilSvc.emitEvent("searchUpdate");
      if(!this.currentRecipe.recipeList.length){
        this.utilSvc.displayThisUserMessage("noRecipesFound"); //let user know they need to try again
      }
    })
    .catch((error) => {
      this.working = false;
      this.currentRecipe.recipeList = [];
      this.utilSvc.emitEvent("searchUpdate");
      this.utilSvc.displayThisUserMessage("errorReadingRecipesTable"); //let user know they need to try again
    });
    this.utilSvc.scrollToTop();
  }

  // clear part of the date of the date range parameter
  clearDateRange = (part : string) => {
    switch(part){
      case 'start':
        this.startDate = undefined;
        break;
      case 'end':
        this.endDate = undefined;
        break;
      default:
    }
  }
  
  // clear status messages object
  public clearRequestStatus = () => {
    this.requestStatus = {}; 
  }

  //add an item to the status messages object
  private setStatusMessage(item : string) : void {
    this.requestStatus[item] = true; 
  }

  //indicate whether there are any status messages
  public haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // respond to change of dataSet if necessary (Personal/Shared)
  dataSetChange = () : void => {
    if((this.dataSet === 'Shared') !== this.viewShared){
      this.categories = [];   // categories list will change
      this.origin = '';       // origins list will change
      this.emit('setViewShared', this.dataSet === 'Shared');
      this.emit('resetSharedFilter');
    }
  }

  // return the list of origin items from the CurrentRecipe service 
    originListItems = () => {
    return this.currentRecipe.originListItems();
  }

  // return the list of category items from the CurrentRecipe service 
    categoryListItems = () => {
    return this.currentRecipe.categoryListItems();
  }

  // return the Category name for the given id
  getCategoryName = (id : number) : string => {
    return this.currentRecipe.categoryListName(id);
  }

  // open the category selection list
  openCatList = () => {
    this.clearRequestStatus();
    this.emit('openSearchCategoriesMenu');
  }

  // remove the given category from the categories for this recipe
  removeCategory = (id: number) => {
    var i;

    if(id !== undefined){
      i = this.categories.indexOf(id);
      if(i !== -1){
        this.categories.splice(i,1);      // id found
      }
    }
  }
  
  // check the filter form responses for problems
  private checkForProblems(form? : NgForm, startDate? : string, endDate? : string) : boolean {
    if(form){
      if(form.invalid){
        this.setStatusMessage("formHasErrors");
      }
      if((endDate && startDate) && ( endDate < startDate)){
        this.setStatusMessage("dateConflict");
      }
      return this.haveStatusMessages();
    }
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    this.utilSvc.emitEvent("nextTab");
  }

  // move to the next tab in the tab set
  public prevTab = () => {
    this.utilSvc.emitEvent("prevTab");
  }

  // close the View Logs display
  public closeView = () => {
    this.utilSvc.emitEvent("closeView");
  }


    
}