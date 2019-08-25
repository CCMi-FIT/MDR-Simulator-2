import { Id, ValidationResult, getLastIdNo, validationResultOK } from "../metamodel";
import { UfobEvent, Situation, Disposition, UfobModel, AddEntityInstOp } from "./metamodel";
import * as ufobMeta from "./metamodel";

// Event {{{1
export function getUfobEventById(model: UfobModel, evId: Id): UfobEvent | undefined {
  return model.events.find((ev) => ev.ev_id === evId);
}

export function newEvent(model: UfobModel, evName: string, sId: Id): UfobEvent {
  const lastIdNo = getLastIdNo(model.events.map((ev) => ev.ev_id));
  const res = ufobMeta.newEvent(`ev${lastIdNo + 1}`, "New Event", sId);
  res.ev_wmda_text = "";
  model.events.push(res);
  return res;
}

export function updateEvent(model: UfobModel, updatedEvent: UfobEvent): ValidationResult {
  const validity = ufobMeta.validateEvent(updatedEvent);
  if (validity.errors) {
    return validity;
  } else {
    const event = getUfobEventById(model, updatedEvent.ev_id);
    if (event) {
      Object.assign(event, updatedEvent); // mutated existing event in the model
    } else {
      model.events.push(updatedEvent); // added a new one to the model
    }
    return validationResultOK;
  }
}

export function deleteEvent(model: UfobModel, evId: Id): void {
  const events2 = model.events.filter((ev) => ev.ev_id !== evId);
  model.events = events2;
  model.situations.forEach((s) => {
    const newDs = s.s_dispositions.filter((d: Disposition) => !d.d_events_ids.includes(evId));
    s.s_dispositions = newDs;
  });
}

export function getInstsNames(model: UfobModel): string[] {
  return model.events.reduce(
    (acc1: string[], ev: UfobEvent) => {
      const instsNames: string[] = ev.ev_add_ops.reduce(
        (acc2: string[], op: AddEntityInstOp) => [...acc2, ...op.opa_insts_names],
        []
      );
      return [...acc1, ...instsNames];
    },
    []
  );
}

// Situation {{{1

export function getSituationById(model: UfobModel, sId: Id): Situation | undefined {
  return model.situations.find((s) => s.s_id === sId);
}

export function newSituation(model: UfobModel): Situation {
  const lastIdNo = getLastIdNo(model.situations.map((s) => s.s_id));
  const res = {
    s_id: `s${lastIdNo + 1}`,
    s_name: "New Situation",
    s_dispositions: [],
    s_wmda_text: ""
  };
  model.situations.push(res);
  return res;
}

export function updateSituation(model: UfobModel, updatedSituation: Situation): ValidationResult {
  const validity = ufobMeta.validateSituation(updatedSituation);
  if (validity.errors) {
    return validity;
  } else {
    const situation = getSituationById(model, updatedSituation.s_id);
    if (situation) {
      Object.assign(situation, updatedSituation); // mutated existing situation in the model
    } else {
      model.situations.push(updatedSituation); // added a new one to the model
    }
    return validationResultOK;
  }
}

export function addDisposition(situation: Situation, newD: Disposition): Situation {
  const newDs: Disposition[] = [...situation.s_dispositions, newD];
  return { ...situation, s_dispositions: newDs };
}

export function withUpdatedDisposition(situation: Situation, dText: string, newD: Disposition): Situation  {
  const oldD: Disposition | undefined = situation.s_dispositions.find((d) => d.d_text === dText);
  if (oldD) {
    const newDs: Disposition[] = [...situation.s_dispositions.filter((d) => d.d_text !== dText), newD];
    return { ...situation, s_dispositions: newDs };
  } else {
    return situation;
  }
}

export function deleteDisposition(situation: Situation, dText: string): Situation {
  const newDs = situation.s_dispositions.filter((d) => d.d_text !== dText);
  return { ...situation, s_dispositions: newDs };
}

export function deleteSituation(model: UfobModel, sId: Id): void {
  const i = model.situations.findIndex((s) => s.s_id === sId);
  model.situations.splice(i, 1);
}

// Hooks {{{1
export function entityDeletionHook(model: UfobModel, eId: Id): UfobModel {
  // Remove those Operations that relate to the entity
  const events = model.events.map(
    (ev) => {
      const addOps2 = ev.ev_add_ops.filter((op) => op.opa_e_id !== eId);
      const removeOps2 = ev.ev_remove_ops.filter((op) => op.opr_e_id !== eId);
      return { ...ev, ev_add_ops: addOps2, ev_remove_ops: removeOps2 };
    }
  );
  return { ...model, events };
}
