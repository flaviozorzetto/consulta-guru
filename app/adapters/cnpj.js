import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class CnpjAdapter extends JSONAPIAdapter {
  urlForQueryRecord(query) {
    const apiMode = false;
    const urlBody =
      'https://api.nfse.io/LegalEntities/Basicinfo/taxNumber/' + query.cnpj;

    return apiMode ? urlBody : `/api/cnpj/${query.cnpj}.json`;
  }
}
