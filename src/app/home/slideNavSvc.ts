import { Injectable } from '@angular/core';

@Injectable()
export class SlideNavSvc {
  recipesMenuOpen   : boolean = false;
  accountMenuOpen   : boolean = false;
  aboutMenuOpen     : boolean = false;
  slidenavOpen      : boolean = false;

  constructor(){
  }

  // return open status of the slideMenu
  isOpen = () : boolean => {
    return this.slidenavOpen;
  }

  // cause the slide menu to open/close
  toggle() {
    this.slidenavOpen = !this.slidenavOpen;
  }
  
  // make sure the slide menu is open
  open() : void {
      this.slidenavOpen = true;
  }

  // make sure the slide menu is closed
  close() : void {
      this.slidenavOpen = false;
  }
  
  // return the open status of the selected submenu
  isOpenSub = (name: string) : boolean =>{
    switch(name){
      case 'Recipe':
        return this.recipesMenuOpen;
      case 'Account':
        return this.accountMenuOpen;
      case 'About':
        return this.aboutMenuOpen;
    }
  }

  // change the open status of the selected submenu of the slide menu
  toggleSub = (menu: string) : void => {
    switch(menu){
      case 'Recipe':
        this.aboutMenuOpen = false;
        this.accountMenuOpen = false;
        setTimeout( () => {
          this.recipesMenuOpen = !this.recipesMenuOpen;
        }, 100);
        break;
      case 'Account':
        this.aboutMenuOpen = false;
        this.recipesMenuOpen = false;
        setTimeout( () => {
          this.accountMenuOpen = !this.accountMenuOpen;
        }, 100);
        break;
      case 'About':
        this.accountMenuOpen = false;
        this.recipesMenuOpen = false;
        setTimeout( () => {
          this.aboutMenuOpen = !this.aboutMenuOpen;
        }, 100);
        break;
      case 'None':
        this.aboutMenuOpen = false;
        this.accountMenuOpen = false;
        this.recipesMenuOpen = false;
        break;
    }
  }

}
