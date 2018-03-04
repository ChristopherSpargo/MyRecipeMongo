import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StateService } from "@uirouter/angular";
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentRecipe } from '../app.globals';
import { RecipeService, CATEGORY_TABLE_NAME, RECIPE_TABLE_NAME,
         ListTable, ListTableItem } from '../model/recipeSvc';
import { RecipeData, Recipe } from '../model/recipe'
import { SHARED_USER_ID } from '../constants'

export const SEARCH_TAB     : number = 0;
export const SEARCH_TAB_ID  : string = "searchTab";
export const MENU_TAB       : number = 1;
export const MENU_TAB_ID    : string = "menuTab";
export const VIEW_TAB       : number = 2;
export const VIEW_TAB_ID    : string = "viewTab";
export const EDIT_TAB       : number = 3;
export const EDIT_TAB_ID    : string = "editTab";
 
// COMPONENT for SEACH RECIPES feature

@Component({
  templateUrl: 'recipe.access.component.html'
})
export class RecipeAccessComponent implements OnInit, OnDestroy {

  @ViewChild(NgbTabset) tabSet : NgbTabset;

  selectedMatches  : boolean[] = [];

  viewOpen         : boolean = false;
  viewWasOpen      : boolean = false;
  searchTabOpen    : boolean = false;
  menuTabOpen      : boolean = false;
  viewTabOpen      : boolean = false;
  editTabOpen      : boolean = false;
  recipesReady     : boolean = false;
  working          : boolean = false;
  viewShared       : boolean = false;
  menuMessage      : string = "";
  categoryList     : ListTableItem[] = [];
  headerTitle      : string;
  headerIcon       : string = 'search';
  currTabId        : string = "";
  eventInfoOpen    : boolean = false;
  tabNames         : string[] = [SEARCH_TAB_ID, MENU_TAB_ID, VIEW_TAB_ID, EDIT_TAB_ID];
  appBarItems      : any[] = [];
  viewAppBarItems= [
    { icon    : "print",
      action  : "printRecipe",
      label   : "print recipe",
      tip     : "Print Recipe"
    }
  ];
  printingRecipe   : boolean = false;
  dataSet          : string = 'Personal';
  menuColumns      : number = 2;
 

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private recipeSvc : RecipeService,
              private currentRecipe: CurrentRecipe, private stateService: StateService){};

  ngOnInit() {
    this.setMessageResponders();
    let stateName = this.stateService.current.name;
    let authMsg   = 'signInToAccessRecipes';
    let helpContext = 'RecipeSearch';

    // now check how we got here
    switch(stateName){        
      case 'searchMyRecipes':
        this.currTabId                = SEARCH_TAB_ID;
        this.headerTitle              = "Search Personal Recipes";
        this.headerIcon               = "search";
        this.currentRecipe.mode       = 'Review';
        this.dataSet                  = 'Personal';
        break;
      case 'searchSharedRecipes':
        this.currTabId                = SEARCH_TAB_ID;
        this.headerTitle              = "Search Shared Recipes";
        this.headerIcon               = "search";
        this.currentRecipe.mode       = 'Review';
        this.dataSet                  = 'Shared';
        break;
      case 'enterRecipe':
        this.currTabId                = EDIT_TAB_ID;
        this.currentRecipe.mode       = 'Create';       
        authMsg                       = 'signInToEnterRecipes' 
        helpContext                   = 'EnterRecipes'
        break;
    }
    // make sure the user is signed in
    if (!this.userInfo.authData) {
      this.utilSvc.returnToHomeMsg(authMsg);
    }
    else {
      // initialize mode flags and the currentRecipe object
      this.currentRecipe.recipe       = undefined;
      this.currentRecipe.searchScrollPosition = 0;
      this.currentRecipe.menuScrollPosition = 0;
      this.currentRecipe.viewScrollPosition = 0;
      this.currentRecipe.editScrollPosition = 0;

      this.constructMenuMessage(0);          
      this.utilSvc.setCurrentHelpContext(helpContext); //note current context
      this.utilSvc.displayUserMessages();
      this.readListTables()
      .then(() => {
        //the next line will call open<id>Tab from the (tabChange) handler of the TABS element
        this.searchTabOpen = this.currTabId === SEARCH_TAB_ID;
        this.selectTab(this.currTabId);
        this.viewOpen = true;
        this.viewWasOpen = true;
      })
      .catch(() => {
      })
    };
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  //set up the message responders for this module
  private setMessageResponders() : void {
    document.addEventListener("setViewShared", this.setViewShared);
    document.addEventListener("selectViewTab", this.selectViewTab);
    document.addEventListener("selectMenuTab", this.selectMenuTab);
    document.addEventListener("selectEditTab", this.selectEditTab);
    document.addEventListener("selectSearchTab", this.selectSearchTab);
    document.addEventListener("searchUpdate", this.updateRecipeList);
    document.addEventListener("updateMenuTabLabel", this.updateMenuTabLabel);
    document.addEventListener("nextTab", this.nextTab);
    document.addEventListener("prevTab", this.prevTab);
    document.addEventListener("closeView", this.closeView);
    document.addEventListener("printRecipe", this.printStart);
    document.addEventListener("printEnded", this.printEnd);
    window.addEventListener("resize", this.checkScreenSize);
  }

  //remove all the message responders set in this module
  private deleteMessageResponders() : void {
    document.removeEventListener("setViewShared", this.setViewShared);
    document.removeEventListener("selectViewTab", this.selectViewTab);
    document.removeEventListener("selectMenuTab", this.selectMenuTab);
    document.removeEventListener("selectEditTab", this.selectEditTab);
    document.removeEventListener("selectSearchTab", this.selectSearchTab);
    document.removeEventListener("searchUpdate", this.updateRecipeList);
    document.removeEventListener("updateMenuTabLabel", this.updateMenuTabLabel);
    document.removeEventListener("nextTab", this.nextTab);
    document.removeEventListener("prevTab", this.prevTab);
    document.removeEventListener("closeView", this.closeView);
    document.removeEventListener("printRecipe", this.printStart);
    document.removeEventListener("printEnded", this.printEnd);
    window.removeEventListener("resize", this.checkScreenSize);
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  // check the size of the screen and set the number of columns for the recipes menu
  checkScreenSize = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      this.menuColumns = 3;
    } else{
      this.menuColumns = 2;
    }
  }

  private printStart = () => {
    this.printingRecipe = true;
  }

  private printEnd = () => {
    this.printingRecipe = false;
  }

  readListTables = () : Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      this.recipeSvc.getList(CATEGORY_TABLE_NAME, 
        this.viewShared ? SHARED_USER_ID : this.userInfo.authData.uid ) //read categories list
      .then((cList) => {
        this.categoryList = cList.items.sort((a,b) : number => {return a.name < b.name ? -1 : 1;});
        this.currentRecipe.categoryList = cList;
        this.currentRecipe.categoryList.items = this.categoryList;
        resolve('ok');
      })
      .catch((error) => {
        this.utilSvc.returnToHomeMsg("errorReadingList", 400, 'Categories');
        reject(error)
      })
    })
  }

  // update the viewShared property
  setViewShared = (evt: CustomEvent) => {
    if(this.viewShared !== evt.detail){
      this.viewShared = evt.detail;
      this.headerTitle = this.viewShared ? "Search Shared Recipes" : "Search Personal Recipes";
      this.headerIcon = 'search';
      this.currentRecipe.recipe = undefined;
      this.currentRecipe.recipeList = undefined;
      this.updateMenuTabLabel();
      this.readListTables();
    }
  }

  // update the label on the MENU tab
  updateMenuTabLabel = () => {
    if(this.currentRecipe.recipeList !== undefined && this.currentRecipe.recipeList.length){
      this.constructMenuMessage(this.currentRecipe.recipeList.length);
      this.recipesReady = true;
    } else {
      this.constructMenuMessage(0);
      this.recipesReady = false;
    }
  }

  //update recipeList information from currentRecipe service
  updateRecipeList = () => {
    this.updateMenuTabLabel();
    if(this.currentRecipe.recipeList === undefined){
      this.working = true;
    }
    else{
      this.working = false;
      if(this.recipesReady){
        this.checkScreenSize();
        this.currentRecipe.menuScrollPosition = 0;
        setTimeout( () => {
          this.selectMenuTab();
        }, 50);
      }
    }
  }

  public constructMenuMessage = (recipes : number, msg? : string) => {
    if(msg !== undefined){
      this.menuMessage = msg;
    } else {
      if(!recipes) {
        this.menuMessage = "0 RECIPES";
      }
      if(recipes == 1) {
        this.menuMessage = "1 RECIPE";
      }
      if(recipes > 1) {
        this.menuMessage =  recipes + " RECIPES";
      }      
    }
  }

  // return the current recipe
  public selectedRecipe() : Recipe {
    return (this.recipeSelected() ? this.currentRecipe.recipe : undefined);
  }

  // return the current match object
  public recipeSelected() : boolean {
    return (this.currentRecipe.recipe !== undefined);
  }

  // set view closed flag, wait for animation to complete before changing states to 'home'
  public closeView  = () => {
    this.viewOpen = false;
    this.utilSvc.returnToHomeState(400);
  }

  public toggleSortOrder = () => {
    if(this.menuTabOpen){
      this.emit("reverseRecipeMenu");
    }
  }

  public openSearchTab = () => {
      this.closeViewTab();
      this.closeMenuTab();
      this.closeEditTab();
      this.currentRecipe.recipe = undefined;
      this.emit('noRecipeSelection');
      this.utilSvc.setCurrentHelpContext("RecipeSearch");
      this.appBarItems = [];
      this.headerTitle = this.viewShared ? "Search Shared Recipes" : "Search Personal Recipes";
      this.headerIcon = 'search';
  }

  public openEditTab = () => {
      this.closeViewTab();
      this.closeMenuTab();
      this.closeSearchTab();
      this.utilSvc.setCurrentHelpContext("EnterRecipes");
      this.appBarItems = [];
      this.headerTitle = this.currentRecipe.recipe ? 'Update Recipe' : 'Add Recipe';
      this.headerIcon = 'edit';
  }

  public openMenuTab = () => {
    if(this.recipesReady){       // something to show?
      this.closeViewTab();
      this.closeSearchTab();
      this.closeEditTab();
      this.currentRecipe.recipe = undefined;
      this.emit('noRecipeSelection');
      this.appBarItems = [];
      this.headerTitle = this.viewShared ? "Shared Recipes" : "Personal Recipes";
      this.headerIcon = 'menu';
      this.utilSvc.setCurrentHelpContext("RecipesMenu");
    }
  }

  public openViewTab = () => {
    if(this.selectedRecipe()){   // something to show
      this.closeSearchTab();
      this.closeMenuTab();
      this.closeEditTab();
      this.appBarItems = this.viewAppBarItems;
      this.headerTitle = this.viewShared ? "View Shared Recipe" : "View Personal Recipe";
      this.utilSvc.setCurrentHelpContext("ViewRecipe");
      this.headerIcon = 'local_library';
    }
  }

  private closeViewTab() : void {
    this.viewTabOpen = false;
  } 

  private closeMenuTab() : void {
    this.menuTabOpen = false;
  } 

  private closeSearchTab() : void {
    this.searchTabOpen = false;
  } 

  private closeEditTab() : void {
    this.editTabOpen = false;
  } 

  // switch the selected tab id to VIEW_TAB_ID, this causes a call to openViewTab
  private selectEditTab = () => {
    this.tabSet.select(EDIT_TAB_ID);
  }

  // switch the selected tab id to VIEW_TAB_ID, this causes a call to openViewTab
  private selectViewTab = () => {
    this.tabSet.select(VIEW_TAB_ID);
  }

  // switch the selected tab id to MENU_TAB_ID , this causes a call to openMenuTab
  private selectMenuTab = () => {
    this.tabSet.select(MENU_TAB_ID);
  }

  // switch the selected tab id to SEARCH_TAB_ID , this causes a call to openSearchTab
  private selectSearchTab = () => {
    this.tabSet.select(SEARCH_TAB_ID);
  }

  // switch to the tab with the given id, causes a call to open[id]Tab
  private selectTab = (id: string) : void => {
    this.tabSet.select(id);
  }

  // return the name data of the selected list's item with the given id
  public listItemName = (list : ListTableItem[], id : number) : string => {
    var i;

    for(i=0; i<list.length; i++){
      if( list[i].id == id){
        return list[i].name ;      // id found at position i
      }
    }
    return 'Unknown';
  }

  public tabChange = (evt: NgbTabChangeEvent) => {
    switch(evt.activeId){
      case SEARCH_TAB_ID:
        this.currentRecipe.searchScrollPosition = this.utilSvc.pageYOffset();
        break;
      case MENU_TAB_ID:
        this.currentRecipe.menuScrollPosition = this.utilSvc.pageYOffset();
        break;
      case VIEW_TAB_ID:
        this.currentRecipe.viewScrollPosition = this.utilSvc.pageYOffset();
        break;
      case EDIT_TAB_ID:
        this.currentRecipe.editScrollPosition = this.utilSvc.pageYOffset();
        break;
    }
    switch(evt.nextId){
      case MENU_TAB_ID:
        this.currentRecipe.selectedTab = MENU_TAB;
        this.emit("noRecipeSelection");
        this.openMenuTab();
        this.waitAndScroll(MENU_TAB);
      break;
      case VIEW_TAB_ID:
        this.currentRecipe.selectedTab = VIEW_TAB;
        this.openViewTab();
        this.waitAndScroll(VIEW_TAB);
      break;
      case SEARCH_TAB_ID:
        this.currentRecipe.selectedTab = SEARCH_TAB;
        this.emit("noRecipeSelection");
        this.openSearchTab();
        this.waitAndScroll(SEARCH_TAB);
      break;
      case EDIT_TAB_ID:
        this.currentRecipe.selectedTab = EDIT_TAB;
        this.openEditTab();
        this.waitAndScroll(EDIT_TAB);
      break;
    }
  }

  // wait for the tab content to change and then scroll the new content to it's last position
  // wait for the tab change before scrolling the conent. 
  // Wait for the scroll to finish before making the content visible 
  waitAndScroll = (tabNum: number) => {
    setTimeout(() => {
      switch(tabNum){
        case MENU_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.menuScrollPosition);
          setTimeout(() => {this.menuTabOpen = true;},100); // make sure the scroll is done
          break;
        case VIEW_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.viewScrollPosition);
          setTimeout(() => {this.viewTabOpen = true;},100); // make sure the scroll is done
          break;
        case SEARCH_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.searchScrollPosition);
          setTimeout(() => {this.searchTabOpen = true;},100); // make sure the scroll is done
          break;
        case EDIT_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.editScrollPosition);
          setTimeout(() => {this.editTabOpen = true;},100); // make sure the scroll is done
          break;
      }
    },50);    // make sure the tab switch is done       
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    if(this.currentRecipe.selectedTab < SEARCH_TAB){
      this.tabSet.select(this.tabNames[this.currentRecipe.selectedTab + 1]); //this causes call to tabChange()
    }
  }

  // move to the previous tab in the tab set
  public prevTab = () => {
    if(this.currentRecipe.selectedTab > MENU_TAB){
      this.tabSet.select(this.tabNames[this.currentRecipe.selectedTab - 1]); //this causes call to tabChange()
    }
  }

}
