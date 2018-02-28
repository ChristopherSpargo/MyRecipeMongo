import { TestBed } from '@angular/core/testing';

import { CookieSvc } from './cookieSvc';

describe('Cookie Service', () => {
  let service : CookieSvc;
  let cName = 'MatchLogCookie';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CookieSvc
      ]
    });
    // Cookie Service from the root injector
    service = TestBed.get(CookieSvc);
  });


  it('should reset the cookie', () => {
    service.deleteCookie();
    service.getMainCookie()
    let cookie = service.getCookie(cName);
    expect(cookie).toEqual('|');
  });

  it('should set the password of the cookie', () => {
    service.setCookieItem('password', 'test123')
    let cookie = service.getCookie(cName);
    expect(cookie).toEqual('test123|');
  });

  it('should set the email address of the cookie', () => {
    service.setCookieItem('userEmail', 'testUser@gmail.com')
    let cookie = service.getCookie(cName);
    expect(cookie).toEqual('test123|testUser@gmail.com');
  });

  it('should change the password of the cookie', () => {
    service.setCookieItem('password', 'test321')
    let cookie = service.getCookie(cName);
    expect(cookie).toEqual('test321|testUser@gmail.com');
  });

  it('should delete the cookie', () => {
    service.deleteCookie();
    let cookie = service.getCookie(cName);
    expect(cookie).toEqual('');
  });

});
