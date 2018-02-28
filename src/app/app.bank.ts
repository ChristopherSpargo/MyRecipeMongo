import { Injectable } from '@angular/core';


export const RECIPE_SERIAL_NUMBER      : string = "SN";
export const RECIPE_MODEL_NUMBER      : string = "MN";
export const LOGIN_CHAR_SET      : string = 
      "Skz0OEjty1FeYq2AcP3Wi4fuV5Glod6HUNbhI7g8m9xZnJaD!oK#r$L%^TwC&M*R_v+BQs-X";

@Injectable()
export class CrossSvc {
  
  constructor(){};

  CROSS_FACTOR : number = 10;

  cross(inChar: string, inStr: string) : string {
    var outStr = '';
    var factor = this.CROSS_FACTOR;
    var csLen = LOGIN_CHAR_SET.length;
    var firstChar = inChar.substr(0,1);
    var offset = LOGIN_CHAR_SET.indexOf(firstChar);

    if(offset !== -1){
      for(let i=0; i<inStr.length; i++){
        let cPos = (LOGIN_CHAR_SET.indexOf(inStr.substr(i,1)) + offset + factor) % csLen;
        outStr += LOGIN_CHAR_SET.substr(cPos,1);
      }
    }
    return outStr;
  }

  uncross(inChar: string, inStr: string) : string {
    var outStr = '';
    var factor = this.CROSS_FACTOR;
    var csLen = LOGIN_CHAR_SET.length;
    var firstChar = inChar.substr(0,1);
    var offset = LOGIN_CHAR_SET.indexOf(firstChar);

    if(offset !== -1){
      for(let i=0; i<inStr.length; i++){
        let cPos = LOGIN_CHAR_SET.indexOf(inStr.substr(i,1)) - offset - factor;
        cPos = cPos < 0 ? cPos + csLen : cPos;
        outStr += LOGIN_CHAR_SET.substr(cPos,1);
      }
    }
    return outStr;
  }
}