import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CatListObj } from '../app.globals'

@Component({
  selector: '<app-checkbox-menu>',
  templateUrl : 'checkbox.menu.component.html'
})
export class CheckboxMenuComponent implements OnInit, OnDestroy  {

  @Input() fTitle       : string;   // title for the menu
  @Input() fMessage     : string    // message to display with menu
  @Input() fOnChange    : Function  // function to execute when any checkbox changes
  @Input() fOnSave      : Function; // function to execute on SAVE button
  @Input() fItems       : any[];    // list of all items {id: number, name: string}
  @Input() fCatList     : CatListObj; // CatListObj to use for this menu
  @Input() fOpenMsg     : string;   // message to listen for to open the menu

  
  @Output() fCatListChange = new EventEmitter<CatListObj>();

  selectedItems : boolean[] = [];
  selectList : any[] = [];
  menuOpen : boolean = false;
  menuHidden : boolean = true;

  constructor() {
  };

  ngOnInit() : void {
    document.addEventListener(this.fOpenMsg, this.openMenu);  // listen for the given message
  }

  ngOnDestroy() : void {
    document.removeEventListener(this.fOpenMsg, this.openMenu); // destroy this listener
  }

  // open the category selection list
  openMenu = () => {
    this.filterCategoryList();    // creates selectList from fItems - fCatList.cats
    this.selectedItems.length = this.selectList.length; // allow a flag for each category
    this.selectedItems.fill(false); // set 'selected' flags to false

    // turn off scrolling on the body while the menu is open so the menu can scroll but not the body
    document.body.style.overflowY = 'hidden';
    this.menuOpen = true;
    this.menuHidden = false;
  }

  // close the category selection list
  closeMenu = () => {
    document.body.style.overflowY = '';  // enable body scrolling
    this.menuOpen = false;
    setTimeout(() => { // wait for fade-out before changing z-index
      this.menuHidden = true;
    },500);
  }

  // add the selected items to the category list
  addSelections = () => {
    let added = false;
    for(let i=0; i<this.selectedItems.length; i++){
      if(this.selectedItems[i]){
        this.fCatList.addCat(this.selectList[i].id);     // add selection to list
        added = true;                                   // note something was added
      }
    }
    if(added){ this.fCatListChange.emit(this.fCatList); }  // send update message if necessary
    this.closeMenu();
    if(this.fOnSave) {this.fOnSave(added);}
  }

  // strip out the categories already present and sort the list
  private filterCategoryList = () : void => {
      this.selectList = this.fItems.filter(this.categoryFilter).sort(this.categorySort);
  }

  // use this filter to create a menu of categories that doesn't include the ones already selected
  private categoryFilter = (value) : boolean => {
    return (this.fCatList.cats.indexOf(value.id) === -1);
  }

  //use this as the categoryList sort compare function to sort ascending by name
  private categorySort = (a,b) : number => {return a.name < b.name ? -1 : 1;}


}
