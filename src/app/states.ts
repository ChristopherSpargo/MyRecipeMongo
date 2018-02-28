import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./account/login.component";
import { ListManagementComponent } from "./lists/list.management.component";
import { AccountProfileComponent } from "./account/account.profile.component";
import { AccountEmailComponent } from "./account/account.email.component";
import { AccountPasswordComponent } from "./account/account.password.component";
import { AccountDeleteComponent } from "./account/account.delete.component";
import { RecipeAccessComponent } from "./recipes/recipe.access.component";

/** States */
export const homeState = { name: 'home', url: '/home',  component: HomeComponent };
export const loginState = { name: 'login', url: '/login',  component: LoginComponent };
export const manageCategoriesState = { name: 'manageCategories', url: '/manage-categories',  component: ListManagementComponent };
export const manageOriginsState = { name: 'manageOrigins', url: '/manage-origins',  component: ListManagementComponent };
export const accountProfileState = { name: 'accountProfile', url: '/account-profile',  component: AccountProfileComponent };
export const accountEmailState = { name: 'accountEmail', url: '/account-email',  component: AccountEmailComponent };
export const accountPasswordState = { name: 'accountPassword', url: '/account-password',  component: AccountPasswordComponent };
export const accountDeleteState = { name: 'accountDelete', url: '/account-delete',  component: AccountDeleteComponent };
export const enterRecipeState = { name: 'enterRecipe', url: '/recipe-enter',  component: RecipeAccessComponent };
export const recipeSearchState = { name: 'searchRecipes', url: '/recipes-search',  component: RecipeAccessComponent };
