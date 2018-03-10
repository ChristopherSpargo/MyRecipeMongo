import { Component, OnInit, OnDestroy, EventEmitter, Input } from '@angular/core';
import { NgForm, AbstractControl, FormControl } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { CurrentRecipe } from '../utilities/current.recipe.svc';
import { RecipePic, RecipeData, Recipe } from '../model/recipe'


    // COMPONENT for RECIPE VIEW feature
interface PicItem {
  URL: string;  // URL to use for the picture display
  note: string; // picture annotation
}


@Component({
  selector: '<print-container>',
  templateUrl: 'recipe.print.component.html'
})
export class RecipePrintComponent implements OnInit {
  @Input() viewTabOpen      : boolean;

  constructor(private utilSvc: UtilSvc, private currentRecipe: CurrentRecipe){};

    r_id         : string;
    rTitle       : string = '';
    rDescription : string = '';
    rCategories  : number[] = []; 
    rIngredients : string[];
    rInstructions: string[];
    rNotes       : string[];
    rMainPic     : PicItem;
    rMorePics    : PicItem[] = [];
    rCreatedOn   : string;

  requestStatus  : { [key: string]: any } = {};
  headerTitle    : string  = this.rTitle;
  recipeReady    : boolean = false;
  showPics       : boolean = false; // true if show full-size versions of all images at end of print
  printActive    : boolean = false;
  printerMediaQuery : any;

  ngOnInit() {
    this.setMessageResponders();
  }

  ngOnDestroy() {
    this.deleteMessageResponders();
  }

  setMessageResponders() : void {
    if (window.matchMedia) {
      this.printerMediaQuery = window.matchMedia('print');
      this.printerMediaQuery.addListener(this.mediaPrintListener);
    }
    document.addEventListener("extraImagesReady", this.setExtraImages);
    document.addEventListener("newViewReady", this.newViewReady);
    document.addEventListener("newRecipeSelection", this.newViewReady);
    document.addEventListener("noRecipeSelection", this.noRecipeSelection);
    document.addEventListener("printRecipe", this.printRecipe);
    window.addEventListener("afterprint", this.printDone);
    window.addEventListener("beforeprint", this.showPrintView);
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    if (window.matchMedia) {
      this.printerMediaQuery.removeListener(this.mediaPrintListener);
    }
    document.removeEventListener("extraImagesReady", this.setExtraImages);
    document.removeEventListener("newViewReady", this.newViewReady);
    document.removeEventListener("newRecipeSelection", this.newViewReady);
    document.removeEventListener("noRecipeSelection", this.noRecipeSelection);
    document.removeEventListener("printRecipe", this.printRecipe);
    window.removeEventListener("afterprint", this.printDone);
    window.removeEventListener("beforeprint", this.showPrintView);
  }

  //emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  mediaPrintListener = (val) => {
    if (val.matches) {
        this.showPrintView();
    } else {
        this.printDone();
    }
  }

  // print the current recipe
  printRecipe = () => {
    this.showPrintView();
    setTimeout(()=>{      // wait for display to change to print view
      window.print();
      setTimeout(() => {  // this if for a weird problem in IOS 11
        this.printDone();
      }, 5000);
    },500)
  }

  // turn on display of this module's template and turn off VIEW module's template
  showPrintView = () => {
    this.printActive = true;
    this.emit('printBegin')
  }

  // turn off display of this module's template and turn on VIEW module's template
  printDone = () => {
    this.printActive = false;
    this.emit('printDone')
 }

  // event listener for 'newRecipeSelection' event
  // populate the view with data from the current recipe
  newViewReady = () => {
    this.currentRecipe.viewScrollPosition = 0;
    this.setItemFields(this.currentRecipe.recipe.data);
    this.headerTitle = this.rTitle;
    this.recipeReady = true;
  }

  // eventt listener for 'noRecipeSelection' event
  noRecipeSelection = () => {
    this.recipeReady = false;
    this.currentRecipe.viewScrollPosition = 0;
  }


  // set the form fields to reflect the selected recipe or empty
  setItemFields = (item : RecipeData)  => {
    this.r_id            = item._id;
    this.rTitle          = item.title;
    this.rDescription    = item.description;
    this.rCategories     = [];
    item.categories.forEach((c) => {
      this.rCategories.push(c);});
    this.rIngredients    = item.ingredients ? item.ingredients.split('\n') : undefined;
    this.rInstructions   = item.instructions ? item.instructions.split('\n') : undefined;
    this.rNotes          = item.recipeNotes ? item.recipeNotes.split('\n') : undefined;
    this.rMainPic        = undefined;
    this.rMorePics = [];
    if(item.mainImage){
      this.rMainPic      = {'URL': item.mainImage.picURL, 'note': item.mainImage.note};
      if(item.extraImages.length){
        this.setMorePics(item.extraImages);
      }
    }
    this.rCreatedOn           = item.createdOn;
  }

  // use newly acquired extraImages to set the rMorePics array
  setExtraImages = () => {
    this.setMorePics(this.currentRecipe.recipe.data.extraImages);
  }

  // set the rMorePics array for this view
  setMorePics = (exImages : RecipePic[]) => {
    this.rMorePics = [];
    for(let i=0; i<exImages.length; i++){
      this.rMorePics.push({'URL': exImages[i].picURL, 'note': exImages[i].note});
    }
  }

  // return a boolean to denote the presence of the selected item
  dataPresent = (item: string) : boolean => {
    switch(item){
      case 'Ingredients':
        return (this.rIngredients !== undefined && this.rIngredients.length !== 0);
      case 'Instructions':
        return (this.rInstructions !== undefined && this.rInstructions.length !== 0);
      case 'RecipeNotes':
        return (this.rNotes !== undefined && this.rNotes.length !== 0);
      case 'AnyPics':
        return (this.rMainPic !== undefined);
      case 'MorePics':
        return (this.rMorePics !== undefined && this.rMorePics.length !== 0);
      default:
        return false;
    }
  }

  // get an image to display for the menu item
  getRecipeImage = () : string => {
    if(this.rMainPic){ return this.rMainPic.URL}
    return 'assets/images/cards2.jpg';
  }

  // get a note to display for the main image
  getRecipeNote = () : string => {
    if(this.rMainPic){ return this.rMainPic.note}
    return 'Main Image';
  }

  // return the list of category items from the CurrentRecipe service 
  categoryListItems = () => {
    return this.currentRecipe.categoryListItems();
  }

  // return the Category name for the given id
  getCategoryName = (id : number) : string => {
    return this.currentRecipe.categoryListName(id);
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
    this.viewTabOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
