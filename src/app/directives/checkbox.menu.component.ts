import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CatListObj } from './cat.list.obj'

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
  @Input() fAllowNew    : boolean = false; // true if user can add item to menu
  @Input() fUpdateFn    : Function; // function to call to update the cat list (add new cat)

  
  @Output() fCatListChange = new EventEmitter<CatListObj>();

  selectedItems : boolean[] = [];
  selectList    : any[]     = [];
  menuOpen      : boolean   = false;
  menuHidden    : boolean   = true;
  newCat        : string    = "";
  newCatNew     : boolean   = false;
  newCatSelected: boolean   = false;
  selectionsAdded: boolean  = false;

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
    this.newCat = '';
    this.newCatSelected = false;
    this.clearItemInListError();
    this.menuOpen = false;
    setTimeout(() => { // wait for fade-out before changing z-index
      this.selectionsAdded = false;
      this.menuHidden = true;
    },700);
  }

  // add the selected items to the category selections
  addSelections = () => {
    this.selectionsAdded = true;
    let added = false;
    if(this.newCatOk()){
      <Promise<number>>this.fUpdateFn(this.newCat) // update categories list and return id for new category
      .then((id) => {
        if(this.newCatSelected){
          this.fCatList.addCat(id);       // add new category selection to list
          this.finishAdd(true);
        } else{
          this.finishAdd(false);
        }       
      })
      .catch((error) => {
        this.finishAdd(false);
      });
    } else{
      this.finishAdd(false);
    }
  }

  // finish adding items to category selections
  finishAdd = (added : boolean) => {
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

  checkNewCat = () => {
    this.newCat = this.newCat.toLowerCase();
    this.newCat = this.newCat.replace(/\b[a-z]/g,
                     (x :string) : string =>{ return x.charAt(0).toUpperCase() + x.substr(1); })

    // report an error if new category is already in the categories list
    if(this.catInList(this.newCat)){
      this.fCatList.errors.itemInList = true;
      this.fCatList.touched = true;
      this.fCatList.invalid = true;
      this.fCatList.statusChanges.emit(); // cause error to be shown
      this.newCatNew = false;
    } else{
      this.clearItemInListError();
      this.newCatNew = true;
    }
  }

  clearItemInListError = () => {
    if(this.fCatList.errors && this.fCatList.errors['itemInList']){
      delete this.fCatList.errors['itemInList'];   //remove this message
    }
    this.fCatList.touched = true;
    this.fCatList.invalid = Object.getOwnPropertyNames(this.fCatList.errors).length !== 0;
    this.fCatList.statusChanges.emit(); // cause error to be shown
  }

  catInList = (cat: string) : boolean => {
    for(let i=0; i<this.fItems.length; i++){
      if(this.fItems[i].name === cat){ return true;}
    }
    return false;    //not found
  }

  newCatOk = () => {
    return this.newCat !== '' && this.newCatNew;
  }
}
