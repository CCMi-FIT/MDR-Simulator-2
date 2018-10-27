// @flow

import * as r from "./rendering";
import * as ui from "./gui/common";
import * as panels from "./gui/panels";
import * as ufoaDB from "./db/ufoa";

$(window).resize(function() {
  ui.fitPanes();
});

$(document).ready(function() {
  ui.fitPanes();
  panels.displayInfo("Loading UFO-A model...");
  ufoaDB.loadModel().then(
    (ufoaModel) => {
      if (ufoaModel.error) {
        panels.displayError(ufoaModel.error);
      } else {
        panels.hideMsg();
        let ufoaVisModel  = r.model2vis(ufoaModel);
        let network       = r.renderUfoa(ufoaVisModel);
        network.on("click", params => ui.handleClick(ufoaVisModel, params));
      }
    }, (error) => panels.displayError("Error loading UFO-A model: " + error));
});
