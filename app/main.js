// @flow

import * as ra from "./view/ufoa/canvas/rendering";
import * as rb from "./view/ufob/canvas/rendering";
import * as dispatch from "./view/dispatch";
import * as panels from "./view/panels";
import * as networkToolbar from './view/networkToolbar/toolbar';
import * as ufoaDB from "./db/ufoa";
import * as ufobDB from "./db/ufob";

$(window).resize(function() {
  panels.fitPanes();
});

$(document).ready(function() {
  panels.fitPanes();
  Promise.all([
    ufoaDB.loadModel(),
    ufoaDB.loadGraphics(),
    ufobDB.loadModel(),
    ufobDB.loadGraphics()]).then(([ufoaModel, ufoaEntityGraphics, ufobModel, ufobGraphics]) => {
      let error = ufoaModel.error || ufoaEntityGraphics.error || ufobModel.error || ufobGraphics.error;
      if (error) {
        panels.displayError(error);
      } else {
        panels.hideMsg();
        let ufoaVisModel = ra.model2vis(ufoaModel, ufoaEntityGraphics);
        let ufoaNetwork  = ra.renderUfoa(ufoaVisModel);
        let ufobVisModel = rb.model2vis(ufobModel, ufobGraphics);
        let ufobNetwork  = rb.renderUfob(ufobVisModel);
        ufoaNetwork.on("click", params => dispatch.handleClick(ufoaVisModel, params));
        networkToolbar.render("ufoa-float-toolbar", ufoaModel.entities, "e_name", "e_id", ufoaDB, ufoaNetwork);
        networkToolbar.render("ufob-float-toolbar", ufobModel.events, "ev_name" , "ev_id", ufobDB, ufobNetwork);
      }
    }, (error) => panels.displayError("Error loading model: " + error));
});

