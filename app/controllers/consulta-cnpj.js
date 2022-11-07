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

const validateCnpj = (cnpj) => {
  if (!cnpj) return false;

  const parsedCnpj = removeNonNumbers(cnpj);

  if (parsedCnpj.length !== 14) {
    return false;
  }

  return true;
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
  loadingFetch = false;

  @tracked
  receivedCnpj = false;

  @tracked
  cnpj = null;

  @tracked
  cnpjData = null;

  set cnpjVal(val) {
    this.cnpj = stringifyCpnj(val);
  }

  queryCnpj = () => {
    if (!this.loadingFetch) {
      if (validateCnpj(this.cnpj)) {
        // key=AIzaSyDyToojxnr4s_2RXXRc-20H0zu9Py8u9Ks
        // const urlBody = 'https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/:cnpj';
        // const cleanCnpj = this.cnpj.replace(/[^0-9]/gi, '');
        // validate Url -> https://api.nfse.io/validate/LegalEntities/taxNumber/:cnpj

        // fetch(urlBody + cleanCnpj).then(() => {
        //   this.loadingFetch = false;
        // });

        this.loadingFetch = true;
        fetch('/api/cnpj.json')
          .then((res) => {
            return res.json();
          })
          .then((json) => {
            for (let prop in json['data']) {
              const entityData = json['data'][prop]['legalEntity'];
              if (entityData) {
                if (entityData['federalTaxNumber'] === this.cnpj) {
                  this.receivedCnpj = true;
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
                  this.cnpjData = entityData;
                }
              }
            }
            setTimeout(() => {
              this.loadingFetch = false;
            }, 1000);
          });
      } else {
        alert('Cnpj invalido!');
      }
    }
  };

  @action
  handleCnpj(event) {
    this.cnpjVal = event.target.value;
  }
}
