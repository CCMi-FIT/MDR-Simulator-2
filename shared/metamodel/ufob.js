// @flow

// Imports {{{1
import type { Id, ValidationResult } from './general';
import { validateElement } from './general';
import type { EntityInst } from './ufoa-inst';
import { ufobSchema } from '../schema/ufob.schema.js';

// Schema {{{1
var Ajv = require('ajv');
var ajv = new Ajv();
ajv.addSchema(ufobSchema); 

// Combinators {{{1
export type SituationCombinator = (Array<EntityInst>, EntityInst) => Array<EntityInst>;

export type SituationOperation = (Array<EntityInst>) => Array<EntityInst>;

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
};

export function validateSituation(situation: Situation): ValidationResult {
  return validateElement(ajv, situation, "ufob-meta#/definitions/situation"); 
}

// Event {{{1

export type EventB = {
  ev_id: Id,
  ev_name: string,
  ev_add_ops: Array<AddEntityInstOp>,
  ev_remove_ops: Array<RemoveEntityInstOp>,
  ev_to_situation_id: Id
};

export function validateEvent(event: EventB): ValidationResult {
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
  events: Array<EventB>,
  situations: Array<Situation>
};

export const emptyModel = { events: [], situations: [] };

export function validateModel(model: UfobModel): ValidationResult {
  return validateElement(ajv, model, "ufob-meta#/model"); 
}
