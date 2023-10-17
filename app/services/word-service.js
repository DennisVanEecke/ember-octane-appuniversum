import Service from '@ember/service';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { tracked } from '@glimmer/tracking';
import Fuse from 'fuse.js';

export default class WordService extends Service {
  constructor(...args) {
    super(...args);
  }

  worker;
  _fuse = null;

  _initTask = task(async () => {
    const response = await fetch('/text/words.txt');
    const text = await response.text();
    const result = text.split('\n'); // Pretty CPU intensive this. Will block stuff
    this._fuse = new Fuse(result);
  });

  initTask = trackedTask(this, this._initTask, () => [this]);

  get isLoading() {
    return this.initTask.isRunning;
  }
  get words() {
    return this.initTask.value;
  }

  fuzzySearch(searchString) {
    if (!this._fuse) return;
    return this._fuse
      .search(searchString, { limit: 20 })
      .map((searchResult) => searchResult.item);
  }
}
