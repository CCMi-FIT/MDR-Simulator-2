//@flow

import type { UfoaEntity, Generalisation, Association, Model } from './metamodel/ufoa';
import * as ufoaDB from './db/ufoa';

var e_id_counter = 0;
var g_id_counter = 0;
var a_id_counter = 0;

var e_ids_dict = {};

function convertEntity(entity: UfoaEntity): UfoaEntity {
  let old_e_id = entity.e_id;
  entity.e_id = "e" + e_id_counter;
  e_id_counter++;
  Object.assign(e_ids_dict, { [old_e_id]: entity.e_id });
  return entity; 
}

function convertGeneralisation(generalisation: Generalisation): Generalisation {
  generalisation.g_id = "g" + g_id_counter++;
  generalisation.g_sup_e_id = e_ids_dict[generalisation.g_sup_e_id];
  generalisation.g_sub_e_id = e_ids_dict[generalisation.g_sub_e_id];
  console.log(generalisation);
  return generalisation; 
}

function convertAssociation(association: Association): Association {
  association.a_id = "a" + a_id_counter++;
  association.a_connection1.e_id = e_ids_dict[association.a_connection1.e_id];
  association.a_connection2.e_id = e_ids_dict[association.a_connection2.e_id];
  return association; 
}

export function convertModel():void {
  ufoaDB.getModel().then(model => {
    let entities = model.entities.map(convertEntity);
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
