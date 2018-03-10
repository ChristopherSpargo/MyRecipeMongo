// SERVICE to provide various functions needed for data storage/retreival
import { Injectable } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc'
import { FireBaseSvc } from '../utilities/fireBaseSvc'
import { Profile, RESTRICTION_WRITE } from './profile';
import { UserInfo } from '../utilities/user.info.service';


//******************************************************************************
//  UserSvc provides functions associated with user accounts and profiles

@Injectable()
export class UserSvc {

    constructor(private userInfo: UserInfo, private fireBaseSvc: FireBaseSvc,
       private utilSvc: UtilSvc) {
    }

      // update the given user profile, return a promise
      // returns: promise
      updateUserProfile(user : any){
        if(user.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.updateUserProfile(user.authData, user.profile);
      }

      // read the given user profile properties, return a profile
      // returns: promise
      readUserProfile(user : any){
        return this.fireBaseSvc.readUserProfile(user.authData);
      }

      // read the given user profile properties, return a profile
      // returns: promise
      createUserProfile(user){
        if(user.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.createUserProfile(user.authData, user.profile);
      }

      // delete the profile associated with the given user
      // returns: promise
      removeUserProfile(user : any){
        if(user.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.removeUserProfile(user.authData);
      }

      // delete the account associated with the given email and password
      // returns: promise
      deleteAccount(email : string, password : string){
        if(this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.deleteAccount(email, password);
      }

      // change the email associated with the given email and password
      // returns: promise
      changeEmail(currEmail : string, password : string, newEmail : string){
        if(this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.changeEmail(currEmail, password, newEmail)
      }

      // create an account for the given email and password
      // returns: promise
      createAccount(email : string, password : string){
        return this.fireBaseSvc.createAccount(email, password);
      }

      // verify there is an account for the given email and password
      // return a promise with credentials if successfull
      // returns: promise
      authWithPassword(email : string, password : string){
        return this.fireBaseSvc.authWithPassword(email, password);
      }

      // have FireBase send a message with a temporary password to the given email
      // returns: promise
      resetPassword(email : string){
        if(this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.resetPassword(email);       
      }

      // change the password associated with the given email
      // returns: promise
      changePassword(email : string, currPassword : string, newPassword : string) : Promise<any> {
        if(this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)){
          this.utilSvc.setUserMessage("noWriteAccess");          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject("NO_ACCESS: WRITE");
            }, 100);
          });
        }
        return this.fireBaseSvc.changePassword(email, currPassword, newPassword);
      }

}