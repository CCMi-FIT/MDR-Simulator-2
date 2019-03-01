// @flow

import type { Mult } from '../ufoa/metamodel';
import * as ufoaDB from '../ufoa/db';
import type { EntityInst, GeneralisationInst, AssocInst } from "../ufoa-inst/metamodel";
import { eiId } from "../ufoa-inst/metamodel";
import * as ufoaInstModel from '../ufoa-inst/model';

// Entity instances {{{1

//export function checkEntityInstance(insts: Array<EntityInst>, ei: EntityInst): Array<string> {
  //return [noMissingSupertype(insts, ei)];
//}

//function noMissingSupertype(insts: Array<EntityInst>, ei: EntityInst): string {
  //const sub = ei.ei_e_id;
  //return insts.reduce(
    //(res, ei1) => {
      //ufoaDB.getGeneralisations().reduce(
        //(res, g) => {
          //if (g


// Generalisation instances {{{1

export function checkGIrules(insts: Array<EntityInst>, gInsts: Array<GeneralisationInst>, gi: GeneralisationInst): boolean {
  return giDoesNotExist(gInsts, gi) && gSingleInstanceSupertype(insts, gInsts, gi);
}

function giDoesNotExist(gInsts: Array<GeneralisationInst>, gi: GeneralisationInst): boolean {
  return !gInsts.find(gi1 => gi1.gi_id === gi.gi_id);
}

function gSingleInstanceSupertype(insts: Array<EntityInst>, gInsts: Array<GeneralisationInst>, gi: GeneralisationInst): boolean {
  const supi = ufoaInstModel.getSupEntityInst(insts, gi);
  const subi = ufoaInstModel.getSubEntityInst(insts, gi);
  const supId = supi.ei_e_id;
  const res = !gInsts.find(
    gi1 => {
      const supi1 = ufoaInstModel.getSupEntityInst(insts, gi1);
      const subi1 = ufoaInstModel.getSubEntityInst(insts, gi1);
      if (eiId(subi) !== eiId(subi1)) { // Subtypes are different instances, cannot be the case
        return false;
      } else {
        const supId1 = supi1.ei_e_id;
        const res = (supId === supId1); 
        //if (res) {
          //console.log(`${gi1.gi_id} has the same entity as supertype`);
        //} 
        return res;
      }
    }
  );
  return res;
}

// Association Instances {{{1

export function checkAIrules(insts: Array<EntityInst>, aInsts: Array<AssocInst>, ai: AssocInst): boolean {
  return aiDoesNotExist(aInsts, ai) && aiFollowsMultiplicity(insts, aInsts, ai);
}

function aiDoesNotExist(aInsts: Array<AssocInst>, ai: AssocInst): boolean {
  return !aInsts.find(ai1 => ai1.ai_id === ai.ai_id);
}

function aiFollowsMultiplicity(insts: Array<EntityInst>, aInsts: Array<AssocInst>, ai: AssocInst): boolean {
  console.log("Analysing " + ai.ai_id);
  const a = ufoaInstModel.getAssocOfInst(ai, ufoaDB);
  const n1Set = insts.filter(inst => aInsts.find(ai1 => ufoaInstModel.getE1EntityInst(insts, ai1).ei_e_id === inst.ei_e_id));
  console.log(n1Set);
  const n2Set = insts.filter(inst => aInsts.find(ai1 => ufoaInstModel.getE2EntityInst(insts, ai1).ei_e_id === inst.ei_e_id));
  console.log(n2Set);
  const n1 = n1Set.length;
  const n2 = n2Set.length;
  return multUpperOk(n1, a.a_connection1.mult) && multUpperOk(n2, a.a_connection2.mult);
}

function multUpperOk(n: number, mult: Mult): boolean {
  const res = mult.upper ? n <= mult.upper : true;
  console.log(`${n} vs ${String(mult.upper)}: ${String(res)}`);
  return res;
}
