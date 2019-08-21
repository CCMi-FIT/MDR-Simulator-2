import { UfoaModel } from "./metamodel";
import * as ufoaDiagram from "./view/diagram";
import * as dispatchA from "./view/dispatch";
import * as networkToolbar from "../networkToolbar/toolbar";
import * as panels from "../panels";
import * as ufoaDB from "./db";

export function initialise(ufoaModel: UfoaModel, ufoaEntityGraphics: any) {
  const container = panels.getUfoaBox();
  if (container) {
    const ufoaVisModel = ufoaDiagram.model2vis(ufoaModel, ufoaEntityGraphics);
    const ufoaNetwork  = ufoaDiagram.renderUfoa(container, ufoaVisModel);
    ufoaNetwork.on("click", (params) => dispatchA.handleClick(ufoaVisModel, params));
    networkToolbar.render("ufoa-float-toolbar", ufoaModel.entities, "e_name", "e_id", ufoaDB, ufoaNetwork);
  }
}
