export const RESTRICTION_WRITE = 'WRITE';

export class ProfileData {
  id                      : string;
  email                   : string;
  createdOn               : string;
  defaultRecipeOrigin     : number;
  restrictions            ?: string;
  restrictionsArray       ?: string[];
}

export class Profile extends ProfileData {

  //static method to validate the data and call the constructor
  static build(data?: ProfileData) : Profile {
    return new Profile(data);
  }

  //define Profile constructor
  constructor(data?: ProfileData) {
    super();
    this.setProfileProperties(data);
  };

  setProfileProperties(data?: ProfileData) : void {
    data                        = data || new ProfileData();
    this.id                     = data.id || "";
    this.email                  = data.email || "";
    this.createdOn              = data.createdOn || (new Date()).toLocaleDateString();
    this.defaultRecipeOrigin    = data.defaultRecipeOrigin || 0;
    if(data.restrictions){
      this.restrictionsArray    = data.restrictions.split(',');
    } else {
      this.restrictionsArray    = [];
    }
  };

  //return the properties of the Profile
  getProfileProperties(): ProfileData {
    var result = {
      id:                     this.id,
      email:                  this.email,
      createdOn:              this.createdOn,
      defaultRecipeOrigin:    this.defaultRecipeOrigin,
      restrictions:           this.restrictionsArray.join()
    };
    return result;
  };

  //return true if the profile has the specified access restriction
  hasRestriction(access: string) : boolean {
    return this.restrictionsArray.indexOf(access) != -1;
  }

  //set an access restriction
  setRestriction(access: string) : void {
    if(!this.hasRestriction(access)){
      this.restrictionsArray.push(access);
    }
  }

  //remove an access restriction
  removeRestriction(access: string) : void {
    var i = this.restrictions.indexOf(access);
    
    if(i != -1){
      this.restrictionsArray.splice(i,1);
    }
  }

}
