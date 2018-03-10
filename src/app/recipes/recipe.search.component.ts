import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { CurrentRecipe } from '../utilities/current.recipe.svc';
import { FormMsgList } from '../directives/form.msg.list';
import { CatListObj } from '../directives/cat.list.obj'
import { UserInfo, SHARED_USER_ID } from '../utilities/user.info.service';
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
@Input() dataSet          : string = 'Personal';

  checkAll    : boolean   = false; //true if form fields to be checked for errors (touched or not)
  catList     = new CatListObj();
  keywords    : string = '';
  sortOrder   : string = 'D';
  recipeList  : Recipe[];
  requestStatus    = new FormMsgList();
  selectedItems    : boolean[] = [];
  recipeViewOpen   : boolean = false;

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private recipeSvc : RecipeService,
              private currentRecipe: CurrentRecipe){};

  ngOnInit() {
    this.setMessageResponders();
    if(!this.userInfo.authData) { return; }
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
    if(this.checkForProblems(form)){return;}
    this.utilSvc.displayWorkingMessage(true, 'Searching');

    request.collectionOwnerId = this.viewShared ? SHARED_USER_ID : this.userInfo.authData.uid;
    if(this.catList.haveCats()){ request.categories = this.catList.cats; }
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
      this.currentRecipe.recipeList = [];
      for(let i=0; i<list.length; i++){
        this.currentRecipe.recipeList.push(Recipe.build(list[i]));
      }
      this.utilSvc.emitEvent("searchUpdate");
      if(!this.currentRecipe.recipeList.length){
        this.utilSvc.setUserMessage("noRecipesFound"); //let user know they need to try again
      }
      this.utilSvc.displayWorkingMessage(false);
    })
    .catch((error) => {
      this.currentRecipe.recipeList = [];
      this.utilSvc.emitEvent("searchUpdate");
      this.utilSvc.setUserMessage("errorReadingRecipesTable"); //let user know they need to try again
      this.utilSvc.displayWorkingMessage(false);
    });
    this.utilSvc.scrollToTop();
  }

  // clear status messages object
  public clearRequestStatus = () => {
    this.requestStatus.clearMsgs(); 
  }

  //add an item to the status messages object
  private setStatusMessage(item : string) : void {
    this.requestStatus.addMsg(item); 
  }

  //indicate whether there are any status messages
  public haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  // respond to change of dataSet if necessary (Personal/Shared)
  dataSetChange = () : void => {
    if((this.dataSet === 'Shared') !== this.viewShared){
      this.catList.clear();   // categories list will change
      this.emit('setViewShared', this.dataSet === 'Shared');
      this.emit('resetSharedFilter');
    }
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
    this.utilSvc.scrollToTop();
    this.emit('openSearchCategoriesMenu');
  }

 
  // check the filter form responses for problems
  private checkForProblems(form? : NgForm) : boolean {
    if(form){
      if(form.invalid){
        this.setStatusMessage("formHasErrors");
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