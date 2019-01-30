// @flow

// Imports {{{1
import type { Id, ValidationResult } from '../metamodel';
import { validateElement } from '../metamodel';
import { ufobSchema } from './schema';

// Schema {{{1
var Ajv = require('ajv');
var ajv = new Ajv();
ajv.addSchema(ufobSchema); 
// Situation {{{1

export type Disposition = {
  d_text: string,
  d_events_ids: Array<Id>
};

export const emptyDisposition = { d_text: "", d_events_ids: [] };

export type Situation = {
  s_id: Id,
  s_name: string,
  s_dispositions: Array<Disposition>,
  s_wmda_text: string
};

export function validateSituation(situation: Situation): ValidationResult {
  return validateElement(ajv, situation, "ufob-meta#/definitions/situation"); 
}

// Event {{{1

export type UfobEvent = {
  ev_id: Id,
  ev_name: string,
  ev_add_ops: Array<AddEntityInstOp>,
  ev_remove_ops: Array<RemoveEntityInstOp>,
  ev_to_situation_id: Id,
  ev_wmda_text: string
};

export function newEvent(ev_id: Id, ev_name: string, ev_to_situation_id: Id): UfobEvent {
  return ({
    ev_id,
    ev_name,
    ev_to_situation_id,
    ev_add_ops: [],
    ev_remove_ops: []
  });
}


export function validateEvent(event: UfobEvent): ValidationResult {
  return validateElement(ajv, event, "ufob-meta#/definitions/event"); 
}

export type AddEntityInstOp = {
  opa_e_id: Id,
  opa_ei_is_default: boolean
};

export function newAddEntityInstOp(opa_e_id: Id): AddEntityInstOp {
  return ({
    opa_e_id,
    opa_ei_is_default: true
  });
}

export type RemoveEntityInstOp = {
  opr_e_id: Id,
};

export function newRemoveEntityInstOp(opr_e_id: Id): RemoveEntityInstOp {
  return ({
    opr_e_id,
  });
}

export const operationTypes = {
  add_entity_inst:    "Add entity instance",
  remove_entity_inst: "Remove entity instance",
  switch_phase:       "Switch phase"
};

export type OperationType = $Keys<typeof operationTypes>;

// Model {{{1

export type UfobModel = {
  events: Array<UfobEvent>,
  situations: Array<Situation>
};

export const emptyModel = { events: [], situations: [] };

export function validateModel(model: UfobModel): ValidationResult {
  return validateElement(ajv, model, "ufob-meta#/model"); 
}
