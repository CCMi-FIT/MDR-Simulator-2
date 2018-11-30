// @flow

import * as R from 'ramda';
import type { Id, EventB, Situation, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from "../metamodel/ufob";

// Event

export function getEventById(model: UfobModel, ev_id: Id): ?EventB {
  return model.events.find(ev => ev.ev_id === ev_id);
}

export function updateEvent(model: UfobModel, updatedEvent: EventB): ValidationResult {
  const validity = ufobMeta.validateEvent(updatedEvent);
  if (validity.errors) {
    return validity;
  } else { 
    let event = getEventById(model, updatedEvent.ev_id);
    if (event) {
      Object.assign(event, updatedEvent); // mutated existing event in the model
    } else {
      model.events.push(updatedEvent); // added a new one to the model
    }
    return ufobMeta.validationResultOK;
  }
}

export function deleteEvent(model: UfobModel, ev_id: Id): void {
  let i = model.events.findIndex(ev => ev.ev_id === ev_id);
  model.events.splice(i, 1);
}

// Situation

export function getSituationById(model: UfobModel, s_id: Id): ?Situation {
  return model.situations.find(s => s.s_id === s_id);
}

export function updateSituation(model: UfobModel, updatedSituation: Situation): ValidationResult {
  const validity = ufobMeta.validateSituation(updatedSituation);
  if (validity.errors) {
    return validity;
  } else { 
    let situation = getSituationById(model, updatedSituation.s_id);
    if (situation) {
      Object.assign(situation, updatedSituation); // mutated existing situation in the model
    } else {
      model.situations.push(updatedSituation); // added a new one to the model
    }
    return ufobMeta.validationResultOK;
  }
}

export function deleteSituation(model: UfobModel, s_id: Id): void {
  let i = model.situations.findIndex(s => s.s_id === s_id);
  model.situations.splice(i, 1);
}
