import { Injectable, EventEmitter } from '@angular/core';
import { Profile } from './model/profile';
import { Recipe, RecipeData } from './model/recipe';
import { ListTable, ListTableItem } from './model/recipeSvc'
import { SHARED_USER_ID } from './constants'

@Injectable()
export class SlideoutStatus {
  slidenavOpen      : boolean = false;
  aboutMenuOpen     : boolean = false;
  accountMenuOpen   : boolean = false;
  logsMenuOpen      : boolean = false;
  publicLogsMenuOpen: boolean = false;
  listsMenuOpen     : boolean = false;
  aboutOpen         : boolean = false;
}

// definition of UserData

export interface UserData {
  userEmail       : string;           // email address of current user
  password        : string;           // password of current user
  authData        : any;              // authorization data object from sign in process
  profile         : Profile;          // profile object for this user
  messages        : any;              // process messages object (flash messages)
  messageOpen     : boolean;          // indicates a toast message is currently being displayed
  helpContext     : string;           // current context for help information
}

@Injectable()
export class UserInfo {
    userEmail   : string  = "";
    password    : string  = "";
    authData    : any     = null;
    profile     : Profile;
    messages    : { [key: string]: any } = null;
    openToastId : string = null;
    openToastTimer : any = null;

    isSharedUser = () : boolean => {
      return this.authData && (this.authData.uid === SHARED_USER_ID);
    }
}

@Injectable()
export class AboutStatus {
    context : string  = "UsingMyRecipeMongo";   //current context for help information
    open   : boolean = false;

    toggle = () => {
      if(this.open){
        this.closeAbout();
      } else {
        this.openAbout();
      }
    }

    // open the about panel
    openAbout = () => {
      // turn off scrolling on the body while the about panel is open so it can scroll but not the body
      document.body.style.overflowY = 'hidden';
      document.getElementById("about-text").scrollTo(0,0);             // doesn't work if HTML has overflow-?: hidden
      this.open = true;
    }

    // close the about panel
    closeAbout = () => {
      document.body.style.overflowY = '';  // enable body scrolling
      this.open = false;
    }
}

    ////////////////////////////////////////////////////////////
    // Service to hold Match/Display information common to
    // Create and Review classes.
@Injectable()
export class CurrentRecipe {
  recipe            : Recipe;
  mode              : string = "";      // how recipe is being accessed (Create, Review)
  recipeList        : Recipe[];         // list of recipe data
  selectedIndex     : number;           // index of recipe in recipeList
  categoryList      : ListTable;        // table of cagetory items
  selectedTab       : number;
  searchScrollPosition: number;         // Y scroll position of SEARCH tab
  menuScrollPosition: number;           // Y scroll position of MENU tab
  viewScrollPosition: number;           // Y scroll position of VIEW tab
  editScrollPosition: number;           // Y scroll position of EDIT tab

  // return the list index position for the item with the given id
  private listItemIndex = (id: number, itemList: ListTableItem[]) : number => {
    for(let i=0; i<itemList.length; i++){
      if(itemList[i].id === id){ return i;}
    }
    return -1;    //not found
  }

  public categoryListIndex = (id: number) : number => {
    return this.listItemIndex(id, this.categoryList.items)
  }

  public categoryListName = (id: number) : string => {
    if(id === undefined || this.categoryList === undefined){ return '';}
    let i = this.categoryListIndex(id);
    return i >= 0 ? this.categoryList.items[i].name : '<Removed>';
  }

  public categoryListItems = () => {
    if(this.categoryList){ return this.categoryList.items;}
    return undefined;
  }

}

// Class used with CheckboxMenuComponent

export class CatListObj {
  cats: number[] = []; 
  errors: { [key: string]: any } = {};
  statusChanges: EventEmitter<any> | null = new EventEmitter();
  touched: boolean = false;
  invalid: boolean = false;

  // return whether any categories have been assigned to this recipe
  haveCats = () : boolean => {
    return this.cats.length !== 0;
  }

  // clear the categories list
  clear = () => {
    this.cats = [];
    this.check();
  }

  // add the given category from the categories list
  addCat = (cat: number) => {
    this.cats.push(cat);
    this.touched = true;
    this.check();
}

  // remove the given category from the categories list
  removeCat = (cat: number) => {
    var i;

    if(cat !== undefined){
      i = this.cats.indexOf(cat);
      if(i !== -1){
        this.cats.splice(i,1);      // id found
        this.touched = true;
        this.check();
      }
    }
  }
  
  // validation check for categories object
  check = () => {
    if(!this.haveCats()){
      this.errors.required = true;
      this.invalid = true;
    } else {
      if(this.cats.length > 10){
        this.errors.maxnumber = true;
        this.invalid = true;
      } else {
        this.errors = {};
        this.invalid = false;
      }
    }
    this.statusChanges.emit(); // update observable
  }

}

// Class used with FormMessagesComponent

export class FormMsgList {
  msgs: { [key: string]: any } = {};
  messageChange: EventEmitter<any> | null = new EventEmitter();

  //indicate whether there are no status messages
  empty = () : boolean => {
    return Object.keys(this.msgs).length === 0;
  }

  hasMsg = (key : string) : boolean => {
    return this.msgs[key] !== undefined;
  }

  addMsg = (key: string, value : string | boolean = true) => {
    this.msgs[key] = value;
    this.messageChange.emit();
  }

  removeMsg = (key: string) => {
    delete this.msgs[key];
    this.messageChange.emit();
  }

  clearMsgs = () => {
    this.msgs = [];
    this.messageChange.emit();
  }
}
