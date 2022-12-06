import { module, test } from 'qunit';
import { setupTest } from 'super-rentals/tests/helpers';

module(
  'Unit | Route | consultar-cpf-gratis/cpf/data-nascimento',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:consultar-cpf-gratis/cpf/data-nascimento'
      );
      assert.ok(route);
    });
  }
);
