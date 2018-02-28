import { Component } from '@angular/core';
import { UIROUTER_DIRECTIVES } from '@uirouter/angular';
import { ToasterConfig } from 'angular2-toaster';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  public toastConfig : ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-left'
  });

  constructor(){};

}
