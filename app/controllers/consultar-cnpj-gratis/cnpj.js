import IndexController from '.';
import { tracked } from '@glimmer/tracking';

const parsers = {
  parseEntityData(entityData) {
    entityData.address = this.parseAddress(entityData.address);
    const date = new Date(entityData.openedOn);
    entityData.openedOn = this.parseData(date);
    entityData.legalNature = this.parseLegalNature(entityData.legalNature);
    entityData.economicActivities = this.parseEconomicActivities(
      entityData.economicActivities
    );
    entityData.shareCapital = this.parseShareCapital(entityData.shareCapital);
    entityData.phones = entityData.phones.map((e) => {
      const obj = { ...e };
      obj.number = this.parsePhone(obj.number);
      return obj;
    });
    entityData.email = entityData.email.toLowerCase();

    if (entityData.partners)
      entityData.partners = this.parsePartners(entityData.partners);

    return entityData;
  },

  parsePartners(partnersArr) {
    const newPartnersArr = [];
    partnersArr.forEach((e, i) => {
      if (i == 0) {
        newPartnersArr.push({
          qualification: e.qualification,
          names: [e.name],
        });
      } else {
        let found = false;
        newPartnersArr.forEach((partner) => {
          if (partner.qualification.code === e.qualification.code) {
            partner.names.push(e.name);
            found = true;
          }
        });
        if (!found) {
          newPartnersArr.push({
            qualification: e.qualification,
            names: [e.name],
          });
        }
      }
    });
    return newPartnersArr;
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

export default class ConsultarCnpjGratisController extends IndexController {
  @tracked
  showDefaultContent = false;

  @tracked
  lastCnpjQueried = null;

  @tracked
  loadingFetch = false;

  @tracked
  cnpjData = null;

  @tracked
  limitReached = false;

  queryCnpj = () => {
    if (!this.loadingFetch) {
      if (!this.validateCnpj(this.cnpj)) {
        this.errorState = true;
        return;
      }
      this.showDefaultContent = false;
      this.limitReached = false;
      this.errorState = false;

      const urlBody = 'https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/';
      const cleanCnpj = this.removeNonNumbers(this.cnpj);
      const apiMode = true;

      if (cleanCnpj !== this.lastCnpjQueried) {
        this.loadingFetch = true;
        fetch(apiMode ? urlBody + cleanCnpj : '/api/cnpj.json')
          .then((res) => {
            this.lastCnpjQueried = cleanCnpj;
            if (res.status === 429) {
              throw new Error('Limit reached');
            }
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
                    this.errorState = false;
                    this.cnpjData = entityData;
                  }
                }
              }
              setTimeout(() => {
                this.loadingFetch = false;
              }, 1000);
              if (!foundCnpjLocal) {
                this.errorState = true;
              }
            } else {
              // API ONLINE
              const entityData = parsers.parseEntityData(json['legalEntity']);
              this.loadingFetch = false;
              this.errorState = false;
              this.receivedCnpj = true;
              this.cnpjData = entityData;
            }
          })
          .catch((err) => {
            console.log(err);
            if (err.message === 'Limit reached') {
              this.limitReached = true;
            }
            this.errorState = true;
            this.loadingFetch = false;
          });
      }
    }
  };
}
