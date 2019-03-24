// @flow

import * as panel from './view/panel';
import * as machine from './machine';

export function initialise(ufobVisModel: any) {
  panel.render(ufobVisModel);
  machine.initialize();
}



