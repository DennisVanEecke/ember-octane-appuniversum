import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

class DummyObject extends EmberObject {
  ip;
  company;
  word;
  constructor(ip, company, word) {
    super();
    this.ip = ip;
    this.company = company;
    this.word = word;
  }
}

export default class IndexRoute extends Route {
  async model() {
    const dummyObject = new DummyObject('127.0.0.1', null, null);
    return { dummyObject };
  }
}
