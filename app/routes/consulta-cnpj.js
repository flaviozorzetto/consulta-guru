import Route from '@ember/routing/route';

export default class ConsultaCnpjRoute extends Route {
  model(param) {
    return param;
  }

  setupController(controller, ...args) {
    super.setupController(controller, ...args);

    if (args[0].cnpj && args[0].cnpj !== 'true') {
      controller.cnpjVal = args[0].cnpj;
      controller.receivedCnpj = true;
      controller.queryCnpj();
    }
  }
}
