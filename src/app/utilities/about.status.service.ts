import { Injectable, EventEmitter } from '@angular/core';

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

