// @flow

import * as r from "./view/rendering";
import * as dispatch from "./gui/dispatch";
import * as panels from "./gui/panels";
import * as ufoaSaveLayout from './gui/ufoa/saveLayoutButton';
import * as ufoaDB from "./db/ufoa";

$(window).resize(function() {
  panels.fitPanes();
});

$(document).ready(function() {
  panels.fitPanes();
  ufoaDB.loadModel().then(
    (ufoaModel) => {
      if (ufoaModel.error) {
        panels.displayError(ufoaModel.error);
      } else {
        panels.hideMsg();
        let ufoaVisModel  = r.model2vis(ufoaModel);
        let network       = r.renderUfoa(ufoaVisModel);
        ufoaSaveLayout.render(network);
        network.on("click", params => dispatch.handleClick(ufoaVisModel, params));
      }
    }, (error) => panels.displayError("Error loading UFO-A model: " + error));
});
