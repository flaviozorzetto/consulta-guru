import Route from '@ember/routing/route';

export default class ConsultaCnpjRoute extends Route {
  model(params) {
    return params;
  }

  setupController(controller, ...args) {
    super.setupController(controller, ...args);

    if (args[0].cnpj && args[0].cnpj !== 'true') {
      controller.cnpjVal = args[0].cnpj;
      if (controller.validateCnpj(controller.cnpj)) {
        controller.queryCnpj();
      } else {
        controller.cnpjErrorState = true;
      }
    }
  }
}
