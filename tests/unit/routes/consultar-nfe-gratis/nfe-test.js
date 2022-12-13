import { module, test } from 'qunit';
import { setupTest } from 'super-rentals/tests/helpers';

module('Unit | Route | consultar-nfe-gratis/nfe', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:consultar-nfe-gratis/nfe');
    assert.ok(route);
  });
});
