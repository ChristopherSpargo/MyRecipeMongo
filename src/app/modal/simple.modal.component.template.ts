import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'simple.modal.component.html'
})

export class SimpleModalComponentTemplate {
  @Input() title      : string;
  @Input() titleIcon  : string = 'person';
  @Input() content    : string;
  @Input() okText     : string;
  @Input() cancelText : string;
  @Input() notifyOnly : boolean;
  @Input() openModal  : boolean;

  constructor(public activeModal: NgbActiveModal) {}

  // call the resolve method after waiting for closing animation
  close = () => {
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.close("OK");
    }, 400)
  }

  // call the resolve method after waiting for closing animation
  dismiss = () => {
    this.openModal = false;
    setTimeout( () => {
      this.activeModal.dismiss("CANCEL");
    }, 400)
  }

}
