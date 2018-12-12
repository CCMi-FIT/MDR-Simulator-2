// @flow

import * as R from 'ramda';
import type { Id, ValidationResult } from './general';
import { validateElement } from './general';
import type { UfoaEntity } from './ufoa';
import type { EntityInst } from './ufoa-inst';
import { ufobSchema } from '../schema/ufob.schema.js';
var Ajv = require('ajv');

var ajv = new Ajv();
ajv.addSchema(ufobSchema); 

export type SituationCombinator = (Array<EntityInst>, EntityInst) => Array<EntityInst>;

export type SituationOperation = (Array<EntityInst>) => Array<EntityInst>;

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

export type EventB = {
  ev_id: Id,
  ev_name: string,
  ev_to_situation_id: Id
};

export function validateEvent(event: EventB): ValidationResult {
  return validateElement(ajv, event, "ufob-meta#/definitions/event"); 
}

export type UfobModel = {
  events: Array<EventB>,
  situations: Array<Situation>
};

export const emptyModel = { events: [], situations: [] };

export function validateModel(model: UfobModel): ValidationResult {
  return validateElement(ajv, model, "ufob-meta#/model"); 
}

// Combinators

export type EntityCombinatorOperation = "create" | "destroy" | "switch-phase";

export const entityCombinatorOperations: Array<EntityCombinatorOperation> = ["create", "destroy", "switch-phase"];

export type EntityCombinator = {
  ec_operation: EntityCombinatorOperation,
  ec_e_id: Id
};

export type AssocCombinatorOperation = "create" | "destroy";

export const assocCombinatorOperations: Array<AssocCombinatorOperation> = ["create", "destroy"];

export type AssocCombinator = {
  ac_operation: AssocCombinatorOperation,
  ac_ai_id: Id
};

