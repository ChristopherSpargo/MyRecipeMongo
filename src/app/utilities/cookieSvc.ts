import { Injectable } from '@angular/core';

//The cookie for the program contains subitems for the various elements we are tracking.
//the subitems are delimeted with vertical bar (|)
const appCookie = "MatchLogCookie";

@Injectable()
export class CookieSvc { 

  // look for cookie named cname and return its value if found and "" if not
  getCookie(cname: string) : string {
    var name: string = cname + "=";                       //create a search string 'cname='
    var dc:   string = document.cookie;                   //get list of cookies
    var loc:  number = dc.search(name);                   //look for 'cname=' in the list
    if (loc != -1) {                                      //if found
      var cookie: string = dc.substr(loc + name.length);  //get remainder of list after 'cname='
      loc = cookie.search(';');                           //see if this is the last cookie
      return loc == -1 ? cookie : cookie.substr(0, loc);  //value is up to the next ';' if any
    }
    return "";                                            //cookie not found
  }

  //save cookie
  saveCookie(name: string, content: string, days?: number) : void {
    if (days) {  
      var dt = new Date();
      dt.setTime(dt.getTime() + (days * 24 * 60 * 60 * 1000)); //compute expiration time
      var expires: string = "expires=" + dt.toUTCString();
      document.cookie = name + "=" + content + "; " + expires + "; path=/";
    }
    else document.cookie = name + "=" + content + "; path=/";
  }

  //delete the applictions cookie from this browser by setting an expiration date in the past
  deleteCookie() : void {
    document.cookie = appCookie + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }

  //get the main cookie.  Try to set a default if cookie not found.
  getMainCookie() : string[] {
    var mainCookie: string = this.getCookie(appCookie);
    if (mainCookie == "") {
      this.saveCookie(appCookie, "|", 5); //try setting a default string if empty is returned
      mainCookie = this.getCookie(appCookie);
    }
    if (mainCookie == "") { return null; }
    return mainCookie.split("|");
  }

  //fetch a subitem from the application cookie selected by the given itemName
  getCookieItem(itemName: string) : string {
    var cookieItems : string[] = this.getMainCookie();
    var retVal: string = "";
    if (cookieItems != null) { //cookies enabled on browser?
      switch (itemName) {
        case "password":
          retVal = cookieItems[0];
          break;
        case "userEmail":
          retVal = cookieItems[1];
          break;
      }
    }
    return retVal;
  }

  //store a subitem to the application cookie selected by the given itemName and value
  setCookieItem(itemName: string, value: string) : void {
    var cookieItems: string[] = this.getMainCookie();
    if (cookieItems != null) { //cookies enabled on browser?
      switch (itemName) {
        case "password":
          cookieItems[0] = value;
          break;
        case "userEmail":
          cookieItems[1] = value;
          break;
      }
      this.saveCookie(appCookie, cookieItems.join("|"), 50); //save cookie for 50 days
    }
  }

}
