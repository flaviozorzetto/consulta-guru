import EmberRouter from '@ember/routing/router';
import config from 'super-rentals/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('consulta-cnpj', { path: '/consulta-cnpj/:cnpj' });
  this.route('consulta-cnpj');
});
