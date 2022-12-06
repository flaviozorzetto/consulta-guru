import Route from '@ember/routing/route';

export default class ConsultarCpfGratisCpfDataNascimentoRoute extends Route {
  model(params) {
    return { ...params, ...this.modelFor('consultar-cpf-gratis/cpf') };
  }

  setupController(controller, ...args) {
    super.setupController(controller, ...args);

    controller.dateVal = args[0].date;
    controller.cpfVal = args[0].cpf;

    controller.queryCpf();
    if (
      !(
        controller.validateCpf(controller.cpf) &&
        controller.validateDate(controller.date)
      )
    ) {
      controller.showDefaultContent = true;
    }
  }
}
