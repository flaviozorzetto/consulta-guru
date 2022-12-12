import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service('side-nav') sideMenu;

  @action
  didTransition() {
    window.scrollTo(0, 0);
    if (this.sideMenu.open) {
      this.sideMenu.clickMenu();
    }
  }
}
