// @flow

import * as R from 'ramda';
import type { Id, Name, Label, ValidationResult } from '../metamodel/general';
import * as meta from '../metamodel/general';
import type { EventB, Situation, Disposition, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from "../metamodel/ufob";
import { getLastIdNo } from './general.js';

// Event

export function getEventById(model: UfobModel, ev_id: Id): ?EventB {
  return model.events.find(ev => ev.ev_id === ev_id);
}

export function newEvent(model: UfobModel, ev_name: string, s_id: Id): EventB {
  const lastIdNo = getLastIdNo(model.events.map((ev) => ev.ev_id));
  const newEvent = {
    ev_id: `ev${lastIdNo+1}`,
    ev_name,
    ev_to_situation_id: s_id
  };
  model.events.push(newEvent);
  return newEvent;
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
    return meta.validationResultOK;
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

export function newSituation(model: UfobModel): Situation {
  const lastIdNo = getLastIdNo(model.situations.map((s) => s.s_id));
  const newSituation = {
    s_id: `s${lastIdNo+1}`,
    s_name: "New Situation",
    s_dispositions: []
  };
  model.situations.push(newSituation);
  return newSituation;
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
    return meta.validationResultOK;
  }
}

export function addDisposition(situation: Situation, newD: Disposition): Situation {
  const newDs = R.append(newD, situation.s_dispositions);
  return R.mergeDeepRight(situation, { s_dispositions: newDs });
}

export function withUpdatedDisposition(situation: Situation, dText: string, newD: Disposition): Situation  {
  const oldD = situation.s_dispositions.find((d) => d.d_text === dText);
  if (oldD) {
    let newDs = R.append(newD, situation.s_dispositions.filter((d) => d.d_text !== dText));
    return R.mergeDeepRight(situation, { s_dispositions: newDs });
  } else {
    return situation;
  }
}

export function deleteDisposition(situation: Situation, dText: string): Situation {
  const newDs = situation.s_dispositions.filter(d => d.d_text !== dText);
  return R.mergeDeepRight(situation, { s_dispositions: newDs });
}

export function deleteSituation(model: UfobModel, s_id: Id): void {
  let i = model.situations.findIndex(s => s.s_id === s_id);
  model.situations.splice(i, 1);
}
