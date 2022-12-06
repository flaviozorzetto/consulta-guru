import Route from '@ember/routing/route';

export default class ConsultarCpfGratisCpfRoute extends Route {
  model() {
    return this.modelFor('consultar-cpf-gratis/cpf');
  }

  setupController(controller, ...args) {
    super.setupController(controller, ...args);
    controller.cpfVal = args[0].cpf;
    if (!controller.validateCpf(controller.cpf)) controller.errorState = true;
  }
}
