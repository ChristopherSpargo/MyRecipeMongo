import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: '<app-checkbox-menu>',
  templateUrl : 'checkbox.menu.component.html'
})
export class CheckboxMenuComponent implements OnInit, OnDestroy  {

  @Input() fTitle       : string;   // title for the menu
  @Input() fMessage     : string   // message to display with menu
  @Input() fOnChange    : Function  // function to execute when any checkbox changes
  @Input() fOnSave      : Function; // function to execute on SAVE button
  @Input() fItems       : any[];    // list of all items {id: number, name: string}
  @Input() fSelected    : number[];   // list of currently selected item ids
  @Input() fOpenMsg     : string;   // message to listen for to open the menu

  
  @Output() fSelectedChange = new EventEmitter<any[]>();

  selectedItems : boolean[] = [];
  selectList : any[] = [];
  menuOpen : boolean = false;

  constructor() {
  };

  ngOnInit() : void {
    document.addEventListener(this.fOpenMsg, this.openMenu);
  }

  ngOnDestroy() : void {
    document.removeEventListener(this.fOpenMsg, this.openMenu);
  }

  // open the category selection list
  openMenu = () => {
    this.filterCategoryList();    // creates selectList from fItems - fSelected
    this.selectedItems.length = this.selectList.length; // allow a flag for each category
    this.selectedItems.fill(false); // set 'selected' flags to false
    this.menuOpen = true;
  }

  // close the category selection list
  closeMenu = () => {
    this.menuOpen = false;
  }

  // add the selected items to the fSelected list
  addSelections = () => {
    let touched = false;
    for(let i=0; i<this.selectedItems.length; i++){
      if(this.selectedItems[i]){
        this.fSelected.push(this.selectList[i].id);
        touched = true;
      }
    }
    if(touched){ this.fSelectedChange.emit(this.fSelected); }
    this.closeMenu();
    if(this.fOnSave) {this.fOnSave(touched);}
  }

  // strip out the categories already present and sort the list
  private filterCategoryList = () : void => {
      this.selectList = this.fItems.filter(this.categoryFilter).sort(this.categorySort);
  }

  // use this filter to create a menu of categories that doesn't include the ones already selected
  private categoryFilter = (value) : boolean => {
    return (this.fSelected.indexOf(value.id) === -1);
  }

  //use this as the categoryList sort compare function to sort ascending by name
  private categorySort = (a,b) : number => {return a.name < b.name ? -1 : 1;}


}
