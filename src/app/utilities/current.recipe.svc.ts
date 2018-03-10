import { Injectable } from '@angular/core';
import { Recipe } from '../model/recipe';
import { ListTable, ListTableItem } from '../model/recipeSvc'

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

  // return the id associated with the given category name, return 0 if not found
  public categoryListId = (name: string) : number => {
    if(name === undefined || this.categoryList === undefined){ return 0;}
    for(let i=0; i<this.categoryList.items.length; i++){
      if(this.categoryList.items[i].name === name){ return this.categoryList.items[i].id;}
    }
    return 0;    //not found
  }

  public categoryListItems = () => {
    return this.categoryList ? this.categoryList.items : undefined;
  }

}

