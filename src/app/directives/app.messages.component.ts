import { Component, AfterContentInit, ContentChildren, QueryList, Input, OnDestroy } from '@angular/core';
import { FormMsgList } from '../app.globals'
import { Subscription } from 'rxjs';

@Component({
  selector: '<app-message>',
  template: '<div *ngIf="show" class="{{class}}"><ng-content></ng-content></div>'
})
export class AppMessageComponent {
  @Input() name: string;      // name to activate this message
  @Input() class: string;     // CSS clas to apply to the message
  show: boolean = false;      // true if template should be displayed

  // see if this component's name is in the given string array
  nameInList(keyList: string[]): boolean {  
    return keyList.some(key => key === this.name);
  }
}


// container component for AppMessageComponent items
@Component({
  selector: '<app-messages>',
  template: '<ng-content></ng-content>'
})
export class AppMessagesComponent implements AfterContentInit, OnDestroy {
  
  @Input() mList  : FormMsgList;            // list of message keys and message texts
  @Input() mMax   : number = 1;             // maximum number of messages to show at one time

  // pick up the list of message components
  @ContentChildren(AppMessageComponent) messageComponents: QueryList<AppMessageComponent>;

  private messageChangeSub: Subscription;

  // subscribe to the messageChange event of the given FormMsgList
  ngAfterContentInit() {
    if(this.messageComponents !== undefined && this.mList.messageChange){
      this.messageChangeSub = this.mList.messageChange.subscribe( () => {
        const mKeys = Object.keys(this.mList.msgs);  // get the keys of messages to show
        let showMore = this.mMax;               // only show mMax messages
        this.messageComponents.forEach(component => {
          if( !component.nameInList(mKeys) || !showMore ){
            component.show = false;             // name of this component not in given key list or mMax shown
          } else {
            component.show = true;              // name in list, display the components content (message)
            showMore--;
          }
        });
      })
    }
  }

  ngOnDestroy() {
    if(this.messageChangeSub) { this.messageChangeSub.unsubscribe(); }
  }
}

