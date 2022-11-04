import Route from '@ember/routing/route';
// import fetch from 'fetch';

export default class ConsultaCnpjRoute extends Route {
  model(params) {
    // Fetch API
    // if (params.cnpj) {
    //   fetch(
    //     `https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/${params.cnpj}`
    //   ).then((response) => {
    //     console.log(response);
    //     return { cnpj: params.cnpj, response };
    //   });
    // }

    return params;
  }
}
