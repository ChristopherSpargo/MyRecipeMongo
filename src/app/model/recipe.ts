// data stored for each picture in a recipe
export interface RecipePic {
  pic: string;             // binary data for the image
  picSize: number;        // size length of pic string (bytes)
  contentType: string;    // MIME type for image(eg. 'image/jpec')
  note: string;           // annotation for picture
  picURL?: string;        // optional filed for base64 DataUrl
}

// this is the record stored for a Recipe in the database
export interface RecipeData {
  _id             ?: string;   // mongoDB item id
  userId          ?: string;   // owner's 40-char login ID
  createdOn       ?: string;   // date document added to database
  title           ?: string;   // (Country Chicken and Potatoes)
  categories      ?: number[]; // (Vacations, Desserts(0,4,18))
  description     ?: string;   // This sauce is rich and delicious
  origin          ?: number;   // (Mom, Internet, TV(1,2,3))
  originDate      ?: string;   // (1978<197800>, 05/1988 <198805>, 7-1999 <199907>)
  originNotes     ?: string;   // Notes about the origin of this document
  ingredients     ?: string;   // (any free-form text )
  instructions    ?: string;   // (any free-form text )
  recipeNotes     ?: string;   // (any free-form text )
  mainImage       ?: RecipePic;// main recipe picture
  extraImages     ?: RecipePic[]; // additional pictures for the recipe
  numExtras       ?: number;   // count of extra images
  dataVersion     ?: number;   // what fields are present in the document
  status          ?: string;   // document status
  sharedItem_id   ?: string;   // mongoDB item id for shared copy 
  submittedBy     ?: string;   // login ID of data owner for (in shared recipe)
  restrictedTo    ?: string[]; // list of authorized user email addresses (in shared recipe)
}

export class Recipe {

  //Recipe properties
  data            : RecipeData;

  //define Recipe constructor
  constructor (rData: RecipeData) {
    this.data = <RecipeData>{};
    this.setRecipeProperties(rData);
  };

  //static method to validate the data and call the constructor
  static build(rData: RecipeData) : Recipe {
    return new Recipe(rData);
  }

  //static method to validate the data and call the constructor
  static imageToAscii(p: RecipePic) : RecipePic {
          let newP          = <RecipePic>{};
          newP.picURL       = "data:" + p.contentType + ";base64," + btoa(p.pic);
          newP.contentType  = p.contentType;              
          newP.picSize      = p.picSize;
          newP.note         = p.note;
          return newP;
  }

  // set the properties object for the Recipe
  setRecipeProperties(rData: RecipeData) : void {
    this.data._id =            rData._id;
    this.data.userId =         rData.userId;
    this.data.createdOn =      rData.createdOn;
    this.data.title =          rData.title || '';
    this.data.description =    rData.description || '';
    this.data.categories =     [];
    this.data.origin =         rData.origin;
    this.data.originDate =     rData.originDate;
    this.data.originNotes =    rData.originNotes || '';
    this.data.ingredients =    rData.ingredients || '';
    this.data.instructions =   rData.instructions || '';
    this.data.recipeNotes =    rData.recipeNotes || '';
    this.data.extraImages =    [];
    this.data.numExtras =      rData.numExtras || 0;
    this.data.dataVersion =    rData.dataVersion || 1;
    this.data.status =         rData.status;
    this.data.sharedItem_id =  rData.sharedItem_id;
    if(rData.submittedBy){ this.data.submittedBy = rData.submittedBy;}
    if(rData.restrictedTo){ 
      this.data.restrictedTo = rData.restrictedTo.map((r) : string =>{return r;}); // copy authorized emails
    }
    if(rData.categories){
      this.data.categories = rData.categories.map((c) : number =>{return c;}) // copy categories
    }
    if(rData.mainImage){
      this.data.mainImage              = Recipe.imageToAscii(rData.mainImage);
      // <RecipePic>{};
      // this.data.mainImage.picURL       = "data:" + rData.mainImage.contentType + 
      //                                     ";base64," + btoa(rData.mainImage.pic);
      // this.data.mainImage.contentType  = rData.mainImage.contentType;              
      // this.data.mainImage.picSize      = rData.mainImage.picSize;
      // this.data.mainImage.note         = rData.mainImage.note;
      if(rData.extraImages){
        this.data.extraImages = rData.extraImages.map(Recipe.imageToAscii);
        // .map((p,i,a) : RecipePic =>{
        //   let newP          = <RecipePic>{};
        //   newP.picURL       = "data:" + p.contentType + ";base64," + btoa(p.pic);
        //   newP.contentType  = p.contentType;              
        //   newP.picSize      = p.picSize;
        //   newP.note         = p.note;
        //   return newP;
        // })
      }
    }
  };

  // return the Match properties
  getRecipeData() : RecipeData {
    
    var rData: RecipeData = {
      _id:            this.data._id,
      userId:         this.data.userId,
      createdOn:      this.data.createdOn,
      title:          this.data.title,
      description:    this.data.description,
      categories:     this.data.categories.map((c) : number => {return c;}), // 'copy' categories array
      origin:         this.data.origin,
      originDate:     this.data.originDate,
      originNotes:    this.data.originNotes,
      ingredients:    this.data.ingredients,
      instructions:   this.data.instructions,
      recipeNotes:    this.data.recipeNotes,
      extraImages:    [],
      numExtras:      this.data.numExtras,
      dataVersion:    this.data.dataVersion,
      status:         this.data.status,
      sharedItem_id:  this.data.sharedItem_id,
      submittedBy:    this.data.submittedBy,
    }
    if(this.data.mainImage){     // copy and convert main image from base64 encoded strings to binary
      rData.mainImage              = <RecipePic>{};
      let n                        = this.data.mainImage.picURL.indexOf(',');  // find start of data
      let dataString               = this.data.mainImage.picURL.substr(n+1);
      rData.mainImage.pic          = atob(dataString);                         // convert back to binary
      rData.mainImage.contentType  = this.data.mainImage.contentType;              
      rData.mainImage.picSize      = this.data.mainImage.picSize;
      rData.mainImage.note         = this.data.mainImage.note;
      
      if(this.data.extraImages){ // copy extra images
        rData.extraImages = this.data.extraImages.map((p, i, a) : RecipePic => { 
          let newP          = <RecipePic>{};
          let n             = p.picURL.indexOf(',');  // find start of data
          let dataString    = p.picURL.substr(n+1);
          newP.pic          = atob(dataString);       // convert back to binary
          newP.contentType  = p.contentType;              
          newP.picSize      = p.picSize;
          newP.note         = p.note;
          return newP;
        })
      }
    }
    if(this.data.restrictedTo){
      rData.restrictedTo = this.data.restrictedTo.map((r) : string =>{return r;}); // copy authorized emails
    }
    return rData;
  };

}
