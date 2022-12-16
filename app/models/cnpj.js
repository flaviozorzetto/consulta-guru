import Model, { attr } from '@ember-data/model';

export default class CnpjModel extends Model {
  @attr address;
  @attr name;
  @attr tradeName;
  @attr unit;
  @attr federalTaxNumber;
  @attr openedOn;
  @attr legalNature;
  @attr responsableEntity;
  @attr status;
  @attr email;
  @attr phones;
  @attr economicActivities;
  @attr shareCapital;
  @attr partners;
}
