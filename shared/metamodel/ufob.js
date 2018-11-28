// @flow

import * as R from 'ramda';
import type { UfoaEntity } from './ufoa';
import type { EntityInst } from './ufoa-inst';
import { ufobSchema } from '../schema/ufob.schema.js';
var Ajv = require('ajv');

export type Id = string;

// Validation

export type ValidationResult = {
  errors?: string
}

export const validationResultOK = {};

function validateElement(elem: any, uri: string): ValidationResult {
  ajv.validate(uri, elem); 
  if (!ajv.errors) {
    return {};
  } else {
    return { errors: ajv.errorsText() };
  }
}

var ajv = new Ajv();
ajv.addSchema(ufobSchema); 


// Situation

export type SituationCombinator = (Array<EntityInst>, EntityInst) => Array<EntityInst>;

export type SituationOperation = (Array<EntityInst>) => Array<EntityInst>;

export type Disposition = {
  d_text: string,
  d_events_ids: Array<Id>
};

export type Situation = {
  s_id: Id,
  s_name: string,
  s_dispositions: Array<Disposition>,
};

export type EventB = {
  ev_id: Id,
  ev_name: string,
  ev_to_situation_id: Id
};

export type UfobModel = {
  events: Array<EventB>,
  situations: Array<Situation>
};

export const emptyModel = { events: [], situations: [] };

export function validateModel(model: UfobModel): ValidationResult {
  return validateElement(model, "ufob-meta#/model"); 
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

