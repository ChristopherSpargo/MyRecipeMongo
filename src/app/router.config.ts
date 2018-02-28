import {UIRouter} from "@uirouter/angular";
import {homeState} from "./states";

/** UIRouter Config  */
export function uiRouterConfigFn(router: UIRouter) {
  // If no URL matches, go to the `home` state by default
  router.urlService.rules.otherwise({ state: 'home' });
  }