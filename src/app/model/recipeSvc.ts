import { Injectable } from '@angular/core';
import { RecipeData } from '../model/recipe';
import { Http, Response } from '@angular/http';
// import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { Profile, RESTRICTION_WRITE } from './profile';

export const CATEGORY_TABLE_NAME = 'categories';
export const ORIGIN_TABLE_NAME   =    'origins';
export const RECIPE_TABLE_NAME   =    'recipes';

// define structure of list table items
export interface ListTableItem {
  id      : number;
  name    : string;
}

// define structure for list tables
export interface ListTable {
  _id?    : string;
  userId  : string;
  nextId  : number;
  items   : ListTableItem[];
}

// define structure for recipe query params
export interface RecipeFilterData {
  recordId          : string;
  collectionOwnerId : string,
  title             : string,
  origin            : number,
  categories        : number[],
  keywords          : string,
  startDate         : string,
  endDate           : string,
  sortOrder         : string,
  checkEmail       ?: string,
  projection       ?: {},
  userId           ?: string
}


@Injectable()
export class RecipeService {
    // private apiUrl = 'http://localhost:4250/api/'
    private apiUrl = 'https://serve-mdb.appspot.com/api/'
    private recipesUrl = this.apiUrl + RECIPE_TABLE_NAME;

    constructor (private http: Http, private utilSvc: UtilSvc, private userInfo: UserInfo) {}

    // get("/api/recipes")
    getRecipes(filter: RecipeFilterData): Promise<void | RecipeData[]> {
      let queryStr = '';
      for(let item in filter){
        switch(item){
          case 'recordId':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'id=' + filter.recordId;
            break;
          case 'collectionOwnerId':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'u=' + filter.collectionOwnerId;
            break;
          case 'title':
          break;
          case 'origin':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'o=' + filter.origin;
            break;
          case 'categories':
            queryStr += queryStr.length ? '&' : '?';
            if(filter.categories.length){
              queryStr += 'c=' + filter.categories;
            }
            break;
          case 'keywords':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'k=' + filter.keywords;
            break;
          case 'startDate':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'sd=' + filter.startDate;
            break;
          case 'endDate':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'ed=' + filter.endDate;
            break;
          case 'checkEmail':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'ce=' + filter.checkEmail;
            break;
          case 'projection':
            queryStr += queryStr.length ? '&' : '?';
            queryStr += 'pr=' + JSON.stringify(filter.projection);
            break;
         default:
        }
      }

      return this.http.get(this.recipesUrl+queryStr)
                 .toPromise()
                 .then(response => response.json() as RecipeData[])
                 .catch((error) => {});
    }

    // post("/api/recipes[/:id]")
    saveRecipe(newRecipe: RecipeData): Promise<void | RecipeData> {
      return this.http.post(this.recipesUrl + (newRecipe._id ? ('/' + newRecipe._id) : ''), newRecipe)
                .toPromise()
                .then(response => response.json() as RecipeData)
                .catch((error) => {});
    }

    // get("/api/recipes/:id") 
    getRecipe(getRecipeId: String): Promise<void | RecipeData> {
      return this.http.get(this.recipesUrl + '/' + getRecipeId)
                 .toPromise()
                 .then(response => response.json() as RecipeData)
                 .catch((error) => {});
    }

    // delete("/api/recipes/:id")
    updateRecipe(updateRecipeId: String, updateObj: any): Promise<void | number> {
       return this.http.put(this.recipesUrl + '/' + updateRecipeId, updateObj)
                .toPromise()
                .then(response => response.json() as number)
                .catch(error => {});
    }

    // delete("/api/recipes/:id")
    deleteRecipe(delRecipeId: String): Promise<void | String> {
       return this.http.delete(this.recipesUrl + '/' + delRecipeId)
                .toPromise()
                .then(response => response.json() as String)
                .catch(error => {});
    }

    // read the list from the given list table in the database
    // note**: this is not called to read from the matches table, see queryMatchTable
    // returns: promise
    // get("/api/<list>")
    readList(tableName: string, uid: string): Promise<any | ListTable[]> {
      return this.http.get(this.apiUrl + tableName + "?userId=" + uid)
                 .toPromise()
                 .then(response => response.json() as ListTable[])
                 .catch((error) => {});
    }

      // write the given item to the given table in the database 
      // use /api/tableName[/:id]
      // returns: promise
    writeList(tableName: string, list: ListTable): Promise<any | string | ListTable> {
      if(this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)){
        this.utilSvc.setUserMessage("noWriteAccess");          
        return new Promise<string>((resolve,reject) => {
          setTimeout(() => {
            reject("NO_ACCESS: WRITE");
          }, 100);
        });
      }
      return this.http.post(this.apiUrl + tableName + (list._id ? ('/' + list._id) : ''), list)
                .toPromise()
                .then(response => response.json() as ListTable)
                .catch((error) => {});
    }

      // delete the selected item from the given table in the database 
      // returns: promise
    deleteList(tableName: string, list: ListTable) : Promise<any | string | String> {
      if(this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)){
        this.utilSvc.setUserMessage("noWriteAccess");          
        return new Promise<string>((resolve,reject) => {
          setTimeout(() => {
            reject("NO_ACCESS: WRITE");
          }, 100);
        });
      }
       return this.http.delete(this.apiUrl + tableName)
                .toPromise()
                .then(response => response.json() as String)
                .catch((error) => {});
    }

    // get the list of items from specified table
    // returns: promise
    getList(tableName : string, id : string) : Promise<ListTable | any> {
      
      return new Promise<ListTable | any>((resolve, reject) => {
        this.readList(tableName, id)
        .then((list) => {
          if(!list.length){
            reject("INF - "+tableName+" not found");
          } else{
            resolve(list[0]);
          }
        })
        .catch((error) => {
          reject(error);
        })
      })
    }

    // save the specified list
    // returns: promise
    saveList(list : ListTable, tableName : string ) : Promise<ListTable | any> {
      return new Promise<ListTable | any>((resolve, reject) => {
        this.writeList(tableName, list)
        .then((list) => {
          resolve(list);})
        .catch((error) => {
          reject(error);})
      })
    }

    // Add or update the given list
    // return: promise
    updateList(tableName: string, item: ListTableItem, action: string, uid: string){

      var pending = [];
      var tableType : string;

      action = action || "Add";

      if(action == "Remove"){ // check for item present in any recipes
        var filter : any = {
          id: uid,
          countOnly: true
        };
        switch(tableName){
          case CATEGORY_TABLE_NAME:
            filter.categories = [item.id];
            tableType = 'Catecory';
            break;
          case ORIGIN_TABLE_NAME:
            filter.origin = [item.id];
            tableType = 'Origin';
            break;
        }
      }
      return new Promise<any>((resolve, reject) => {
        Promise.all(pending)
        .then((success) => {
          this.getList(tableName, uid)
          .then((pList : ListTable) => {
            let tItems = pList.items;
            for(var i=0; i<tItems.length; i++){
              if(tItems[i].id == item.id){
                break;
              }
            }
            if(i<tItems.length){
              if(action == "Update"){
                tItems[i] = item;          // Update item
              }
              else {
                tItems.splice(i,1);        // Remove item
              }
            }
            else{
              item.id = pList.nextId++;    // assign next id value
              tItems.push(item);           // Add item
            }
            this.saveList(pList, tableName)
            .then((list) => {
              resolve(list);})
            .catch((error) => {
              reject(error);})
          })
          .catch((error) => { //no Table found
            if(/INF/.test(error) && action == "Add"){
              this.saveList({userId: uid, nextId: 2, items: [item]}, tableName)
              .then((list) => {
                resolve(list);})
              .catch((error) => {
                reject(error);})}
            else {
              reject(error);}
          });
        })
        .catch((error) => {
          reject(error);
        });
      })
    }

    // initialize the selected table
    // tableName = name of the table to initialize
    // uid       = login id of the current user
    initializeTable(tableName: string, uid: string) : Promise<any | ListTable> {
      let iList : ListTable;
      switch(tableName){
        case CATEGORY_TABLE_NAME:
          iList = 
              { userId: uid,
                nextId: 22,
                items: [{id: 1, name:'Dinner'},{id: 2, name:'Breakfast'},
                  {id: 3, name:'Lunch'},{id: 4, name:'Dessert'},
                  {id: 5, name:'Pastries'},{id: 6, name:'Meat'},{id: 7, name:'Mexican'},
                  {id: 8, name:'Appetizer'},{id: 9, name:'Entre'},{id: 10, name:'Side Dishes'},
                  {id: 11, name:'Holiday'},{id: 12, name:'Snack'},{id: 13, name:'Salads'},{id: 14, name:'Fish'},
                  {id: 15, name:'Beef'},{id: 16, name:'Chicken'},{id: 17, name:'Pork'},
                  {id: 18, name:'Casseroles'},{id: 19, name:'Cookies'},{id: 20, name:'Bread'},
                  {id: 21, name:'Drinks'}]
              };
          break;
        case ORIGIN_TABLE_NAME:
          iList =
              { userId: uid,
                nextId: 5,
                items: [{id: 1, name:'Unknown'}, {id: 2, name:'TV'},{id: 3, name:'Internet'},
                        {id: 4, name:'Magazine'}]
              };
          break;
      }
      return this.saveList(iList, tableName);
    }

}