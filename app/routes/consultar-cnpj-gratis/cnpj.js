import Route from '@ember/routing/route';

export default class ConsultarCnpjGratisRoute extends Route {
  model(params) {
    return params;
  }

  setupController(controller, ...args) {
    super.setupController(controller, ...args);

    if (args[0].cnpj && args[0].cnpj !== 'true') {
      controller.cnpjVal = args[0].cnpj;
      controller.queryCnpj();
    }
  }
}
