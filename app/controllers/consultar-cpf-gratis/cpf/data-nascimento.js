import ConsultarCpfGratisController from '..';
import { tracked } from '@glimmer/tracking';

const parsers = {
  naturalPerson(obj) {
    obj.birthOn = this.dateParser(obj.birthOn);
    obj.createdOn = this.dateParser(obj.createdOn);
    return obj;
  },
  dateParser(date) {
    const parsedFormat = date.split('T')[0].split('-').reverse().join('/');
    return parsedFormat;
  },
};

export default class ConsultarCpfGratisCpfDataNascimentoController extends ConsultarCpfGratisController {
  @tracked
  showDefaultContent = false;

  @tracked
  lastCpfQueried = null;

  @tracked
  loadingFetch = false;

  @tracked
  cpfData = null;

  @tracked
  limitReached = false;

  queryCpf = () => {
    if (!this.loadingFetch) {
      if (!(this.validateCpf(this.cpf) && this.validateDate(this.date))) {
        this.errorState = true;
        return;
      }
      this.showDefaultContent = false;
      this.errorState = false;
      this.limitReached = false;
      this.loadingFetch = true;
      const baseUrl = 'https://api.nfse.io/NaturalPeople/Basicinfo/taxNumber';
      const cleanCpf = this.removeNonNumbers(this.cpf);
      const parsedDate = this.date.split('/').reverse().join('-');
      const apiMode = true;

      fetch(apiMode ? `${baseUrl}/${cleanCpf}/${parsedDate}` : '/api/cpf.json')
        .then((res) => {
          if (res.status === 404) {
            throw new Error('Not Found');
          }
          if (res.status === 429) {
            throw new Error('Limit reached');
          }
          return res.json();
        })
        .then((json) => {
          // LOCAL
          if (json.response) {
            json.response.forEach((elem) => {
              if (elem.naturalPerson.federalTaxNumber == this.cpf) {
                this.cpfData = parsers.naturalPerson(elem.naturalPerson);
              }
            });
            setTimeout(() => {
              this.loadingFetch = false;
            }, 2000);
          } else {
            this.cpfData = parsers.naturalPerson(json.naturalPerson);
            this.loadingFetch = false;
          }
        })
        .catch((err) => {
          console.log(err);
          if (err.message === 'Limit reached') {
            this.limitReached = true;
          }
          if (err.message === 'Not Found') {
            this.errorState = true;
          }
          this.loadingFetch = false;
        });
    }
  };
}
