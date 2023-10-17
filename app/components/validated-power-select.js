import Component from '@glimmer/component';

export default class ValidatedPowerSelectComponent extends Component {
  get containerStyle() {
    if (this.args.error) return 'ember-power-select--error';
    if (this.args.warning) return 'ember-power-select--warning';
    return '';
  }
}
