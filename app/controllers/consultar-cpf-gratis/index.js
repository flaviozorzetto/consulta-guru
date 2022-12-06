import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ConsultarCpfGratisController extends Controller {
  @service
  router;

  @tracked
  cpf = null;

  @tracked
  date = null;

  @tracked
  loadingFetch = false;

  @tracked
  errorState = false;

  @action
  removeNonNumbers(val) {
    return val.replace(/[^0-9]/gi, '');
  }

  @action
  stringifyDate(date) {
    const newDate = this.removeNonNumbers(date).substring(0, 8);

    const returningDate = newDate
      .split('')
      .map((e, i) => {
        switch (i) {
          case 2:
            e = `/${e}`;
            break;
          case 4:
            e = `/${e}`;
            break;
        }
        return e;
      })
      .join('');

    return returningDate;
  }

  @action
  stringifyCpf(cpf) {
    const newCpf = this.removeNonNumbers(cpf).substring(0, 11);

    const returningCpf = newCpf
      .split('')
      .map((e, i) => {
        switch (i) {
          case 3:
            e = `.${e}`;
            break;
          case 6:
            e = `.${e}`;
            break;
          case 9:
            e = `-${e}`;
            break;
        }
        return e;
      })
      .join('');

    return returningCpf;
  }

  @action
  validateCpf(cpf) {
    if (!cpf) return false;
    cpf = this.removeNonNumbers(cpf);
    if (cpf == '00000000000' && cpf.length != 11) return false;
    const splitted = cpf.split('');
    const verifiers = cpf.substring(9);

    let i = 0;
    let total = 0;

    for (let x = 10; x > 1; x--) {
      total += parseInt(splitted[i]) * x;
      i++;
    }

    let integerDivision = (total * 10) % 11;

    if (integerDivision > 9) integerDivision = 0;

    if (verifiers[0] != integerDivision) {
      return false;
    } else {
      i = 0;
      total = 0;

      for (let x = 11; x > 1; x--) {
        total += parseInt(splitted[i]) * x;
        i++;
      }

      let integerDivision = (total * 10) % 11;

      if (integerDivision > 9) integerDivision = 0;

      if (verifiers[1] != integerDivision) {
        return false;
      }
    }

    return true;
  }

  @action
  validateDate(date) {
    if (!date) return false;
    if (this.removeNonNumbers(date).length != 8) return false;
    const splitted = date.split('/');

    const validDate = new Date(
      splitted[2],
      parseInt(splitted[1]) - 1,
      splitted[0]
    );
    if (Date.now() < validDate.getTime()) return false;

    return true;
  }

  @action
  fetchCpf() {
    if (this.validateCpf(this.cpf) && this.validateDate(this.date)) {
      this.router.transitionTo(
        `/consultar-cpf-gratis/${this.cpf}/${encodeURIComponent(this.date)}`
      );
    } else {
      this.errorState = true;
    }
  }

  set cpfVal(val) {
    this.cpf = this.stringifyCpf(val);
  }

  set dateVal(val) {
    this.date = this.stringifyDate(val);
  }

  @action
  handleCpf(event) {
    this.cpfVal = event.target.value;
    if (this.cpf.length === 14) {
      document.getElementById('date-input').focus();
      this.cpfVal = event.target.value;
    }
  }

  @action
  handleDate(event) {
    this.dateVal = event.target.value;
  }
}
