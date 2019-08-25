// Imports {{{1
import { Id, ValidationResult, validateElement } from "../metamodel";
import { ufobSchema } from "./schema";
import Ajv from "ajv";

// Schema {{{1
const ajv = new Ajv();
ajv.addSchema(ufobSchema);

// Situation {{{1
export interface Disposition {
  d_text: string;
  d_events_ids: Id[];
}

export const emptyDisposition = { d_text: "", d_events_ids: [] };

export interface Situation {
  s_id: Id;
  s_name: string;
  s_dispositions: Disposition[];
  s_wmda_text: string;
}

export function validateSituation(situation: Situation): ValidationResult {
  return validateElement(ajv, situation, "ufob-meta#/definitions/situation");
}

// Event {{{1
export interface UfobEvent {
  ev_id: Id;
  ev_name: string;
  ev_to_situation_id: Id;
  ev_add_ops: AddEntityInstOp[];
  ev_remove_ops: RemoveEntityInstOp[];
  ev_wmda_text: string;
}

export function newEvent(evId: Id, evName: string, evToSituationId: Id): UfobEvent {
  return ({
    ev_id: evId,
    ev_name: evName,
    ev_to_situation_id: evToSituationId,
    ev_add_ops: [],
    ev_remove_ops: [],
    ev_wmda_text: ""
  });
}

export function validateEvent(event: UfobEvent): ValidationResult {
  return validateElement(ajv, event, "ufob-meta#/definitions/event");
}

export interface AddEntityInstOp {
  opa_e_id: Id;
  opa_insts_names: string[];
}

export function newAddEntityInstOp(opaEId: Id): AddEntityInstOp {
  return ({
    opa_e_id: opaEId,
    opa_insts_names: []
  });
}

export interface RemoveEntityInstOp {
  opr_e_id: Id;
}

export function newRemoveEntityInstOp(oprEId: Id): RemoveEntityInstOp {
  return ({
    opr_e_id: oprEId
  });
}

export const operationTypes = {
  add_entity_inst:    "Add entity instance",
  remove_entity_inst: "Remove entity instance",
  switch_phase:       "Switch phase"
};

// Model {{{1
export interface UfobModel {
  events: UfobEvent[];
  situations: Situation[];
}

export const emptyModel = { events: [], situations: [] };

export function validateModel(model: UfobModel): ValidationResult {
  return validateElement(ajv, model, "ufob-meta#/model");
}
