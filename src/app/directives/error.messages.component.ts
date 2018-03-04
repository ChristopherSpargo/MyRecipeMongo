import { Component, AfterContentInit, ContentChildren, QueryList, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: '<validation-message>',
  template: '<div *ngIf="show"><ng-content></ng-content></div>'
})
export class ValidationMessageComponent {
  @Input() name: string;
  show: boolean = false;

  showsErrorIncludedIn(errors: string[]): boolean {
    return errors.some(error => error === this.name);
  }
}

@Component({
  selector: '<validation-messages>',
  template: '<ng-content></ng-content>'
})
export class ValidationMessagesComponent implements AfterContentInit, OnDestroy {
  @Input() vField: any;
  @Input() vMultiple: string = "false";
  @ContentChildren(ValidationMessageComponent) messageComponents: QueryList<ValidationMessageComponent>;

  private statusChangesSubscription: Subscription;

  ngAfterContentInit() {
    if(this.vField.statusChanges){
      this.statusChangesSubscription = this.vField.statusChanges.subscribe(x => {
        this.messageComponents.forEach(messageComponent => messageComponent.show = false);

        if (this.vField.invalid) {
          let errorMessageComponentList = this.messageComponents.filter(messageComponent => {
            return messageComponent.showsErrorIncludedIn(Object.keys(this.vField.errors));
          });

          if(errorMessageComponentList.length){
            for(let i=0; i < (this.vMultiple === 'true' ? errorMessageComponentList.length : 1); i++){
              errorMessageComponentList[i].show = true;
            }
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.statusChangesSubscription.unsubscribe();
  }
}

