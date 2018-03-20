import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { StateService, UrlService } from "@uirouter/angular";
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { UtilSvc } from '../utilities/utilSvc';
import { CurrentRecipe } from '../utilities/current.recipe.svc';
import { RecipeService, CATEGORY_TABLE_NAME, RECIPE_TABLE_NAME,
         ListTable, ListTableItem } from '../model/recipeSvc';
import { RecipeData, Recipe } from '../model/recipe'
import { UserInfo, SHARED_USER_ID } from '../utilities/user.info.service';

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
  searchTabOpen    : boolean = false;
  menuTabOpen      : boolean = false;
  viewTabOpen      : boolean = false;
  editTabOpen      : boolean = false;
  recipesReady     : boolean = false;
  working          : boolean = false;
  viewShared       : boolean = false;
  menuMessage      : string = "";
  headerTitle      : string;
  headerIcon       : string = 'search';
  printMsg         : string = '';  // indicates to header component that print button should be present
  currTabId        : string = "";
  tabNames         : string[] = [SEARCH_TAB_ID, MENU_TAB_ID, VIEW_TAB_ID, EDIT_TAB_ID];
  printingRecipe   : boolean = false; // true if PRINT view of recipe is being displayed (for printing)
  dataSet          : string = 'Personal'; // selection passed to SEARCH module to provide for
                                          // 'Search Shared Recipes' menu item
  menuColumns      : number = 2;      // value passed to MENU module to control # of colums of menu items
  navPath          : string[] = [];   // stack of tabIds for processing the BACK button during recipe access
  adjNavPath       : boolean = false; // flag to keep from processing the calls to history.back() below
  backButtonHit    : boolean = false; // flag to keep from adding to navPath on BACK button use
  pageIsScrolled   : boolean = false; // true if page has been scrolled vertically
 

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private recipeSvc : RecipeService,
              private currentRecipe: CurrentRecipe, 
              private stateService: StateService, private urlService: UrlService){};

  ngOnInit() {
    this.setMessageResponders();
    let stateChoice = this.stateService.current.name;
    let authMsg   = 'signInToAccessRecipes';
    let helpContext = 'RecipeSearch';

    // now check how we got here
    switch(stateChoice){        
      case 'recipeAccess.recipeSearchMy':
        this.currTabId                = SEARCH_TAB_ID;
        this.headerTitle              = "Search Personal Recipes";
        this.headerIcon               = "search";
        this.currentRecipe.mode       = 'Review';
        this.dataSet                  = 'Personal';
        break;
      case 'recipeAccess.recipeSearchShared':
        this.currTabId                = SEARCH_TAB_ID;
        this.headerTitle              = "Search Shared Recipes";
        this.headerIcon               = "search";
        this.currentRecipe.mode       = 'Review';
        this.dataSet                  = 'Shared';
        break;
      case 'recipeAccess.recipeEntry':
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
        // this.searchTabOpen = this.currTabId === SEARCH_TAB_ID;
        this.selectTab(this.currTabId);
        this.viewOpen = true;
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
    document.addEventListener("printBegin", this.printStart);
    document.addEventListener("printDone", this.printEnd);
    window.addEventListener("resize", this.checkScreenSize);
    window.addEventListener("popstate", this.handlePopState)
    window.addEventListener("scroll", this.handleScroll)
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
    document.removeEventListener("printBegin", this.printStart);
    document.removeEventListener("printDone", this.printEnd);
    window.removeEventListener("resize", this.checkScreenSize);
    window.removeEventListener("popstate", this.handlePopState)
    window.removeEventListener("scroll", this.handleScroll)
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  // return whether page has been scrolled vertically
  handleScroll = () => {
    this.pageIsScrolled = this.utilSvc.pageYOffset() !== 0;
  }

  // primarily here to handle the BACK button.
  handlePopState = (evt: any) => {
    if(!this.adjNavPath && this.navPath.length){
      this.backButtonHit = true;
      this.selectTab(this.navPath.pop());
    }
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
        this.currentRecipe.categoryList = cList;
        this.currentRecipe.categoryList.items = 
              cList.items.sort((a,b) : number => {return a.name < b.name ? -1 : 1;});
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

  // return whether there is a current recipe selection
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
      // this.currentRecipe.recipe = undefined;
      // this.emit('noRecipeSelection');
      this.utilSvc.setCurrentHelpContext("RecipeSearch");
      this.printMsg = '';
      this.headerTitle = this.viewShared ? "Search Shared Recipes" : "Search Personal Recipes";
      this.headerIcon = 'search';
  }

  public openEditTab = () => {
      this.closeViewTab();
      this.closeMenuTab();
      this.closeSearchTab();
      this.utilSvc.setCurrentHelpContext("EnterRecipes");
      this.printMsg = '';
      this.headerTitle = this.currentRecipe.recipe ? 'Update Recipe' : 'Add Recipe';
      this.headerIcon = 'edit';
  }

  public openMenuTab = () => {
    if(this.recipesReady){       // something to show?
      this.closeViewTab();
      this.closeSearchTab();
      this.closeEditTab();
      this.printMsg = '';
      this.headerTitle = this.viewShared ? "Shared Recipes" : "Personal Recipes";
      this.headerIcon = 'restaurant';
      this.utilSvc.setCurrentHelpContext("RecipesMenu");
    }
  }

  public openViewTab = () => {
    if(this.selectedRecipe()){   // something to show
      this.closeSearchTab();
      this.closeMenuTab();
      this.closeEditTab();
      this.printMsg = 'printRecipe';
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
    let paths={SEARCH_TAB_ID: '/recipes/search',
               MENU_TAB_ID:   '/recipes/menu',
               VIEW_TAB_ID:   '/recipes/view',
               EDIT_TAB_ID:   '/recipes/entry'
              };

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

    // now some code to manage the BACK button path (navPath)
    if(!this.backButtonHit && // skip all this if we're processing a BACK button use
        // only start a navPath from SEARCH or EDIT tabs
       (this.navPath.length || evt.activeId === SEARCH_TAB_ID || evt.activeId === EDIT_TAB_ID)){
      
      // first, check if the target tab is in the BACK button path. That would mean the user used
      // the tab navigation bar to change tabs so we'll simulate enough BACK button presses to fix it.
      if(this.navPath.indexOf(evt.nextId) !== -1){
        this.adjNavPath = true;
        while(this.navPath.indexOf(evt.nextId) !== -1){
          this.navPath.pop();
          window.history.back();
        }
      } else{
        // user has navigated to a tab that needs to go in the BACK button path
        this.navPath.push(evt.activeId);
        window.history.pushState({tab: evt.activeId},'',paths[evt.nextId])
      }
    } else{
      document.getElementById(evt.activeId).blur(); // remove :focus/:hover so underline goes away (CSS)
      this.backButtonHit = false;
    }

    switch(evt.nextId){
      case MENU_TAB_ID:
        this.currentRecipe.selectedTab = MENU_TAB;
        // this.emit("noRecipeSelection");
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
        // this.emit("noRecipeSelection");
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
          setTimeout(() => {
            this.menuTabOpen = true;
            this.urlService.url('/recipes/menu');
          },100); // make sure the scroll is done
          break;
        case VIEW_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.viewScrollPosition);
          setTimeout(() => {
            this.viewTabOpen = true;
            this.urlService.url('/recipes/view');
          },100); // make sure the scroll is done
          break;
        case SEARCH_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.searchScrollPosition);
          setTimeout(() => {
            this.searchTabOpen = true;
            this.urlService.url('/recipes/search');
          },100); // make sure the scroll is done
          break;
        case EDIT_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.editScrollPosition);
          setTimeout(() => {
            this.editTabOpen = true;
            this.urlService.url('/recipes/entry');
          },100); // make sure the scroll is done
          break;
      }
      this.adjNavPath = false;
    },50);    // make sure the tab switch is done       
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    if(this.currentRecipe.selectedTab < EDIT_TAB){
      this.tabSet.select(this.tabNames[this.currentRecipe.selectedTab + 1]); //this causes call to tabChange()
    }
  }

  // move to the previous tab in the tab set
  public prevTab = () => {
    if(this.currentRecipe.selectedTab > SEARCH_TAB){
      this.tabSet.select(this.tabNames[this.currentRecipe.selectedTab - 1]); //this causes call to tabChange()
    }
  }

}
