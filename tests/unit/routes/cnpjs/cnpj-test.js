import { module, test } from 'qunit';
import { setupTest } from 'super-rentals/tests/helpers';

module('Unit | Route | cnpjs/cnpj', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:cnpjs/cnpj');
    assert.ok(route);
  });
});
