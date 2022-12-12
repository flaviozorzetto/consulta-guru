import { module, test } from 'qunit';
import { setupTest } from 'super-rentals/tests/helpers';

module('Unit | Service | side-nav', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:side-nav');
    assert.ok(service);
  });
});
