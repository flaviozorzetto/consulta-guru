import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

const parseShareCapital = (val) => {
  const numString = val.toString();

  return (
    numString
      .split('')
      .reverse()
      .map((e, i) => {
        if (i == 0) return e;
        return i % 3 == 0 ? e + '.' : e;
      })
      .reverse()
      .join('') + ',00'
  );
};

const parseEconomicActivities = (activitiesArr) => {
  const parsedActivitiesArr = activitiesArr.map((e) => {
    e.code = e.code
      .split('')
      .map((e, i) => {
        switch (i) {
          case 4:
            e = `-${e}`;
            break;
          case 5:
            e = `/${e}`;
            break;
        }
        return e;
      })
      .join('');
    return e;
  });

  const activitiesObj = {
    main: parsedActivitiesArr.filter((e) => e.isMain),
    secondary: parsedActivitiesArr.filter((e) => !e.isMain),
  };
  return activitiesObj;
};

const parseAddress = (address) => {
  const addressObj = {
    address_p1: `${address.streetSuffix ? address.streetSuffix + ' ' : ''}${
      address.street
    }, ${address.number}`,
    address_p2: `${address.district}, ${address.city.name} - ${address.state}`,
    address_p3: `CEP: ${address.postalCode}`,
  };

  return addressObj;
};

const parseLegalNature = (obj) => {
  return `${obj.code
    .split('')
    .map((e, i) => (i == 3 ? '-' + e : e))
    .join('')} - ${obj.description}`;
};

const parseData = (date) => {
  return date.toISOString().substring(0, 10).split('-').reverse().join('/');
};

const removeNonNumbers = (val) => {
  return val.replace(/[^0-9]/gi, '');
};

const stringifyCpnj = (cnpj) => {
  if (cnpj != null) {
    const newCnpj = removeNonNumbers(cnpj).substring(0, 14);

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
  lastCnpjQueried = null;

  @tracked
  loadingFetch = false;

  @tracked
  receivedCnpj = false;

  @tracked
  cnpj = null;

  @tracked
  cnpjData = null;

  @tracked
  cnpjErrorState = false;

  set cnpjVal(val) {
    this.cnpj = stringifyCpnj(val);
  }

  queryCnpj = () => {
    if (!this.loadingFetch) {
      if (!this.validateCnpj(this.cnpj)) return (this.cnpjErrorState = true);
      this.cnpjErrorState = false;

      const urlBody = 'https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/';
      const cleanCnpj = removeNonNumbers(this.cnpj);
      const apiMode = true;

      if (!(cleanCnpj == this.lastCnpjQueried)) {
        this.loadingFetch = true;
        fetch(apiMode ? urlBody + cleanCnpj : '/api/cnpj.json')
          .then((res) => {
            this.lastCnpjQueried = cleanCnpj;
            return res.json();
          })
          .then((json) => {
            if (json['data']) {
              let foundCnpjLocal = false;
              for (let prop in json['data']) {
                const entityData = json['data'][prop]['legalEntity'];
                if (entityData) {
                  if (entityData['federalTaxNumber'] === this.cnpj) {
                    entityData.address = parseAddress(entityData.address);
                    const d = new Date(entityData.openedOn);
                    entityData.openedOn = parseData(d);
                    entityData.legalNature = parseLegalNature(
                      entityData.legalNature
                    );
                    entityData.economicActivities = parseEconomicActivities(
                      entityData.economicActivities
                    );
                    entityData.shareCapital = parseShareCapital(
                      entityData.shareCapital
                    );
                    foundCnpjLocal = true;
                    this.cnpjErrorState = false;
                    this.receivedCnpj = true;
                    this.cnpjData = entityData;
                  }
                }
              }
              setTimeout(() => {
                this.loadingFetch = false;
              }, 2000);
              if (!foundCnpjLocal) {
                this.cnpjErrorState = true;
              }
            } else {
              this.loadingFetch = false;
              const entityData = json['legalEntity'];
              entityData.address = parseAddress(entityData.address);
              const d = new Date(entityData.openedOn);
              entityData.openedOn = parseData(d);
              entityData.legalNature = parseLegalNature(entityData.legalNature);
              entityData.economicActivities = parseEconomicActivities(
                entityData.economicActivities
              );
              entityData.shareCapital = parseShareCapital(
                entityData.shareCapital
              );
              this.cnpjErrorState = false;
              this.receivedCnpj = true;
              this.cnpjData = entityData;
            }
          });
      }
    }
  };

  validateCnpj = (cnpj) => {
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
  };

  @action
  handleCnpj(event) {
    this.cnpjVal = event.target.value;
  }
}
