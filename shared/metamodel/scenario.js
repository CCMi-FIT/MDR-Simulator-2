// @flow

import type { Id, ValidationResult } from './general';
import { validateElement } from './general';
import { schema } from '../schema/scenario.schema.js';
var Ajv = require('ajv');

var ajv = new Ajv();
ajv.addSchema(schema); 

export type Scenario = {
  sc_id: Id,
  sc_name: string,
  sc_desc: string,
  sc_ev_insts: Array<EventInstance>
};

export function validateScenario(scenario: Scenario): ValidationResult {
  return validateElement(ajv, scenario, "scenario-meta#/definitions/scenario"); 
}

export type EventInstance = {
  evi_id: Id,
  evi_ev_id: Id,
  evi_ops: Array<Operation>,
  evi_is_excluded: bool
};

export type Operation = AddEntityInstOp | RemoveEntityInstOp;

export type AddEntityInstOp = {
  opa_id: Id,
  opa_e_id: Id,
  opa_ei_name: string
};

export type RemoveEntityInstOp = {
  opr_id: Id,
  opr_ei_id: Id
};

export const operationTypes = {
  add_entity_inst:    "Add entity instance",
  remove_entity_inst: "Remove entity instance",
  switch_phase:       "Switch phase"
};

export type OperationType = $Keys<typeof operationTypes>;

export type Model = Array<Scenario>;

export function validateModel(model: Model): ValidationResult {
  return validateElement(ajv, model, "scenario-meta#/model"); 
}

