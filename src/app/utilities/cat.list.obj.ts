import { EventEmitter } from '@angular/core';


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

