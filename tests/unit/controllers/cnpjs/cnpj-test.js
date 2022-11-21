import { module, test } from 'qunit';
import { setupTest } from 'super-rentals/tests/helpers';

module('Unit | Controller | cnpjs/cnpj', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:cnpjs/cnpj');
    assert.ok(controller);
  });
});
