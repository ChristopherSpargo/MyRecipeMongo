import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentRecipe } from '../app.globals';
import { SHARED_USER_ID } from '../constants';
import { RecipeService, CATEGORY_TABLE_NAME, ORIGIN_TABLE_NAME, 
         ListTable, ListTableItem, RecipeFilterData } from '../model/recipeSvc';
import { Recipe, RecipeData, RecipePic } from '../model/recipe';

@Component({
  selector: '<app-recipe-menu>',
  templateUrl: 'recipe.menu.component.html'
})
export class RecipeMenuComponent implements OnInit, OnDestroy {

  @Input() menuOpen    : boolean;    // indicates this panel should open
  @Input() viewShared      : boolean = false;  // indicates user is viewing shared recipes
  @Input() manageShared    : boolean = false;  // indicates manage shared recipes feature being used
  @Input() constructMenuMessage  : Function;  // function to format menuMessage

  sharedFilter        : string = "Either" // select for which recipes are shown in search results
  recipeSelectFlags   : boolean[] = [];

  constructor(private userInfo : UserInfo, private utilSvc : UtilSvc, private recipeSvc : RecipeService,
              private currentRecipe: CurrentRecipe){};

  ngOnInit() {
    document.addEventListener("reverseRecipeMenu", this.toggleSortOrder);
    document.addEventListener("resetSharedFilter", this.resetSharedFilter);
  }
  ngOnDestroy() {
    document.removeEventListener("resetSharedFilter", this.resetSharedFilter);
    document.removeEventListener("reverseRecipeMenu", this.toggleSortOrder);
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  public menuRecipeList = () : Recipe[] => {
    return this.currentRecipe.recipeList;
  }
  
  // indicate if the shared status choices should be shown
  allowStatusChoice = () => {
    return !this.viewShared;
  }
  
  // indicate if share icon should be shown with menu item
  showShareIcon = (r : Recipe) => {
    return (!this.userInfo.isSharedUser() && !this.viewShared && !r.data.sharedItem_id);
  }

  // indicate if share icon should be shown with menu item
  showSharedSettingsIcon = (r : Recipe) => {
    return (!this.userInfo.isSharedUser() && !this.viewShared && r.data.sharedItem_id);
  }

  // indicate if share icon should be shown with menu item
  showDeleteIcon = (r : Recipe) => {
    return (!this.viewShared);
  }

  // get an image to display for the menu item
  getMenuImage = (r: Recipe) : string => {
    if(r.data.mainImage){ return r.data.mainImage.picURL}
    return 'assets/images/cards2.jpg';
  }

  // return the Origin name for the given Recipe
  getOriginName = (r : Recipe) : string => {
    return this.currentRecipe.originListName(r.data.origin);
  }

  // return the Origin date for the given Recipe
  getOriginDate = (r : Recipe) : string => {
    return this.utilSvc.displayOriginDate(r.data.originDate);
  }

  // return the Description text (first 200 chars) for the given Recipe
  getDescription = (r : Recipe) : string => {
    if(r.data.description.length <= 200){
      return r.data.description;
    }
    return (r.data.description.substr(0,200) + '...');
  }

  // delete the selected recipe
  public deleteMenuItem = (index : number) => {
    var r : RecipeData = this.menuRecipeList()[index].data;

    this.utilSvc.confirmRecipeAction('Delete Recipe', r.title, 
                            this.currentRecipe.originListName(r.origin), 
                            this.utilSvc.displayOriginDate(r.originDate), 'Delete')
    .then((deleteIt) => {
      this.recipeSvc.deleteRecipe(r._id)
      .then((success) => {
        this.menuRecipeList().splice(index, 1);    //remove item from Recipe array
        this.emit('updateMenuTabLabel');
        if(this.menuRecipeList().length === 0){this.emit('selectSearchTab');} // menu now empty
      })
      .catch((failure) => {
        this.utilSvc.displayThisUserMessage("errorDeletingRecipe");
      });
    })
    .catch((dontDelete) => {}
    );
  }

  // return if the menu has more than one choice
  public multipleChoices() : boolean {
    return (this.currentRecipe.recipeList && this.currentRecipe.recipeList.length > 1);
  }

  // reverse the sort order of the recipe list array
  public toggleSortOrder = () => {
    this.currentRecipe.recipeList.reverse();
  }

  public setSelectedRecipe = (index : number) => {
    let filter = <RecipeFilterData>{};
    this.currentRecipe.selectedIndex = index;
    this.currentRecipe.recipe = this.menuRecipeList()[index];
    if(this.currentRecipe.recipe.data.numExtras && ! this.currentRecipe.recipe.data.extraImages.length){
      filter.recordId = this.currentRecipe.recipe.data._id;
      filter.projection = {extraImages: 1};
      this.recipeSvc.getRecipes(filter)
      .then((data : RecipeData[]) => {
        this.currentRecipe.recipe.data.extraImages = data[0].extraImages.map(Recipe.imageToAscii);
        this.emit('extraImagesReady');
      })
      .catch((errorReadingExtraImages) => {
        this.utilSvc.displayThisUserMessage('errorReadingExtraImages');
      })
    }
    this.viewSelectedRecipe();
  }

  private viewSelectedRecipe = () => {
    setTimeout( () => {  // wait for currentRecipe.recipe to be valid
      this.emit('newRecipeSelection');
      setTimeout( () => { // wait for first message to take effect
          this.emit('selectViewTab');
      }, 100)
    },100)
  }

  // return the number of currenetly selected recipes
  public selectedRecipeCount = () => {
    var count = 0;
    if(this.recipeSelectFlags){
      this.recipeSelectFlags.forEach( (item) =>{ count += item ? 1 : 0;} );
    }
    return count;
  }

  // return if multiple selections have been made
  multipleSelections() : boolean {
    return this.selectedRecipeCount() > 1;
  }

  // return if recipe is selected or not
  public recipeSelected(index : number) : boolean {
    return this.recipeSelectFlags[index];
  }

  // make the selected recipe shared
  public makeRecipeShared = (recipe : Recipe) => {
    var rd = recipe.getRecipeData();  //this step converts images back to binary 
    var oldHelpContext : string;

    oldHelpContext = this.utilSvc.getCurrentHelpContext();
    this.utilSvc.setCurrentHelpContext("MakeRecipeShared");
    this.utilSvc.openSharedRecipeSettings('Add Shared Recipe', undefined, 
            rd.title, this.currentRecipe.originListName(rd.origin), 
            this.utilSvc.displayOriginDate(rd.originDate), 'Create', 'Share')
    .then((result) => {
      this.utilSvc.setCurrentHelpContext(oldHelpContext);
      if(result.create === true){  //are we creating the shared copy?
        this.addSharedRecipe(rd)
        .then((sharedVersion) => {
          if(result.list !== undefined){
            this.setEmailRestrictions(sharedVersion._id, result.list)
            .then((success) => {})
            .catch((failure) => {})
          }
          recipe.data.sharedItem_id = sharedVersion._id;    // save database record id of shared copy 
          this.recipeSvc.updateRecipe(rd._id, {"sharedItem_id": sharedVersion._id}) // update private version
          .then((privateRecipeUpdated) => {
            this.utilSvc.displayThisUserMessage("recipeShared");   
          })
          .catch((failToUpdatePrivateRecipe) => {
            this.utilSvc.displayThisUserMessage("errorUpdatingSharedRecipe");
            recipe.data.sharedItem_id = undefined;  
          })   
        })
        .catch((failToAddSharedRecipe) => {
          this.utilSvc.displayThisUserMessage("errorSharingRecipe");
        })
      }
    })
    .catch((userHitCancel) => {
      this.utilSvc.setCurrentHelpContext(oldHelpContext);
    })
  }

  // store a copy of the given RecipeData to the database using the SHARED_USER_ID
  private addSharedRecipe = (rdOrig : RecipeData) : Promise<any>  => {
    var rd : RecipeData = Recipe.build(rdOrig).getRecipeData();  // copy recipe

    return new Promise((resolve, reject) => {
      this.recipeSvc.getList(CATEGORY_TABLE_NAME, SHARED_USER_ID)
      .then((cList) => {
        // replace the category ids with ones from the SHARED_USER's category list
        for(let i=0; i<rd.categories.length; i++){
          rd.categories[i] = this.getSharedListItemId(<ListTable>cList, 
                                    this.currentRecipe.categoryListName(rd.categories[i]));
        }
        this.recipeSvc.getList(ORIGIN_TABLE_NAME, SHARED_USER_ID)
        .then((oList) => {
          // replace the origin id with one from the SHARED_USER's origin list
          rd.origin = this.getSharedListItemId(<ListTable>oList,
                            this.currentRecipe.originListName(rd.origin));
          rd.submittedBy = rdOrig.userId;   // note who shared it (the owner)
          rd.userId = SHARED_USER_ID;       // will be accessable under SHARED_USER_ID
          rd._id = undefined;               // kill _id so it will get a new one
          this.recipeSvc.saveRecipe(rd)     // save shared version
          .then((sharedVersion : RecipeData) => {
            this.recipeSvc.saveList(cList, CATEGORY_TABLE_NAME) // save updated SHARED categories list
            .then((categoryListUpdated) => {
              this.recipeSvc.saveList(oList, ORIGIN_TABLE_NAME) // save SHARED origins list
              .then((originListUpdated) => {
                resolve(sharedVersion);            
              })
              .catch((failToSaveOriginList) => {
                reject(failToSaveOriginList);
              })
            })
            .catch((failToSaveCategoryList) => {
              reject(failToSaveCategoryList);
            })
          })
          .catch((failToSaveSharedRecipe) => {
            reject(failToSaveSharedRecipe);
          })
        })
        .catch((failToReadOriginList) => {
          reject(failToReadOriginList);
        })
      })
      .catch((failToReadCategoryList) => {
        reject(failToReadCategoryList);
      })
    })
  }

  // check list for given name, return id if found otherwise add name to list and use nextId value
  private getSharedListItemId = (list : ListTable, iName : string) => {
    var i     : number;
    var newItem = <ListTableItem>{};

    for(i=0; i<list.items.length; i++){   //see if name already in players list
      if(iName === list.items[i].name){
        return list.items[i].id;
      }
    }
    // name not found, add a new entry to SHARED items list
    newItem.id = list.nextId++;   // use nextId number (multi-user <bug>)
    newItem.name = iName;
    list.items.push(newItem);     

    return newItem.id;
  }

  // remove the public copy of the selected recipe or set authorized users
  public sharedRecipeSettings = (r: Recipe) => {
    var srId = r.data.sharedItem_id;
    var oldHelpContext : string;

    this.recipeSvc.getRecipe(srId)
    .then((sharedRecipe : RecipeData) => {
      oldHelpContext = this.utilSvc.getCurrentHelpContext();
      this.utilSvc.setCurrentHelpContext("ManageSharedSettings");
      this.utilSvc.openSharedRecipeSettings('Shared Recipe Settings', sharedRecipe.restrictedTo, 
                      r.data.title, this.currentRecipe.originListName(r.data.origin),
                      this.utilSvc.displayOriginDate(r.data.originDate), 'Edit')
      .then((result) => {
        this.utilSvc.setCurrentHelpContext(oldHelpContext);
        if(result.delete === true){  //are we deleting the public copy?
          this.recipeSvc.deleteRecipe(srId)
          .then((success) => {
            r.data.sharedItem_id = undefined;
            this.recipeSvc.updateRecipe(r.data._id, {"sharedItem_id": null})
            .then((success) => {
              this.utilSvc.displayThisUserMessage("recipeMadePrivate");
            })
            .catch((error) => {
              this.utilSvc.displayThisUserMessage("errorUpdatingPrivateRecipe");
            })
          })
          .catch((failure) => {
            this.utilSvc.displayThisUserMessage("errorDeletingSharedCopy");
          })
        } else { // if not deleting, update the authorized users list
          this.setEmailRestrictions(srId, result.list)
          .then((success) => {})
          .catch((failure) => {})
        }
      })
      .catch((userHitCancel) => {
        this.utilSvc.setCurrentHelpContext(oldHelpContext);
      })
    })
    .catch((failToReadSharedRecipe) => {
      this.utilSvc.displayThisUserMessage("errorReadingSharedCopy");
    })
  }

  // set the email restriction list for the given recipe
  setEmailRestrictions = (srId: string, list: string[]) => {

    return new Promise((resolve, reject) => {
      if(list === undefined){
        resolve(srId)
      }
      this.recipeSvc.updateRecipe(srId,{"restrictedTo": list})
      .then((success : number) => {
        this.utilSvc.displayThisUserMessage("recipeRestrictionsUpdated");
        resolve(success);
      })
      .catch((failToSaveSharedRecipe) => {
        this.utilSvc.displayThisUserMessage("errorUpdatingRecipeRestrictions");
        reject(failToSaveSharedRecipe)
      })
    })
  }

  // test to see if the given recipe is already public
  public recipeIsShared = (index : number) => {
    return this.menuRecipeList()[index].data.sharedItem_id;
  }

  // return whether the recipe at the given index matches the publicFilter
  public applySharedFilter = (index : number) => {
    var isPublic = this.recipeIsShared(index);
    return ((isPublic && "Either Shared".includes( this.sharedFilter)) ||
            (!isPublic && "Either Private".includes( this.sharedFilter)))
  }

  // turn off filtering of menu list based on shared status
  private resetSharedFilter = () => {
    this.sharedFilter = 'Either';
  }

  // update the label on the menu tab
  public updateRecipeCountLabel = () => {
    var i, count = 0;
    for(i=this.menuRecipeList().length-1; i>=0; i--){
      count += this.applySharedFilter(i) ? 1 : 0;
    } 
    this.constructMenuMessage(count);
  }

  // move to the next tab in the tab set
  public nextTab = () => {
    this.utilSvc.emitEvent("nextTab");
  }

  // move to the next tab in the tab set
  public prevTab = () => {
    this.utilSvc.emitEvent("prevTab");
  }

  // close the View Logs display
  public closeView = () => {
    this.utilSvc.emitEvent("closeView");
  }

}