import IndexController from '.';
import { tracked } from '@glimmer/tracking';

const parsers = {
  parseEntityData(entityData) {
    entityData.address = parsers.parseAddress(entityData.address);
    const d = new Date(entityData.openedOn);
    entityData.openedOn = parsers.parseData(d);
    entityData.legalNature = parsers.parseLegalNature(entityData.legalNature);
    entityData.economicActivities = parsers.parseEconomicActivities(
      entityData.economicActivities
    );
    entityData.shareCapital = parsers.parseShareCapital(
      entityData.shareCapital
    );
    entityData.phones = entityData.phones.map((e) => {
      const obj = { ...e };
      obj.number = parsers.parsePhone(obj.number);
      return obj;
    });
    return entityData;
  },

  parseShareCapital(val) {
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
  },

  parseEconomicActivities(activitiesArr) {
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
  },

  parseAddress(address) {
    const addressObj = {
      address_p1: `${address.streetSuffix ? address.streetSuffix + ' ' : ''}${
        address.street
      }, ${address.number}`,
      address_p2: `${address.district}, ${address.city.name} - ${address.state}`,
      address_p3: `CEP: ${address.postalCode}`,
    };

    return addressObj;
  },

  parseLegalNature(obj) {
    return `${obj.code
      .split('')
      .map((e, i) => (i == 3 ? '-' + e : e))
      .join('')} - ${obj.description}`;
  },

  parseData(date) {
    return date.toISOString().substring(0, 10).split('-').reverse().join('/');
  },

  parsePhone(phone) {
    const start = phone.slice(0, 4);
    const end = phone.slice(4);

    const parsedPhone = start + '-' + end;

    return parsedPhone;
  },
};

export default class ConsultaCnpjController extends IndexController {
  @tracked
  lastCnpjQueried = null;

  @tracked
  loadingFetch = false;

  @tracked
  cnpjData = null;

  queryCnpj = () => {
    if (!this.loadingFetch) {
      if (!this.validateCnpj(this.cnpj)) return (this.cnpjErrorState = true);
      this.cnpjErrorState = false;

      const urlBody = 'https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/';
      const cleanCnpj = this.removeNonNumbers(this.cnpj);
      const apiMode = false;

      if (cleanCnpj !== this.lastCnpjQueried) {
        this.loadingFetch = true;
        fetch(apiMode ? urlBody + cleanCnpj : '/api/cnpj.json')
          .then((res) => {
            this.lastCnpjQueried = cleanCnpj;
            return res.json();
          })
          .then((json) => {
            // LOCAL
            if (json['data']) {
              let foundCnpjLocal = false;
              for (let prop in json['data']) {
                let entityData = json['data'][prop]['legalEntity'];
                if (entityData) {
                  if (entityData['federalTaxNumber'] === this.cnpj) {
                    entityData = parsers.parseEntityData(entityData);
                    foundCnpjLocal = true;
                    this.cnpjErrorState = false;
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
              // API ONLINE
              const entityData = parsers.parseEntityData(json['legalEntity']);
              this.loadingFetch = false;
              this.cnpjErrorState = false;
              this.receivedCnpj = true;
              this.cnpjData = entityData;
            }
          });
      }
    }
  };
}
