import { Component, OnInit, OnDestroy, EventEmitter, Input } from '@angular/core';
import { NgForm, AbstractControl, FormControl } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo, CurrentRecipe } from '../app.globals';
import { RecipeService, ListTable, ListTableItem, CATEGORY_TABLE_NAME,
         ORIGIN_TABLE_NAME, RecipeFilterData } from '../model/recipeSvc';
import { Subscription, Observable } from 'rxjs';
import { RecipePic, RecipeData, Recipe } from '../model/recipe'
import { APP_DATA_VERSION, UNSET_ORIGIN_ID_STR } from '../constants';
import ImageCompressor from '@xkeshi/image-compressor/dist/image-compressor.esm.js'


export interface PicObj {
  file: File;           // File object for new pictures
  picURL: string;       // URL to use for the picture display
  picSize: number;
  noteText: string;     // picture annotation
  contentType: string;  // MIME type for image
}

// COMPONENT for RECIPE ENTRY function
// The template for this component is the Recipe Data Entry form and is presented on the EDIT tab
// of the Recipe Access Tabset.
// This component shares data with other Recipe Access Tabset components via the CurrentRecipe service.
// This component listens for the following messages:
//  noRecipeSelection:      This indicates that no existing recipe is selected and the form should
//                          be initialized for NEW recipe input.
//  newRecipeSelection:     This indicates that there is data for an existing recipe in the CurrentRecipe
//                          service and the form should be populated with it's data in preparation for EDIT.
//  extraImagesReady:       This indicates that any extra images associated with the current recipe selection
//                          have been read and can be populated into the form. To save time and data transfer,
//                          a recipe's extra images are only read when the user first selects the recipe
//                          from the RECIPES menu.
// This component emits the following messages:
//  updateMenuTabLabel:     This requests that the MENU tab label which displays the number of items on the
//                          RECIPES menu be updated based on information in the CurrentRecipe service.
//  newViewReady:           This requests that the information displayed on the VIEW tab be refreshed using
//                          the data in the CurrentRecipe service.
// The 3rd party module 'ImageCompressor' is used to compress recipe images

@Component({
  selector: '<app-recipe-edit>',
  templateUrl: 'recipe.entry.component.html'
})
export class RecipeEntryComponent implements OnInit {
  @Input() editTabOpen      : boolean;

  constructor(private userInfo: UserInfo, private utilSvc: UtilSvc, private recipeSvc: RecipeService,
      private currentRecipe: CurrentRecipe){};

  checkAll            : boolean   = false; //true if form fields to be checked for errors (touched or not)
  newItemName         : string    = '';
  deleteItem          : boolean   = false;
  todaysDate          : string    = this.utilSvc.formatDate();
  thisYear            : string    = this.utilSvc.formatDateJustYear();
    r_id        : string;
    rTitle      : string = '';
    rDescription: string = '';
    rCategories : {cats: number[], 
                   errors: { [key: string]: any },
                   statusChanges: EventEmitter<any> | null,
                   touched: boolean,
                   invalid: boolean} = {cats: [], errors: {}, 
                                        statusChanges: new EventEmitter(), touched: false, invalid: false};
    rOrigin      : string = UNSET_ORIGIN_ID_STR;
    rOriginDate  : string = this.thisYear;
    rOriginNotes : string = '';
    rIngredients : string = '';
    rInstructions: string = '';
    rNotes       : string = '';
    rPictures    : PicObj[] = [];
    rRestrictedTo: string[] = [];
    rSharedItemId: string = '';
    rLastShareUpdate: number = undefined;
    rSubmittedBy : string = '';
    rCreatedOn   : string = this.todaysDate;

  selectedPics        : File[] = <File[]>[]; // list of files obtained from the file input element
  requestStatus       : { [key: string]: any } = {}; // object for messages displayed at bottom of the form
  formOpen            : boolean   = false;
  titleAndTagsOpen    : boolean   = false;  // show-hide toggle for Title and Categories form section
  originOpen          : boolean   = false;  // show-hide toggle for Origins form section
  specificsOpen       : boolean   = false;  // show-hide toggle for Ingredients and Instructions form section
  picturesOpen        : boolean   = false;  // show-hide toggle for Pictures form section
  createNew           : boolean   = true;   // true if adding a recipe, false if editing an exitsing one
  formTitle           : string    = "Add a Recipe";  // title to display at top of template

  ngOnInit() {
    this.setMessageResponders();
    // make sure the user is logged in to enter recipes
    if(!this.userInfo.authData) { return; }
    this.setItemFields();
    setTimeout( () => {
      this.formOpen = true;
    }, 300);
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  // set listeners for interesting messages
  setMessageResponders() : void {
    document.addEventListener("extraImagesReady", this.setExtraImages);
    document.addEventListener("newRecipeSelection", this.newRecipeSelection);
    document.addEventListener("noRecipeSelection", this.noRecipeSelection);
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    document.removeEventListener("extraImagesReady", this.setExtraImages);
    document.removeEventListener("newRecipeSelection", this.newRecipeSelection);
    document.removeEventListener("noRecipeSelection", this.noRecipeSelection);
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  // handle the 'newRecipeSelection' message
  newRecipeSelection = () => {
    this.createNew = false;
    this.setItemFields(this.currentRecipe.recipe.data);
  }

  // handle the 'noRecipeSelection' message
  noRecipeSelection = () => {
    this.createNew = true;      // we'll be creating a new recipe if we come to this tab
    this.resetForm();       // initialize entry form for new
    this.currentRecipe.editScrollPosition = 0;  // set display to top
  }

  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var rData : RecipeData = <RecipeData>{}; // RecipeData object to send to recipeSvc
    this.checkAll = true;                 // indicate form has been 'submitted'
    this.clearRequestStatus();
    if(this.checkForProblems(form)){   // can't do anything yet, form still has errors
      this.requestStatus.formHasErrors = true;
      return;
    }
    this.utilSvc.displayWorkingMessage(true, 'Saving Recipe'); // show 'working' indicator on screen
    // now fill in the object for the database
    if(this.r_id) {rData._id = this.r_id;}
    rData.userId = this.userInfo.profile.id;
    rData.createdOn = this.rCreatedOn;
    rData.lastUpdate = new Date().getTime();
    rData.title = this.rTitle;
    if(this.rDescription !== ""){rData.description = this.rDescription;} // don't store empty strings
    rData.categories = this.rCategories.cats;
    rData.origin = parseInt(this.rOrigin,10);
    rData.originDate = this.utilSvc.formatOriginDate(this.rOriginDate);
    if(this.rOriginNotes !== ""){rData.originNotes = this.rOriginNotes;}
    if(this.rIngredients !== ""){rData.ingredients = this.rIngredients;}
    if(this.rInstructions !== ""){rData.instructions = this.rInstructions;}
    if(this.rNotes !== ""){rData.recipeNotes = this.rNotes;}
    rData.dataVersion = APP_DATA_VERSION;
    if(this.rSharedItemId !== ""){rData.sharedItem_id = this.rSharedItemId;}
    if(this.rSubmittedBy !== ""){rData.submittedBy = this.rSubmittedBy;}
    if(this.rRestrictedTo.length){
      rData.restrictedTo = this.rRestrictedTo.map((e) : string => {return e;});
    }
    if(this.rPictures.length){    // convert images for storage
      rData.mainImage = this.convertPic(this.rPictures[0]);
      rData.numExtras = this.rPictures.length-1;
      if(rData.numExtras){
        rData.extraImages = [];
        for(let i=0; i<rData.numExtras; i++){
          rData.extraImages.push(this.convertPic(this.rPictures[i+1]));
        }
      }
    }

    // send recipe to database
    this.recipeSvc.saveRecipe(rData)
    .then((storedData : RecipeData) => {
      // replace in-memory copy of this recipe
      this.currentRecipe.recipe = Recipe.build(storedData); 
      if(!this.createNew){
        this.currentRecipe.recipeList[this.currentRecipe.selectedIndex] = this.currentRecipe.recipe;
      } else {
        this.currentRecipe.recipeList = [this.currentRecipe.recipe];
        this.currentRecipe.selectedIndex = 0;
      }
      this.utilSvc.setUserMessage("recipeSaved");
      this.utilSvc.displayWorkingMessage(false);
      this.resetForm(form);
      this.emit('updateMenuTabLabel');
      this.emit('newViewReady')     // let the view tab know
      this.utilSvc.scrollToTop();
      // check for need to update shared copy
      this.updateSharedCopy(storedData)
      .then(()=>{})
      .catch(()=>{})
    })
    .catch((error) => {
      this.resetForm(form);
      this.utilSvc.setUserMessage("errorSavingRecipe");
      this.utilSvc.displayWorkingMessage(false);
      this.utilSvc.scrollToTop();
    });            
  }

  // see if there is a shared copy of the recipe to update
  updateSharedCopy = (rData: RecipeData) : Promise<any> => {
    return new Promise((resolve, reject) => {
      if(rData.sharedItem_id){
        this.utilSvc.getConfirmation('Update Shared Copy', 
        'A shared copy of this recipe exists. Would you like it updated now?', 'Update It', 'Not Now')
        .then((updateIt) => {
          this.utilSvc.displayWorkingMessage(true, 'Updating Shared Copy')
          // first, read 'restrictedTo' list from shared copy
          let query = <RecipeFilterData>{};
          query.recordId = rData.sharedItem_id;
          query.projection = {'restrictedTo': 1};
          this.recipeSvc.getRecipes(query)
          .then((results : RecipeData[]) =>{
            // then transfer the 'restrictedTo' list to the updated version
            this.recipeSvc.addSharedRecipe(rData, results[0].restrictedTo)
            .then((success) => {
              this.utilSvc.setUserMessage('sharedCopyUpdated');
              this.utilSvc.displayWorkingMessage(false);
              resolve('updated');              
            })
            .catch((problem) =>{
              this.utilSvc.setUserMessage(problem);
              this.utilSvc.setUserMessage('errorUpdatingSharedCopy');
              this.utilSvc.displayWorkingMessage(false);
              resolve(problem);
            })            
          })
        })
        .catch((notNow) => {
          resolve('notNow')
        })
      } else{
        resolve("notShared");
      }
    })
  }

  // convert picture to format that is stored in database
  convertPic = (p : PicObj) : RecipePic => {
        let newP = <RecipePic>{};
        newP.note = p.noteText;
        newP.contentType = p.contentType;
        let n = p.picURL.indexOf(',');    // find start of base64 encoded data string
        let dataString = p.picURL.substr(n+1);
        newP.pic = atob(dataString);    // convert image back to binary
        newP.picSize = newP.pic.length;
        return newP;
  }

  // check for data input problems before submitting
  checkForProblems = (form: NgForm) : boolean => {
    this.checkCategoryList();
    return form.invalid || this.rCategories.invalid;
  }

  // return the list of origin items from the CurrentRecipe service 
  originListItems = () => {
    return this.currentRecipe.originListItems();
  }

  // open the category selection list
  openCatList = () => {
    this.clearRequestStatus();
    // now scroll the screen to the top so the position of the category menu will be on screen, then
    // emit the message to cause the checkbox.menu.component to open the menu
    this.utilSvc.scrollToTop();
    this.emit('openEntryCategoriesMenu');
  }

  // categories have been added to the recipe
  categoriesAdded = (touched: boolean) => {
    this.rCategories.touched = true;
    this.checkCategoryList();
  }

  // remove the given category from the categories for this recipe
  removeCategory = (id: number) => {
    var i;

    if(id !== undefined){
      i = this.rCategories.cats.indexOf(id);
      if(i !== -1){
        this.rCategories.cats.splice(i,1);      // id found
        this.rCategories.touched = true;
        this.checkCategoryList();
      }
    }
  }
  
  // return the list of category items from the CurrentRecipe service 
  categoryListItems = () => {
    return this.currentRecipe.categoryListItems();
  }

  // return the Category name for the given id
  getCategoryName = (id : number) : string => {
    return this.currentRecipe.categoryListName(id);
  }

  // return whether any categories have been assigned to this recipe
  haveCategories = () : boolean => {
    return this.rCategories.cats.length !== 0;
  }

  // validation check for categories object
  checkCategoryList = () => {
    if(!this.haveCategories()){
      this.rCategories.errors.required = true;
      this.rCategories.invalid = true;
    } else {
      if(this.rCategories.cats.length > 10){
        this.rCategories.errors.maxnumber = true;
        this.rCategories.invalid = true;
      } else {
        this.rCategories.errors = {};
        this.rCategories.invalid = false;
      }
    }
    this.rCategories.statusChanges.emit(); // update observable
  }

  // process file selection event and create a URL for the preview image
  fileSelected = (fId : string) => {
    let fRef : any = document.getElementById(fId);
    this.selectedPics = fRef.files;  //get the list of files from the form input element
    if(this.selectedPics.length){
      for(let i=0; i<this.selectedPics.length; i++){
        let reader = new FileReader();
        let pic : PicObj = <PicObj>{};
        pic.file = this.selectedPics[i];
        pic.contentType = pic.file.type;
        pic.picSize = pic.file.size;
        pic.noteText = "";
        reader.onload = (event : any) => {
          pic.picURL = event.target.result;
          this.compressPic(pic)              // attempt compression and update URL if successful
          .then((pic)=>{
            this.rPictures.push(pic);
          })
          .catch((error) => {               // error compressing picture?
            this.utilSvc.displayThisUserMessage("errorCompressingPicture", pic.file.name);          
          })
        }
        reader.readAsDataURL(pic.file);
      }
    }
  }

  // compress the given image (DataURL)
  compressPic = (pic : PicObj) : Promise<PicObj> => {
    let ic = new ImageCompressor();
    let reader = new FileReader();
    let opts = {                              // options for file compression
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.3                            // 0.3 will compress quite a bit
    }
    return new Promise<PicObj>((resolve, reject) => {
      //only compress larger images
      if(pic.picSize > (100 * 1024)){
        ic.compress(pic.file, opts)             // compress file
        .then((compressed) => {
          if(compressed.size < pic.picSize){     // was compression effective?
            pic.picSize = compressed.size;
            reader.onloadend = (evt : any) => {
              pic.picURL = evt.target.result;   // replace DataURL with compressed one
              resolve(pic);
            }
            reader.readAsDataURL(compressed);   // convert compressed image to DataUrl           
          } else {
            resolve(pic);                       // compression was not effective
          }
        })
        .catch((error)=>{                         // some error compressing?
          reject(error);
        })
      } else {
        resolve(pic);                           // image was too small to compress
      }
    })
  }

  // free up the ObjectURL created for the preview image
  revokeURL = (url: string) => {
    window.URL.revokeObjectURL(url);
  }

  // remove the given picture from the pictures for this recipe
  removePicture = (i: number) => {

    if(i !== undefined && i < this.rPictures.length){
        this.rPictures.splice(i,1);      //remove picture
    }
  }

  clickField = (fId : string) => {
    document.getElementById(fId).click();
  }

  // get the form ready for another operation
  resetForm = (form ?: NgForm) => {
    this.clearRequestStatus();
    if(form){
      form.controls.rTitle.markAsUntouched();
      form.controls.rDesc.markAsUntouched();
      form.controls.rOrig.markAsUntouched();
      form.controls.oDate.markAsUntouched();
      form.controls.oNotes.markAsUntouched();
      form.controls.rIngr.markAsUntouched();
      form.controls.rInst.markAsUntouched();
      form.controls.rNotes.markAsUntouched();
      form.controls.rPics.markAsUntouched();
    }
    this.checkAll = false;
    this.setItemFields(this.currentRecipe.recipe ? this.currentRecipe.recipe.data : undefined);
    this.titleAndTagsOpen  = this.originOpen = this.specificsOpen = this.picturesOpen = false;
    this.utilSvc.scrollToTop();
  }

  // set the form fields to reflect the selected recipe or empty
  setItemFields = (item? : RecipeData)  => {
    if(item){
      this.r_id                 = item._id;   // this is the database's ObjectID
      this.rTitle               = item.title;
      this.rDescription         = item.description;
      this.rCategories.cats     = [];
      item.categories.forEach((c) => {
        this.rCategories.cats.push(c);});
      this.rCategories.touched  = false;
      this.rCategories.errors   = {};
      this.rCategories.invalid  = false;
      this.rCategories.statusChanges.emit();
      this.rOrigin              = item.origin ? item.origin.toString() : UNSET_ORIGIN_ID_STR;
      this.rOriginDate          = this.utilSvc.displayOriginDate(item.originDate);
      this.rOriginNotes         = item.originNotes;
      this.rIngredients         = item.ingredients;
      this.rInstructions        = item.instructions;
      this.rNotes               = item.recipeNotes;
      this.rPictures            = [];
      if(item.mainImage){
        this.rPictures.push(this.convertToPicObj(item.mainImage));
        this.addExtraPictures(item.extraImages);
      }
      this.rRestrictedTo        = [];
      if(item.restrictedTo){ 
        this.rRestrictedTo = item.restrictedTo.map((e) : string => {return e;}); // copy restrictions
      }
      this.rSharedItemId        = item.sharedItem_id || '';
      this.rSubmittedBy         = item.submittedBy || '';
      this.rCreatedOn           = item.createdOn;
    } else{
      this.r_id                 = undefined;
      this.rTitle               = '';
      this.rDescription         = '';
      this.rCategories.cats     = [];
      this.rCategories.touched  = false;
      this.rCategories.errors   = {};
      this.rCategories.invalid  = false;
      this.rCategories.statusChanges.emit();
      this.rOrigin              = this.userInfo.profile.defaultRecipeOrigin ?
                                  this.userInfo.profile.defaultRecipeOrigin.toString() : UNSET_ORIGIN_ID_STR;
      this.rOriginDate          = this.thisYear;
      this.rOriginNotes         = '';
      this.rIngredients         = '';
      this.rInstructions        = '';
      this.rNotes               = '';
      this.rPictures            = [];
      this.rRestrictedTo        = [];
      this.rSharedItemId        = '';
      this.rSubmittedBy         = '';
      this.rCreatedOn           = this.todaysDate;
      
    }
  }

    // create a PicObj from a RecipePic
  convertToPicObj = (p : RecipePic) : PicObj => {
        let newP = <PicObj>{};
        newP.noteText = p.note;
        newP.contentType = p.contentType;
        newP.picSize = p.picSize;
          //images are stored as binary strings, a base64 DataURL (picURL) is created when Recipe is built
        newP.picURL = p.picURL; 
        return newP;
  }
  
  // add the images in the given array to the rPictures array
  addExtraPictures = (images : RecipePic[]) => {
    if(images.length){
      for(let i=0; i<images.length; i++){
        this.rPictures.push(this.convertToPicObj(images[i]));
      }
    }
  }

  // add the newly acquired extraImages for this recipe to the rPictures array
  setExtraImages = () => {
    this.addExtraPictures(this.currentRecipe.recipe.data.extraImages);
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
