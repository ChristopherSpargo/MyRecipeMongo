import { Injectable, EventEmitter } from '@angular/core';
import { Profile } from '../model/profile';

export const SHARED_USER_ID       : string = "b6d96237-7b30-4d2a-838d-7e85d4bb8092";

//******************************************************************************
// UserInfo service holds information about the current user

// definition of UserData
export interface UserData {
  userEmail       : string;           // email address of current user
  password        : string;           // password of current user
  authData        : any;              // authorization data object from sign in process
  profile         : Profile;          // profile object for this user
  messages        : any;              // process messages object (flash messages)
  openToastId     : string;           // id for toast message currently being displayed
  openToastTimer  : any;              // timerId for currently displayed toast
}

@Injectable()
export class UserInfo {
    userEmail   : string  = "";
    password    : string  = "";
    authData    : any     = null;
    profile     : Profile;
    messages    : { [key: string]: any } = null;
    openToastId : string = null;
    openToastTimer : any = null;

    isSharedUser = () : boolean => {
      return this.authData && (this.authData.uid === SHARED_USER_ID);
    }
}

