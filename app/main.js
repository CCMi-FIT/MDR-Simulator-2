// @flow

import * as r from "./view/ufoa/canvas/rendering";
import * as dispatch from "./view/dispatch";
import * as panels from "./view/panels";
import * as ufoaSaveLayout from './view/ufoa/saveLayoutButton';
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
