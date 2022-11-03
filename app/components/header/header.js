import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const stringifyCpnj = (cnpj) => {
  const newCnpj = cnpj.substring(0, 18);

  const returningCpnj = [...newCnpj]
    .join('')
    .replace(/[^0-9]/gi, '')
    .split('')
    .map((e, i) => {
      switch (i) {
        case 2:
          e = `.${e}`;
          break;
        case 5:
          e = `.${e}`;
          break;
        case 8:
          e = `/${e}`;
          break;
        case 12:
          e = `-${e}`;
          break;
      }
      return e;
    })
    .join('');

  return returningCpnj;
};

export default class HeaderComponent extends Component {
  @tracked
  cnpj = '';

  @action
  handleCnpj(event) {
    this.cnpj = stringifyCpnj(event.target.value);
  }
}
