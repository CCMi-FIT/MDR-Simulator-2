// @flow

import * as ufoaDB from '../ufoa/db';
import type { EntityInst, GeneralisationInst } from "../ufoa-inst/metamodel";
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
  const res = !gInsts.find(gi1 => gi1.gi_id === gi.gi_id);
  //if (!res) {
    //console.log(`giDoesNotExist failed: ${gi.gi_id} already present`);
  //}
  return res;
}

function gSingleInstanceSupertype(insts: Array<EntityInst>, gInsts: Array<GeneralisationInst>, gi: GeneralisationInst): boolean {
  const supi = ufoaInstModel.getSupEntityInst(insts, gi);
  const subi = ufoaInstModel.getSubEntityInst(insts, gi);
  if (!supi) {
    console.error(`Model consistency error: gInst ${gi.gi_g_id} has supertype entity instance ${gi.gi_sup_ei_id} that is missing`);
    return false;
  } else {
    const supId = supi.ei_e_id;
    const res = !gInsts.find(
      gi1 => {
        const supi1 = ufoaInstModel.getSupEntityInst(insts, gi1);
        const subi1 = ufoaInstModel.getSubEntityInst(insts, gi1);
        if (!supi1 || !subi1) {
          console.error(`Model consistency error: gInst ${gi1.gi_g_id} references missing entity instance(s) ${supi1 ? '' : gi1.gi_sup_ei_id} ${subi1 ? '' : gi1.gi_sub_ei_id}`);
          return false;
        } else {
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
      }
    );
    //if (!res) {
      //console.log("failed");
    //}
    return res;
  }
}
