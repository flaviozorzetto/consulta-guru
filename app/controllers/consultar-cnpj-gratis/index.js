import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class IndexController extends Controller {
  @service
  router;

  @tracked
  cnpj = null;

  @tracked
  cnpjErrorState = false;

  set cnpjVal(val) {
    this.cnpj = this.stringifyCpnj(val);
  }

  @action
  fetchCnpj() {
    if (this.validateCnpj(this.cnpj)) {
      this.router.transitionTo(
        '/consultar-cnpj-gratis/' + this.removeNonNumbers(this.cnpj)
      );
    } else {
      this.cnpjErrorState = true;
    }
  }

  @action
  removeNonNumbers(val) {
    return val.replace(/[^0-9]/gi, '');
  }

  @action
  stringifyCpnj(cnpj) {
    if (cnpj != null) {
      const newCnpj = this.removeNonNumbers(cnpj).substring(0, 14);

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
  }

  @action
  validateCnpj(cnpj) {
    if (!cnpj) return false;

    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj == '') return false;

    if (cnpj.length != 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (
      cnpj == '00000000000000' ||
      cnpj == '11111111111111' ||
      cnpj == '22222222222222' ||
      cnpj == '33333333333333' ||
      cnpj == '44444444444444' ||
      cnpj == '55555555555555' ||
      cnpj == '66666666666666' ||
      cnpj == '77777777777777' ||
      cnpj == '88888888888888' ||
      cnpj == '99999999999999'
    )
      return false;

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
  }

  @action
  handleCnpj(event) {
    this.cnpjVal = event.target.value;
  }
}
