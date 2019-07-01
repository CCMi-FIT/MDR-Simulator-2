// @flow

import * as panel from './view/panel';
import { cloneVisModel } from '../diagram'; 

export function initialise(ufobVisModel: any) {
  panel.initialize(cloneVisModel(ufobVisModel));
}



