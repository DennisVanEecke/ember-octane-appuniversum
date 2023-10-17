import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import dummyObjectSchema from 'ember-octane/validations/dummy-object';
import { delay } from '../services/slow-service';

const FAMOUS_COMPANIES = [
  'Amazon',
  'Microsoft',
  'Apple',
  'Meta',
  'OpenAI',
  'X',
  'Google',
  'Bad company @&',
].sort();

const VALIDATION_FIELDS = ['ip', 'company', 'word'];

export default class IndexController extends Controller {
  @service slowService;
  @service wordService;

  @tracked trackedValue = 0;
  @tracked validationErrors = joiErrorToValidation(undefined); // Trick to get an 'empty' object
  @tracked validationWarnings = joiErrorToValidation(undefined);
  @tracked wordOptions = [];
  @tracked showWarningModal = false;
  @tracked dummyObject = { ...this.model.dummyObject }; // We keep a copy

  get wordsLoading() {
    return this.wordService.isLoading;
  }

  get hasErrors() {
    return Object.values(this.validationErrors).some((item) => item);
  }

  get hasWarnings() {
    return Object.values(this.validationWarnings).some((item) => item);
  }

  get autoUpdateGetter() {
    return `Count ${this.trackedValue}`;
  }

  get isLoading() {
    // For some reason the notation below messes with my language server?
    //return this.famousBrandsTask.isRunning || this.saveTask?.isRunning;
    if (this.famousBrandsTask.isRunning) return true;
    return this.saveTask ? this.saveTask.isRunning : true;
  }

  get selectedWidget() {
    // When the famous brands is not loaded the initial state is whatever is in the dummy object
    if (!this.famousBrandsTask.value && this.dummyObject.company)
      return { text: this.dummyObject.company };
    if (!this.dummyObject.company) return null;
    const result = this.famousBrandsTask.value.find(
      (widget) => widget.text === this.dummyObject.company,
    );
    if (!result) throw new Error('Impossiburu!');
    return result; //It's the reference that counts
  }

  _getFamousBrandsTask = task(async () => {
    const widgets = await this.slowService.getSlowObjects(
      FAMOUS_COMPANIES,
      2000,
    );
    return widgets;
  });

  famousBrandsTask = trackedTask(this, this._getFamousBrandsTask);

  @action
  handleAction() {
    this.trackedValue++;
  }

  @action
  handleSubmit(event) {
    event.preventDefault();
    if (this.showWarningModal) return; // May not be invoked when warning modal is already open
    //Validate errors
    this.validationErrors = validate(dummyObjectSchema.error, this.dummyObject);
    this.validationWarnings = validate(
      dummyObjectSchema.warning,
      this.dummyObject,
    );
    if (this.hasErrors) return;
    if (this.hasWarnings) {
      this.showWarningModal = true;
      return;
    }
    // All clear
    this.saveTask.perform();
  }

  @action
  handleWidgetChange(widget) {
    const newValue = widget === null ? null : widget.text;
    this.dummyObject = { ...this.dummyObject, company: newValue };
  }

  @action
  handleIpChange(event) {
    event.preventDefault();
    this.dummyObject.ip = event.target.value === '' ? null : event.target.value;
  }

  @action
  handleWordChange(selection) {
    this.dummyObject = { ...this.dummyObject, word: selection };
  }

  @action
  handleWordSearch(fuzzySearchString) {
    this.selectedWord = null;
    this.fuzzySearchTask.perform(fuzzySearchString);
    return false; //Prevent the default filter/matcher of powerselect
  }

  fuzzySearchTask = task({ restartable: true }, async (fuzzySearchString) => {
    await timeout(500); // Debounce
    const result = this.wordService.fuzzySearch(fuzzySearchString); // fuzzySearch is not async
    this.wordOptions = result; // Is tracked
  });

  @action
  handleWarningModalOK(event) {
    event.preventDefault();
    this.showWarningModal = false;
    this.saveTask.perform();
  }

  @action
  handleWarningModalBack(event) {
    event.preventDefault();
    this.showWarningModal = false;
  }

  saveTask = task({ drop: true }, async () => {
    await delay(3000);
  });
}

function validate(schema, object) {
  const { error } = schema.validate(object, {
    abortEarly: false,
  });
  return joiErrorToValidation(error);
}

function joiErrorToValidation(error) {
  const empty = Object.fromEntries(
    VALIDATION_FIELDS.map((key) => [key, undefined]),
  );
  if (!error) return empty;
  VALIDATION_FIELDS.forEach((key) => {
    const localDetails = [...error.details];
    const messages = localDetails
      .filter((detail) => detail.context.key === key)
      .map((detail) => detail.message);
    empty[key] = messages.length ? messages.join(', ') : undefined;
  });
  return empty;
}
