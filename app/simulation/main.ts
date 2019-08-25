import * as panel from "./view/panel";
import { cloneUfobVisModel } from "../ufob/view/diagram";

export function initialise(ufobVisModel: any) {
  panel.initialize(cloneUfobVisModel(ufobVisModel));
}
