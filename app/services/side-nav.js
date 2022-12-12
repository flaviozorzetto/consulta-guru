import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SideNavService extends Service {
  @tracked
  open = false;

  @tracked
  menuNav1 = false;

  @tracked
  menuNav2 = false;

  @tracked
  menuNav3 = false;

  @action
  clickNav1() {
    this.menuNav1 = !this.menuNav1;
  }

  @action
  clickNav2() {
    this.menuNav2 = !this.menuNav2;
  }

  @action
  clickNav3() {
    this.menuNav3 = !this.menuNav3;
  }

  @action
  clickMenu() {
    this.open = !this.open;
    if (this.open) {
      document.querySelector('body').classList.add('no-scroll');
    } else {
      document.querySelector('body').classList.remove('no-scroll');
    }
  }

  @action
  resetDefault() {
    this.open = false;
    document.querySelector('body').classList.remove('no-scroll');
  }
}
