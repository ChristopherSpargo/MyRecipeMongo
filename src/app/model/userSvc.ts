// SERVICE to provide various functions needed for data storage/retreival
import { Injectable } from '@angular/core';
import { UserInfo } from '../app.globals';
import { UtilSvc } from '../utilities/utilSvc'
import { FireBaseSvc } from '../utilities/fireBaseSvc'
import { Profile, RESTRICTION_WRITE } from './profile';

interface ParamObj {
  TableName: string;
  [propName: string]: any;
}


@Injectable()
export class UserSvc {

    constructor(private userInfo: UserInfo, private fireBaseSvc: FireBaseSvc, 
      private utilSvc: UtilSvc) {
    }

  //******************************************************************************
  //        functions associated with user accounts and profiles


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

      //remove database items associated with this user
      //return: array of promises
      // removeUserData(aUser : any){
      //   var promises  = [];
      //   var id = aUser.authData.uid;

      //   promises.push(this.deleteTableItem(EVENT_TABLE_NAME, id));
      //   promises.push(this.deleteTableItem(TOURNAMENT_TABLE_NAME, id));
      //   promises.push(this.deleteTableItem(LOCATION_TABLE_NAME, id));
      //   promises.push(this.deleteTableItem(PLAYER_TABLE_NAME, id));
      //   return new Promise((resolve, reject) => {
      //     this.queryMatchTable(id)
      //     .then((data) => {
      //       data.Items.forEach(function(m){
      //         promises.push(this.deleteTableItem(this.MATCH_TABLE_NAME, id, m.sortDate));
      //       });
      //       Promise.all(promises)
      //       .then((success) => {        //.finally?
      //         resolve("Ok");})
      //       .catch((error) => {
      //         resolve("Ok");})
      //     });
      //   })
      // }
}