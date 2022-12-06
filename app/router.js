import EmberRouter from '@ember/routing/router';
import config from 'super-rentals/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('consultar-cnpj-gratis', function () {
    this.route('cnpj', { path: '/:cnpj' });
  });

  this.route('consultar-cpf-gratis', function () {
    this.route('cpf', { path: '/:cpf' }, function () {
      this.route('data-nascimento', { path: '/:date' });
    });
  });
});
