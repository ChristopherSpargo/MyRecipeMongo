// data stored for each picture in a recipe
// images are compressed and stored inside the recipe document in the database
// typical image is < 200KB when compressed, maximum mongoDB document size is 16MB
export interface RecipePic {
  pic: string;            // binary data for the image
  picSize: number;        // size length of pic string (bytes)
  contentType: string;    // MIME type for image(eg. 'image/jpec')
  note: string;           // annotation for picture
  picURL?: string;        // optional field for base64 DataUrl used to display image on client
}

// this is the record stored for a Recipe in the database
export interface RecipeData {
  _id             ?: string;   // mongoDB item id
  userId          ?: string;   // owner's 40-char login ID
  createdOn       ?: string;   // date document added to database
  lastUpdate      ?: number;   // getTime() value when last written to DB
  title           ?: string;   // (Country Chicken And Potatoes)
  categories      ?: number[]; // (Dinner, Dessert)
  description     ?: string;   // This sauce is rich and delicious
  ingredients     ?: string;   // (any free-form text )
  instructions    ?: string;   // (any free-form text )
  recipeNotes     ?: string;   // (any free-form text )
  mainImage       ?: RecipePic;// main recipe picture
  extraImages     ?: RecipePic[]; // additional pictures for the recipe
  numExtras       ?: number;   // count of extra images
  dataVersion     ?: number;   // what fields are present in the document
  status          ?: string;   // document status, currently unused
  sharedItem_id   ?: string;   // mongoDB item id for shared copy (if shared)
  submittedBy     ?: string;   // login ID of data owner for (in a shared recipe)
  restrictedTo    ?: string[]; // list of authorized user email addresses (in a shared recipe)
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

  // static method to convert a RecipePic object from one with a binary pic property to one with
  // a base64 picURL property
  static imageToAscii(p: RecipePic) : RecipePic {
          let newP          = <RecipePic>{};
          newP.picURL       = "data:" + p.contentType + ";base64," + btoa(p.pic);
          newP.contentType  = p.contentType;              
          newP.picSize      = p.picSize;
          newP.note         = p.note;
          return newP;
  }

  // static method to convert a RecipePic object from one with a base64 picURL property to one with
  // a binary pic property
  static imageToBinary(p: RecipePic) : RecipePic {
    let newP          = <RecipePic>{};
    let n             = p.picURL.indexOf(',');  // find start of data
    let dataString    = p.picURL.substr(n+1);
    newP.pic          = atob(dataString);       // convert back to binary
    newP.contentType  = p.contentType;              
    newP.picSize      = p.picSize;
    newP.note         = p.note;
    return newP;
}

// set the properties of the Recipe's RecipeData object from the given RecipeData object
  setRecipeProperties(rData: RecipeData) : void {
    this.data._id =            rData._id;
    this.data.userId =         rData.userId;
    this.data.createdOn =      rData.createdOn;
    this.data.lastUpdate =     rData.lastUpdate;
    this.data.title =          rData.title || '';
    this.data.description =    rData.description || '';
    this.data.categories =     [];
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
      this.data.restrictedTo = rData.restrictedTo.slice(); // copy authorized emails
    }
    if(rData.categories){
      this.data.categories = rData.categories.slice() // copy categories
    }
    if(rData.mainImage){
      this.data.mainImage     = Recipe.imageToAscii(rData.mainImage);
      if(rData.extraImages){
        this.data.extraImages = rData.extraImages.map(Recipe.imageToAscii);
      }
    }
  };

  // return the Recipe properties in a new RecipeData object
  getRecipeData() : RecipeData {
    
    var rData: RecipeData = {
      _id:            this.data._id,
      userId:         this.data.userId,
      createdOn:      this.data.createdOn,
      lastUpdate:     this.data.lastUpdate,
      title:          this.data.title,
      description:    this.data.description,
      categories:     this.data.categories.slice(), // 'copy' categories array
      ingredients:    this.data.ingredients,
      instructions:   this.data.instructions,
      recipeNotes:    this.data.recipeNotes,
      extraImages:    [],
      numExtras:      this.data.numExtras,
      dataVersion:    this.data.dataVersion,
      status:         this.data.status,
      sharedItem_id:  this.data.sharedItem_id,
      submittedBy:    this.data.submittedBy
    }
    if(this.data.mainImage){     // copy and convert main image from base64 encoded strings to binary
      rData.mainImage              = Recipe.imageToBinary(this.data.mainImage);      
      if(this.data.extraImages){ // copy and convert extra images
        rData.extraImages = this.data.extraImages.map(Recipe.imageToBinary);
      }
    }
    if(this.data.restrictedTo){  // Authorized Users List?
      rData.restrictedTo = this.data.restrictedTo.slice();
    }
    return rData;
  };

}
