import { Component, DoCheck, ContentChildren, QueryList, Input } from '@angular/core';

@Component({
  selector: '<app-message>',
  template: '<div *ngIf="show" class="{{class}}"><ng-content></ng-content></div>'
})
export class AppMessageComponent {
  @Input() name: string;
  @Input() class: string;
  show: boolean = false;

  nameInList(keyList: string[]): boolean {
    return keyList.some(key => key === this.name);
  }
}

@Component({
  selector: '<app-messages>',
  template: '<ng-content></ng-content>'
})
export class AppMessagesComponent implements DoCheck {
  
  @Input() mList  : { [key: string]: any }; // list of message keys and message texts
  @Input() mMax   : number = 1;             // maximum number of messages to show at one time
  @ContentChildren(AppMessageComponent) messageComponents: QueryList<AppMessageComponent>;

  ngDoCheck() {
    if(this.messageComponents !== undefined){
      const mKeys = Object.keys(this.mList);
      let showMore = this.mMax; 
      this.messageComponents.forEach(component => {
        if( !component.nameInList(mKeys) || !showMore ){
          component.show = false;
        } else {
          component.show = true;
          showMore--;
        }
      });
    }
  }
}

