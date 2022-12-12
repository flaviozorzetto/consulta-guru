import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SideMenuComponent extends Component {
  @service('side-nav') sideMenu;
}
