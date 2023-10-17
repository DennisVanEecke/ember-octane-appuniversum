import Service from '@ember/service';
import { A } from '@ember/array';
import EmberObject from '@ember/object';

class Widget extends EmberObject {
  randomNumber;
  text;
  constructor(randomNumber, text) {
    super();
    this.randomNumber = randomNumber;
    this.text = text;
  }
}

export function delay(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export default class SlowServiceService extends Service {
  /**
   * Function with artificial delay which returns an ember array of dummy objects.
   * Pass number as first arg: Get some dummy text
   * Pass array of strings as first tag. Get the strings filled in in the dummy objects
   * @param {number | Array} numOrArray Can be number or an array of string
   * @param {number} millis optional delay in millis
   * @returns {A<Widget>} Ember array with some dummy objects
   */
  async getSlowObjects(numOrArray, millis) {
    const defaultedMillis = millis ?? 1000;
    await delay(defaultedMillis);
    const defaultedLength =
      typeof numOrArray === 'number' ? numOrArray : numOrArray.length;
    const defaultedValues =
      typeof numOrArray === 'number'
        ? new Array(numOrArray).map(() => 'Dummy')
        : numOrArray;
    const fakeData = A([]);
    for (let i = 0; i < defaultedLength; i++) {
      const widget = new Widget(
        parseInt(Math.random() * 100.0, 10),
        defaultedValues[i],
      );
      fakeData.push(widget);
    }
    return fakeData;
  }
}
