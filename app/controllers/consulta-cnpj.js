import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

const stringifyCpnj = (cnpj) => {
  if (cnpj != null) {
    const newCnpj = cnpj.replace(/[^0-9]/gi, '').substring(0, 14);

    const returningCpnj = [...newCnpj]
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
  }
  return null;
};

export default class ConsultaCnpjController extends Controller {
  queryParams = ['cnpj'];

  @tracked
  loadingFetch = false;

  @tracked
  receivedCnpj = false;

  @tracked
  _cnpj = null;

  set cnpjVal(val) {
    this._cnpj = stringifyCpnj(val);
  }

  queryCnpj = () => {
    this.loadingFetch = true;
    const urlBody = 'https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/';

    const cleanCnpj = this._cnpj.replace(/[^0-9]/gi, '');
    fetch(urlBody + cleanCnpj).then(() => {
      this.loadingFetch = false;
    });
  };

  @action
  handleCnpj(event) {
    this.cnpjVal = event.target.value;
  }
}
