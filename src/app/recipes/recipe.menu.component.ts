import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentRecipe } from '../app.globals';
import { SHARED_USER_ID } from '../constants';
import { RecipeService, CATEGORY_TABLE_NAME, 
         ListTable, ListTableItem, RecipeFilterData } from '../model/recipeSvc';
import { Recipe, RecipeData, RecipePic } from '../model/recipe';

@Component({
  selector: '<app-recipe-menu>',
  templateUrl: 'recipe.menu.component.html'
})
export class RecipeMenuComponent implements OnInit, OnDestroy {

  @Input() menuOpen    : boolean;    // indicates this panel should open
  @Input() viewShared      : boolean = false;  // indicates user is viewing shared recipes
  @Input() constructMenuMessage  : Function;  // function to format menuMessage
  @Input() columns     : number;    // indicates number of columns in the menu display

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

    this.utilSvc.confirmRecipeAction('Delete Recipe', r.title, 'Delete')
    .then((deleteIt) => {
      this.utilSvc.displayWorkingMessage(true,'Deleting Recipe');
      this.recipeSvc.deleteRecipe(r._id)
      .then((success) => {
        this.menuRecipeList().splice(index, 1);    //remove item from Recipe array
        this.emit('updateMenuTabLabel');
        if(this.menuRecipeList().length === 0){this.emit('selectSearchTab');} // menu now empty
        this.utilSvc.setUserMessage("recipeDeleted");
        this.utilSvc.displayWorkingMessage(false);
      })
      .catch((failure) => {
        this.utilSvc.setUserMessage("errorDeletingRecipe");
        this.utilSvc.displayWorkingMessage(false);
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
    this.currentRecipe.selectedIndex = index;
    this.currentRecipe.recipe = this.menuRecipeList()[index];
    this.recipeSvc.readExtraImages(this.currentRecipe.recipe.data)
    .then((data) => {
      if(data){     // images actually read?
        this.currentRecipe.recipe.data = data;
        this.emit('extraImagesReady');
      }
    })
    .catch((errorReadingExtraImages) => {
      this.utilSvc.displayThisUserMessage('errorReadingExtraImages');
    })
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
    var restrictedTo : string[] = this.userInfo.profile.defaultSharedUsers;

    oldHelpContext = this.utilSvc.getCurrentHelpContext();
    this.utilSvc.setCurrentHelpContext("MakeRecipeShared");
    this.utilSvc.openSharedRecipeSettings('Add Shared Recipe', restrictedTo, 
            rd.title, 'Create', 'Share')
    .then((shareThisRecipe) => {
      this.utilSvc.displayWorkingMessage(true,'Creating Shared Recipe');
      this.utilSvc.setCurrentHelpContext(oldHelpContext);
      if(shareThisRecipe.create === true){  //are we creating the shared copy?
        this.recipeSvc.addSharedRecipe(rd)
        .then((sharedVersion) => {
          if(shareThisRecipe.list !== undefined){
            this.utilSvc.displayWorkingMessage(true,'Setting User Restrictions');
            this.setEmailRestrictions(sharedVersion._id, shareThisRecipe.list)
            .then((success) => {})
            .catch((failure) => {})
          }
          recipe.data.sharedItem_id = sharedVersion._id;    // save database record id of shared copy 
          // update private version
          this.recipeSvc.updateRecipe(rd._id, {"sharedItem_id": sharedVersion._id})
          .then((privateRecipeUpdated) => {
            this.utilSvc.setUserMessage("recipeShared");   
            this.utilSvc.displayWorkingMessage(false);
          })
          .catch((failToUpdatePrivateRecipe) => {
            recipe.data.sharedItem_id = undefined;  
            this.utilSvc.setUserMessage("errorUpdatingPersonalRecipe");
            this.utilSvc.displayWorkingMessage(false);
          })   
        })
        .catch((failToAddSharedRecipe) => {
          this.utilSvc.setUserMessage(failToAddSharedRecipe);
          this.utilSvc.setUserMessage("errorSharingRecipe");
          this.utilSvc.displayWorkingMessage(false);
        })
      }
    })
    .catch((userHitCancel) => {
      this.utilSvc.setCurrentHelpContext(oldHelpContext);
    })
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
                      r.data.title, 'Edit')
      .then((result) => {
        this.utilSvc.setCurrentHelpContext(oldHelpContext);
        if(result.delete === true){  //are we deleting the public copy?
          this.utilSvc.displayWorkingMessage(true, 'Removing Shared Recipe');
          this.recipeSvc.deleteRecipe(srId)
          .then((success) => {
            r.data.sharedItem_id = undefined;
            this.recipeSvc.updateRecipe(r.data._id, {"sharedItem_id": null})
            .then((success) => {
              this.utilSvc.setUserMessage("recipeMadePrivate");
              this.utilSvc.displayWorkingMessage(false);
            })
            .catch((error) => {
              this.utilSvc.setUserMessage("errorUpdatingPrivateRecipe");
              this.utilSvc.displayWorkingMessage(false);
            })
          })
          .catch((failure) => {
            this.utilSvc.setUserMessage("errorDeletingSharedCopy");
            this.utilSvc.displayWorkingMessage(false);
          })
        } else { // if not deleting, update the authorized users list
          this.utilSvc.displayWorkingMessage(true, 'Updating User Restrictions');
          this.setEmailRestrictions(srId, result.list)
          .then((success) => {
            this.utilSvc.displayWorkingMessage(false);            
          })
          .catch((failure) => {
            this.utilSvc.displayWorkingMessage(false);            
          })
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
      this.recipeSvc.updateRecipe(srId,{"restrictedTo": list ? list : null})
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