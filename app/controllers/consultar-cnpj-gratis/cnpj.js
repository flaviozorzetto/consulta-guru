import IndexController from '.';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ConsultarCnpjGratisController extends IndexController {
  @service store;

  @tracked
  showDefaultContent = false;

  @tracked
  lastCnpjQueried = null;

  @tracked
  loadingFetch = false;

  @tracked
  cnpjData = null;

  @tracked
  limitReached = false;

  @action
  async queryCnpj() {
    if (!this.loadingFetch) {
      if (!this.validateCnpj(this.cnpj)) {
        this.errorState = true;
        return;
      }
      this.limitReached = false;
      this.errorState = false;

      const cleanCnpj = this.removeNonNumbers(this.cnpj);

      try {
        this.loadingFetch = true;
        const cnpjRecord = await this.store.queryRecord('cnpj', {
          cnpj: cleanCnpj,
        });
        this.cnpjData = cnpjRecord;
        this.lastCnpjQueried = cleanCnpj;
        this.showDefaultContent = false;
      } catch (error) {
        const firstError = error.errors.firstObject;
        if (firstError.status === 429) {
          this.limitReached = true;
          this.showDefaultContent = false;
        } else {
          this.showDefaultContent = true;
        }
        this.errorState = true;
      } finally {
        this.loadingFetch = false;
      }
    }
  }
}
