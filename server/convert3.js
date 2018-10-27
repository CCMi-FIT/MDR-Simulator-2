//@flow

import type { UfoaEntity, Generalisation, Association, Model } from './metamodel/ufoa';
import * as ufoaDB from './db/ufoa';

function convertGeneralisation(generalisation: Generalisation): Generalisation {
  generalisation.g_set.g_meta  = generalisation.g_set.g_meta || "";
  return generalisation; 
}

function convertAssociation(association: Association): Association {
  association.a_meta = association.a_meta || "";
  return association; 
}

export function convertModel():void {
  ufoaDB.getModel().then(model => {
    let entities = model.entities;
    let generalisations = model.generalisations.map(convertGeneralisation);
    let associations = model.associations.map(convertAssociation);
    let model2: Model = {
      entities,
      generalisations,
      associations
    };
    ufoaDB.writeModel(model2);
  }, (error) => { console.error(error); });
}
