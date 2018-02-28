import { Injectable } from '@angular/core';
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
    messageOpen : boolean = false;

    isSharedUser = () : boolean => {
      return this.authData && (this.authData.uid === SHARED_USER_ID);
    }
}

@Injectable()
export class AboutStatus {
    context : string  = "UsingMyRecipeMongo";   //current context for help information
    open   : boolean = false;

    toggle = () => {
      this.open = !this.open;
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
  originList        : ListTable;        // table of origin items
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

  public originListIndex = (id: number) : number => {
    return this.listItemIndex(id, this.originList.items)
  }

  public categoryListName = (id: number) : string => {
    if(id === undefined || this.categoryList === undefined){ return '';}
    let i = this.categoryListIndex(id);
    return i >= 0 ? this.categoryList.items[i].name : 'Removed';
  }

  public originListName = (id: number) : string => {
    if(id === undefined || this.originList === undefined){ return '';}
    let i = this.originListIndex(id);
    return i >= 0 ? this.originList.items[i].name : 'Removed';
  }

  public categoryListItems = () => {
    if(this.categoryList){ return this.categoryList.items;}
    return undefined;
  }

  public originListItems = () => {
    if(this.originList){ return this.originList.items;}
    return undefined;
  }

}


