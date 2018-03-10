import { EventEmitter } from '@angular/core';


// Class used with FormMessagesComponent

export class FormMsgList {
  msgs: { [key: string]: any } = {};
  messageChange: EventEmitter<any> | null = new EventEmitter();

  // indicate whether the message list is empty
  empty = () : boolean => {
    return Object.keys(this.msgs).length === 0;
  }

  // indicate whether there is a specific status message in the list
  hasMsg = (key : string) : boolean => {
    return this.msgs[key] !== undefined;
  }

  // add a message to the list
  addMsg = (key: string, value : string | boolean = true) => {
    this.msgs[key] = value;
    this.messageChange.emit();
  }

  // remove a message from the list
  removeMsg = (key: string) => {
    delete this.msgs[key];
    this.messageChange.emit();
  }

  // clear the list
  clearMsgs = () => {
    this.msgs = [];
    this.messageChange.emit();
  }
}
