import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { StateService } from "@uirouter/angular";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { RecipeService, CATEGORY_TABLE_NAME, ORIGIN_TABLE_NAME, 
         ListTableItem, ListTable, RecipeFilterData } from '../model/recipeSvc'
import { RecipeData } from '../model/recipe';
import { UNSET_ORIGIN_ID } from '../constants'

    // COMPONENT for MANAGE CATEGORIES feature

@Component({
  templateUrl: 'list.management.component.html'
})
export class ListManagementComponent implements OnInit {
  constructor(private user: UserInfo, private utilSvc: UtilSvc, 
      private stateService: StateService, private recipeSvc: RecipeService){
  };

  listObj             : ListTable;
  listItem            = <ListTableItem>{};
  action              = "";
  checkAll            : boolean   = false; //true if form fields to be checked for errors (touched or not)

  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  itemList            : ListTableItem[]  = undefined;
  requestStatus       : { [key: string]: any }  = {};
  listName            : string;
  listIcon            : string;
  itemReference       : string;
  tableName           : string;
  formTitle           : string;
  helpContext         : string;
  formOpen            : boolean   = false;

  ngOnInit() {
  // make the user log in to manage lists
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessLists"); // let user know they need to log in
    } 
    else {
      switch(this.stateService.current.name){
        case 'manageCategories':
          this.tableName      = CATEGORY_TABLE_NAME;
          this.listName       = 'Category';
          this.listIcon       = 'assessment';
          this.itemReference  = 'a';
          this.formTitle      = 'Recipe Categories';
          this.helpContext    = 'ManageCategories';
          break;
        case 'manageOrigins':
          this.tableName      = ORIGIN_TABLE_NAME;
          this.listName       = 'Origin';
          this.listIcon       = 'face';
          this.itemReference  = 'an';
          this.formTitle      = 'Recipe Origins'; 
          this.helpContext    = 'ManageOrigins';
          break;
      }
      // update the current help context and open the List Management form
      this.utilSvc.setCurrentHelpContext(this.helpContext); // note current state
      this.utilSvc.displayUserMessages();;
      this.recipeSvc.getList(this.tableName, this.user.authData.uid)
      .then((list) => {
          this.listObj      = list;
          this.itemList     = list.items.sort((a,b) : number => {return a.name < b.name ? -1 : 1;});
          this.formOpen     = true;
      })
      .catch((error) => {   // no category table
          this.recipeSvc.initializeTable(this.tableName, this.user.authData.uid)
          .then((list) => {
            this.utilSvc.displayThisUserMessage("initializingList", this.tableName);
            this.listObj      = list;
            this.itemList     = this.listObj.items;
            this.formOpen     = true;
          })
          .catch((error) => {
            this.utilSvc.returnToHomeMsg("errorInitializingList",400, this.tableName); // can't continue, database error
          })
      });
    }
  }

  // delete the item that has been selected
  deleteSelectedItem = (form : NgForm) => {
    this.deleteItem = true;
    this.submitRequest(form)
  }

  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var msg   : string, 
        msgId : string,
        action: string;
    this.checkAll = true;
    this.clearRequestStatus();
    if(this.checkForProblems(form)){   // can't do anything yet, form still has errors
      return;
    }
    this.listItem.id = parseInt(this.selectedItem, 10);
    this.listItem.name = this.newItemName;
    msg = this.listName + " '" + this.listItem.name + "'";
    // now set the action to perform and the status message for the user
    if(this.selectedItem == "999"){  // user specify new item name?
      if(this.getListItemIndexByName(this.newItemName) !== -1){
        this.requestStatus.itemAlreadyInList = true;
        return;
      }
      msgId = "listItemAdded";
      action = "Add";
    } 
    else {
      if(!this.deleteItem){
        msgId = "listItemUpdated";
        action = "Update";
      } else {
        msgId = "listItemRemoved";
        action = "Remove";
      }
    }
    this.utilSvc.displayWorkingMessage(true);
    this.recipeSvc.updateList(this.tableName, this.listItem, action, this.user.authData.uid)   // send the update
    .then((list) => {
      this.itemList = list.items.sort((a,b) : number => {return a.name < b.name ? -1 : 1;});
      this.checkForRecipeAdjustments(this.listItem.id, action)
      .then((success) => {
        this.resetForm(form);
        this.utilSvc.setUserMessage(msgId, msg);
        this.utilSvc.displayWorkingMessage(false);
      })
      .catch((failMsg) => {
        this.utilSvc.setUserMessage(failMsg);
        this.resetForm(form);
        this.utilSvc.displayWorkingMessage(false);
      })
    })
    .catch((error) => {
        this.utilSvc.setUserMessage("errorUpdatingList", this.listName);
        this.resetForm(form);
        this.utilSvc.displayWorkingMessage(false);
      });
  }

  // if the action was 'remove' then see if any recipes contain the listItem and adjust
  // the recipe accordingly
  checkForRecipeAdjustments = (id: number, action: string) : Promise<string> => {
    let promises = [];
    let query = <RecipeFilterData>{};
    query.collectionOwnerId = this.user.authData.uid;

    return new Promise<string>((resolve, reject) => {
      if(action !== 'Remove'){
         resolve('Ok');
      } else {
        // read the necessary data from the affected recipes
        if(this.tableName === CATEGORY_TABLE_NAME){
          query.categories = [id];
          query.projection = {'_id': 1, 'categories': 1}; // read categories list if Removed category
        } else {
          query.origin = id;
          query.projection = {'_id': 1};      // just get object ids if Removed origin
        }
        this.recipeSvc.getRecipes(query)
        .then((data : RecipeData[]) => {
          data.forEach((r) => {
            let updateObj;
            if(this.tableName === CATEGORY_TABLE_NAME){
              // remove category from the recipe's categories list
              let i = r.categories.indexOf(id);
              r.categories.splice(i,1);
              updateObj = {"categories": r.categories};
            } else {
              // replace the origin with UNSET_ORIGIN
              updateObj = {"origin": UNSET_ORIGIN_ID};
            }
            // update each recipe and save a promise for each update request
            promises.push(this.recipeSvc.updateRecipe(r._id, updateObj));
          });
          Promise.all(promises)       // wait till all are done (or 1 fails)
          .then((updateSuccess) => {  //.finally would be nice because either way we're done
            resolve("Ok");})
          .catch((errorUpdating) => {
            reject("errorUpdatingRecipes");})
        })
        .catch((errorReading) => {
          reject('errorReadingRecipesForUpdate');
        })
      }
   });
  }

  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    setTimeout( () => {
      if(this.selectedItem != "999" && this.selectedItem !== ""){
        //need to get the item list index of selectedItem (id)
        this.newItemName = this.itemList[this.getListItemIndexById(parseInt(this.selectedItem,10))].name;
      }
      else{
        this.newItemName = "";
      }
    }, 50);
  }

  // return the list index position for the item with the given id
  getListItemIndexById = (id: number) : number => {
    for(let i=0; i<this.itemList.length; i++){
      if(this.itemList[i].id == id){ return i;}
    }
    return -1;    //not found
  }

  // return the list index position for the item with the given name
  getListItemIndexByName = (n : string) : number => {
    for(let i=0; i<this.itemList.length; i++){
      if(this.itemList[i].name.toLowerCase() === n.toLowerCase() ){ return i;}
    }
    return -1;    //not found
  }

  // get the form ready for another operation
  resetForm(form : NgForm) : void {
    if(form){
      form.resetForm();
    }
    this.checkAll     = false;
    this.selectedItem = "";
    this.deleteItem   = false;
    this.newItemName  = "";
    this.listItem     = <ListTableItem>{};
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () => {
    return ((this.selectedItem != "") && (this.selectedItem != "999"));
  } 

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // return true if there is something wrong with the form input
  checkForProblems(form: NgForm) : boolean {
    if(form.invalid){
      this.requestStatus.formHasErrors = true;
      return true;
    }
    return this.selectedItem == "";
 }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
