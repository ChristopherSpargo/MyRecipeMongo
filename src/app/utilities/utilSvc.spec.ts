import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UtilSvc } from './utilSvc';
import { StateService } from "@uirouter/angular";
import { UIRouterModule } from "@uirouter/angular";
import { uiRouterConfigFn } from "../router.config";
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { AboutStatus, UserInfo } from '../app.globals';
import { ModalComponent } from '../modal/modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../app.component';


describe('Utilites Service', () => {
  let service : UtilSvc;
  let user : UserInfo;
  let modalSvc : ModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent, ModalComponent ],
      schemas:      [ NO_ERRORS_SCHEMA ],
      providers:    [ UtilSvc, UserInfo, AboutStatus, ModalComponent, ToasterService ],
      imports:      [ NgbModule.forRoot(),
                      BrowserAnimationsModule,
                      ToasterModule,
                      UIRouterModule.forRoot({ states:[], useHash: true, config: uiRouterConfigFn }) ]
    }).compileComponents();
    // Services from the root injector
    service = TestBed.get(UtilSvc);
    user = TestBed.get(UserInfo);
    modalSvc = TestBed.get(ModalComponent);
  });

  it('should return a random index from 0-9', () => {
    let index = service.randomIndex(10);
    expect(index).toBeGreaterThanOrEqual(0, 'value below range');
    expect(index).toBeLessThan(10, 'value above range');
  });

  it('should format a time as hh:mm AM|PM', () => {
    let time = service.formatTime();
    expect(time).toMatch(/^[01]\d:[012345]\d AM|PM$/g);
  });

  it('should format a date as MM/dd/yyyy', () => {
    let date = service.formatDate();
    expect(date).toMatch(/^[01]\d\/[0123]\d\/20\d\d$/g);
  });

  it('should format a sort date as yyyyMMddHHmmssttt', () => {
    let sdate = service.formatSortDate();
    expect(sdate).toMatch(/^20\d\d[01]\d[0123]\d([01]\d|2[0123])[012345]\d\d\d\d\d\d$/g);
  });

  it('should display a toast message', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const de = fixture.debugElement.query(By.css('toaster-container'));
    const el = de.nativeElement;
    fixture.detectChanges();
    service.displayThisUserMessage('signInSuccess');
    expect(user.messageOpen).toBeTruthy();
    fixture.detectChanges();
  });

  it('should display a confirmation dialog', () => {
    let mSpy = spyOn(modalSvc,'simpleOpen').and.returnValue(Promise.resolve('CANCEL'));
    service.getConfirmation('Confirmation','Are you sure?','Yes');
    expect(mSpy.calls.count()).toEqual(1);
  });

});
