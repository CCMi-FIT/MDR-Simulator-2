//@flow

import type { UfoaEntity, Generalisation, GSet, Association, Model } from './metamodel/ufoa';
import * as ufoaDB from './db/ufoa';


function convertGeneralisation(generalisation: Generalisation): Generalisation {
  Object.assign(generalisation, {
    g_set: {
      g_set_id: generalisation.g_set_id,
      g_meta: generalisation.g_meta
    }
  });
  delete generalisation.g_set_id;
  delete generalisation.g_meta;
  return generalisation; 
}

export function convertModel():void {
  ufoaDB.getModel().then(model => {
    let entities = model.entities;
    let generalisations = model.generalisations.map(convertGeneralisation);
    let associations = model.associations;
    let model2: Model = {
      entities,
      generalisations,
      associations
    };
    ufoaDB.writeModel(model2);
  }, (error) => { console.error(error); });
}
