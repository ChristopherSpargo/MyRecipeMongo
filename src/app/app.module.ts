import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UIRouterModule } from "@uirouter/angular";
import { uiRouterConfigFn } from "./router.config";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToasterModule, ToasterService } from 'angular2-toaster';
// import { AppHammerConfig } from './app.hammer.config';

import { AppComponent } from './app.component';
import { SlideoutStatus, UserInfo, AboutStatus, CurrentRecipe } from './app.globals';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AboutHeadingComponent } from './directives/about.heading.component';
import { AboutTextIconComponent } from './directives/about.text.icon.component';
import { AboutMyRecipeMongoComponent } from './about/about.my.recipe.mongo.component';
import { AboutContactUsComponent } from './about/about.contact.us.component';
import { AboutLoginComponent } from './about/about.login.component';
import { AboutEnterRecipesComponent } from './about/about.enter.recipes.component';
import { AboutManageCategoriesComponent } from './about/about.manage.categories.component';
import { AboutAccountProfileComponent } from './about/about.account.profile.component';
import { AboutAccountEmailComponent } from './about/about.account.email.component';
import { AboutAccountPasswordComponent } from './about/about.account.password.component';
import { AboutAccountDeleteComponent } from './about/about.account.delete.component';
import { AboutRecipeSearchComponent } from './about/about.recipe.search.component';
import { AboutRecipeMenuComponent } from './about/about.recipe.menu.component';
import { AboutRecipeViewComponent } from './about/about.recipe.view.component';
import { AboutManagePublicLogsComponent } from './about/about.manage.public.logs.component';
import { AboutManageSharedSettingsComponent } from './about/about.manage.shared.settings.component';
import { AboutMakeRecipeSharedComponent } from './about/about.make.recipe.shared.component';
import { LoginComponent } from './account/login.component';
import { ListManagementComponent } from './lists/list.management.component';
import { AccountProfileComponent } from "./account/account.profile.component";
import { AccountEmailComponent } from "./account/account.email.component";
import { AccountPasswordComponent } from "./account/account.password.component";
import { AccountDeleteComponent } from "./account/account.delete.component";
import { RecipeAccessComponent } from "./recipes/recipe.access.component";
import { RecipeEntryComponent } from './recipes/recipe.entry.component';
import { RecipeMenuComponent } from "./recipes/recipe.menu.component";
import { RecipeSearchComponent } from "./recipes/recipe.search.component";
import { RecipeViewComponent } from "./recipes/recipe.view.component";
import { RecipePrintComponent } from "./recipes/recipe.print.component";
import { AppRecipeSectionComponent } from './directives/app.recipe.section.component';
import { FormFooterButtonComponent } from "./directives/form.footer.button.component";
import { loginState, homeState, manageCategoriesState, enterRecipeState,
         accountProfileState, accountEmailState, accountPasswordState,
         accountDeleteState, myRecipeSearchState, sharedRecipeSearchState } from "./states";
import { ModalComponent } from './modal/modal.component';
import { SimpleModalComponentTemplate } from './modal/simple.modal.component.template';
import { RecipeActionModalComponentTemplate } from './modal/recipe.action.modal.component.template';
import { SharedRecipeSettingsModalComponentTemplate } from './modal/shared.recipe.settings.modal.component.template';
import { UtilSvc } from './utilities/utilSvc';
import { UserSvc } from './model/userSvc';
import { CookieSvc } from './utilities/cookieSvc';
import { FireBaseSvc } from './utilities/fireBaseSvc';
import { RecipeService } from './model/recipeSvc';
import { FormHeaderComponent } from './directives/form.header.component';
import { IconInputComponent } from './directives/icon.input.component';
import { IconTextareaComponent } from './directives/icon.textarea.component';
import { ListItemFieldComponent } from './directives/list.item.field.component';
import { UpdateActionsComponent } from './directives/update.actions.component';
import { ValidationMessageComponent, ValidationMessagesComponent } from './directives/error.messages.component';
import { RegisterFormControlDirective } from './directives/register.control';
import { AppMessageComponent, AppMessagesComponent } from './directives/app.messages.component';
import { DeleteEntryComponent } from './directives/delete.entry.component';
import { FormMessagesComponent } from './directives/form.messages.component';
import { AppFabComponent } from './directives/app.fab.component';
import { RadioGroupComponent } from './directives/radio.group.component';
import { CheckboxMenuComponent } from './directives/checkbox.menu.component';
import { CrossSvc } from './app.bank'
import { HelpButtonComponent } from './directives/help.button.component'

const INITIAL_STATES =  [ homeState, loginState, manageCategoriesState, enterRecipeState,
    accountProfileState, accountEmailState, accountPasswordState, accountDeleteState,
    myRecipeSearchState, sharedRecipeSearchState ];
const INITIAL_COMPONENTS =  [ AppComponent, HomeComponent, LoginComponent, FormHeaderComponent, IconInputComponent,
  ValidationMessageComponent, ValidationMessagesComponent, RegisterFormControlDirective, AppMessagesComponent,
  IconTextareaComponent, AppMessageComponent, ModalComponent, HelpButtonComponent,
  SimpleModalComponentTemplate, RecipeActionModalComponentTemplate, SharedRecipeSettingsModalComponentTemplate,
  ListManagementComponent, ListItemFieldComponent, FormFooterButtonComponent,
  UpdateActionsComponent, DeleteEntryComponent, FormMessagesComponent, AppFabComponent,
  CheckboxMenuComponent, RecipeEntryComponent, RecipeViewComponent, RecipePrintComponent,
  ListManagementComponent, AccountProfileComponent, AccountEmailComponent, AccountPasswordComponent,
  AccountDeleteComponent, AboutComponent, AboutHeadingComponent, AboutTextIconComponent, 
  AboutMyRecipeMongoComponent,
  AboutLoginComponent, AboutEnterRecipesComponent, AboutManageCategoriesComponent,
   AboutContactUsComponent, AboutAccountProfileComponent, AboutAccountEmailComponent,
  AboutAccountPasswordComponent, AboutAccountDeleteComponent, RecipeAccessComponent, RecipeMenuComponent,
  RecipeSearchComponent, AppRecipeSectionComponent, RadioGroupComponent, 
  AboutRecipeSearchComponent, AboutRecipeMenuComponent,
  AboutRecipeViewComponent, AboutManagePublicLogsComponent,
  AboutMakeRecipeSharedComponent, AboutManageSharedSettingsComponent ];

@NgModule({
  declarations: INITIAL_COMPONENTS,
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    UIRouterModule.forRoot({ states: INITIAL_STATES, useHash: true, config: uiRouterConfigFn }),
    ToasterModule,
    HttpModule
  ],
  entryComponents: [SimpleModalComponentTemplate, RecipeActionModalComponentTemplate,
                    SharedRecipeSettingsModalComponentTemplate],
  providers: [SlideoutStatus, UserInfo, ModalComponent, UtilSvc, UserSvc, ToasterService, RecipeService,
              CookieSvc, FireBaseSvc, AboutStatus, CrossSvc, CurrentRecipe],
      //  {provide: HAMMER_GESTURE_CONFIG, useClass: AppHammerConfig}],
  bootstrap: [AppComponent]
})
export class AppModule { }
