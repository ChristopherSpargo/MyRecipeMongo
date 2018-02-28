  //SERVICE to provide access to the Firebase database used for authentiction and storage of user profiles
import { Injectable } from '@angular/core';
import { Profile } from '../model/profile'

declare function Firebase(path: string): void;

@Injectable()
export class FireBaseSvc {

fbRef;
fbUsersRef;

  constructor() {
      
    this.fbRef = new Firebase("https://luminous-torch-895.firebaseio.com/");
    this.fbUsersRef = new Firebase("https://luminous-torch-895.firebaseio.com/Organizer/Users");
 }

      
      
  // create a new user account using the given email and password
  // return a promise
  createAccount(userEmail: string, password: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbRef.createUser({
        email: userEmail,
        password: password
      },
        function (error, userData) {
          if (error) {
            reject(error.code);
          } else {
            resolve(userData);
          }
        });
    });
  }

  // delete the account assosiated with the given email and password
  // return a promise
  deleteAccount(userEmail: string, password: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbRef.removeUser({
        email: userEmail,
        password: password
      },
        function (error, userData) {
          if (error) {
            reject(error.code);
          } else {
            resolve(userData);
          }
        });
    });
  }

  // submit the given email and password for authentication
  // return a promise
  authWithPassword(userEmail: string, password: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbRef.authWithPassword({
        "email": userEmail,
        "password": password
      }, function (error, authData) {
        if (error) {
          reject(error.code);
        } else {
          resolve(authData);
        }
      });
    });
  }

  // request an email containing a temporary password be sent to the given email address
  // return a promise
  resetPassword(userEmail: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbRef.resetPassword({
        email: userEmail
      }, function (error) {
        if (error) {
          reject(error.code);
        } else {
          resolve('Sent');
        }
      });
    });
  }

  // change the password associated with the given email and oldPassword to the given newPassword
  // return a promise
  changePassword(userEmail: string, oldPassword: string, newPassword: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbRef.changePassword({
        email: userEmail,
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function (error) {
        if (error) {
          reject(error.code);
        } else {
          resolve('Changed');
        }
      });
    });
  }

  // change the email associated with the given email and password to the given newEmail
  // return a promise
  changeEmail(currEmail: string, password: string, newEmail: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbRef.changeEmail({
        oldEmail: currEmail,
        password: password,
        newEmail: newEmail
      }, function (error) {
        if (error) {
          reject(error.code);
        } else {
          resolve('Changed');
        }
      });
    });
  }

  // read the profile for the user whose user id is contained in the given authData object
  // return a promise
  readUserProfile(authData) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbUsersRef.child(authData.uid).child('Profile').once("value", function (snapshot) {
        if(snapshot.exists()) {
          resolve(Profile.build(snapshot.val())); // resolve with Profile object containing the stored data
        } else {
          reject(null);
        }
      },
      function(err) {
        reject(err);
      });
    });
  }

  // create a profile for the user whose id is contained in the given authData object 
  // using the given profile object
  // reurn a promise
  createUserProfile(authData, profile : Profile) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbUsersRef.child(authData.uid).child('Profile').set(profile.getProfileProperties(), function (error) {
        if (error) {
          reject(error);
        } else {
          resolve(profile);
        }
      })
    });
  }

  // update the profile for the given user using the given profile object
  // reurn a promise
  updateUserProfile(authData, profile: Profile) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbUsersRef.child(authData.uid).child('Profile').update(profile.getProfileProperties(), function (error) {
        if (error) {
          reject(error);
        } else {
          resolve(profile);
        }
      })
    });
  }

  // remove all data for the given user
  // return a promise
  removeUserProfile(authData) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbUsersRef.child(authData.uid).remove(function (error) {
        if (error) {
          reject(error);
        } else {
          resolve("Ok");
        }
      })
    });
  }

}
