import {Component, Input} from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SimpleModalComponentTemplate } from './simple.modal.component.template'
import { RecipeActionModalComponentTemplate } from './recipe.action.modal.component.template'
import { SharedRecipeSettingsModalComponentTemplate } from './shared.recipe.settings.modal.component.template';

@Component({
  selector: 'app-modal',
  template: "<ng-content></ng-content>"
})

export class ModalComponent {

  constructor(private modalService: NgbModal) {}

  simpleOpen(title: string, content: string, cancelText: string, okText: string) : Promise<any> {
    const modalRef = this.modalService.open(SimpleModalComponentTemplate, {size: 'lg'});
    modalRef.componentInstance.title      = title;
    modalRef.componentInstance.content    = content;
    modalRef.componentInstance.cancelText = cancelText;
    modalRef.componentInstance.okText     = okText;
    modalRef.componentInstance.notifyOnly = cancelText == "";
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }

  recipeActionOpen(heading: string, recipeTitle: string, origin: string, originDate: string, 
                  cancelText: string, okText: string) : Promise<any> {
    const modalRef = this.modalService.open(RecipeActionModalComponentTemplate, {size: 'lg'});
    modalRef.componentInstance.heading      = heading;
    modalRef.componentInstance.recipeTitle  = recipeTitle;
    modalRef.componentInstance.origin       = origin;
    modalRef.componentInstance.originDate   = originDate;
    modalRef.componentInstance.cancelText   = cancelText;
    modalRef.componentInstance.okText       = okText;
    modalRef.componentInstance.notifyOnly   = cancelText == "";
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }

  sharedSettingsOpen(heading: string, emailList: string[], recipeTitle: string, origin: string,
     originDate: string, mode: string, toggleAbout: Function, okText ?: string, deleteText ?: string, cancelText ?: string) : Promise<any> {
    const modalRef = this.modalService.open(SharedRecipeSettingsModalComponentTemplate, 
                                                            {size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.mode         = mode;
    modalRef.componentInstance.heading      = heading;
    modalRef.componentInstance.itemList     = emailList;
    modalRef.componentInstance.recipeTitle  = recipeTitle;
    modalRef.componentInstance.origin       = origin;
    modalRef.componentInstance.originDate   = originDate;
    modalRef.componentInstance.cancelText   = cancelText || "Cancel";
    modalRef.componentInstance.okText       = okText || "Save";
    modalRef.componentInstance.deleteText   = deleteText || "Make Private";
    modalRef.componentInstance.toggleAbout  = toggleAbout;
    setTimeout( ()=> {
      modalRef.componentInstance.openModal  = true;
    }, 100);
    return modalRef.result;
  }

}