// @flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const ufoaBoxId = "ufoa-box";
const ufobBoxId = "ufob-box";
const simulationBoxId = "simulation-box";
export const simUfobDiagramId = "simulation-diagram";
export const simInstDiagramId = "ufoa-inst-diagram";
const dialogUfoaId = "dialog-box-ufoa";
const dialogUfobId = "dialog-box-ufob";
const dialogSimId = "dialog-box-sim";
const messageId = "message-box";
const modalBoxId = "modal-box";
const modalId = "app-modal";

export const wmdaPanelId = "wmda-panel";
export const wmdaTitleId = "wmda-panel-label";
export const eventsLogId = "events-log";

export function getWindowHeight(): number {
  return $(window).innerHeight();
}

export function getWindowWidth(): number {
  return $(window).innerWidth();
}

export function fitPanes() {
  const ww = getWindowWidth();
  const wh = getWindowHeight();

  $(`#${ufoaBoxId}`).css("height", `${wh - 115}px`);
  $(`#${ufobBoxId}`).css("height", `${wh - 115}px`);
  $(`#${simUfobDiagramId}`).css("height", `${wh - 175}px`);
  $(`#${simInstDiagramId}`).css("height", `${wh - 220}px`);
  $("#ufoa-float-toolbar").css("left", `${ww - 400}px`);
  $("#ufob-float-toolbar").css("left", `${ww - 400}px`);

  // Height of dialog boxes
  [dialogUfoaId, dialogUfobId, dialogSimId].forEach(dialog => {
    const dbox = $(`#${dialog} > div`);
    const dboxh = wh - 150;
    dbox.css("height", `${dboxh}px`);
    dbox.css("overflow-y", "scroll");
  });
}

// Getting

export function getPanel(panelId: string): ?HTMLElement {
  return document.getElementById(panelId);
}

export function getDialogUfoa(): ?HTMLElement {
  return getPanel(dialogUfoaId);
}

export function getDialogUfob(): ?HTMLElement {
  return getPanel(dialogUfobId);
}

export function getDialogSim(): ?HTMLElement {
  return getPanel(dialogSimId);
}

export function getModal(): ?HTMLElement {
  disposeModalComp(modalBoxId);
  return getPanel(modalBoxId);
}

export function getUfoaBox(): ?HTMLElement {
  return getPanel(ufoaBoxId);
}

export function getUfobBox(): ?HTMLElement {
  return getPanel(ufobBoxId);
}

export function getSimulationBox(): ?HTMLElement {
  return getPanel(simulationBoxId);
}

export function getSimInstDiagram(): ?HTMLElement {
  return getPanel(simInstDiagramId);
}

export function getSimUfobDiagram(): ?HTMLElement {
  return getPanel(simUfobDiagramId);
}

export function getToolbarTop(): number {
  return $(`#${ufoaBoxId}`).offset().top;
}


// Showing

function showPanel(panelId: string): void {
  let panel = getPanel(panelId);
  //if (panel) {
    //$(panel).animate({
      //width: "toggle"
    //}, 100);
  //}
}

export function showDialogUfoa(): void {
  disposeDialogUfob();
  disposeDialogSim();
  showPanel(dialogUfoaId);
  fitPanes();
}

export function showDialogUfob(): void {
  disposeDialogUfoa();
  disposeDialogSim();
  showPanel(dialogUfobId);
  fitPanes();
}

export function showDialogSim(): void {
  disposeDialogUfoa();
  disposeDialogUfob();
  showPanel(dialogSimId);
  fitPanes();
}
export function showModal(): void {
  // $FlowFixMe
  $(`#${modalId}`).modal("show"); 
}

// Hiding

function disposePanel(panelId: string): void {
  let panel = getPanel(panelId);
  if (panel) {
    ReactDOM.unmountComponentAtNode(panel);
  }
}

function disposeModalComp(panelId: string): void {
  let panel = getPanel(panelId);
  if (panel) {
    ReactDOM.unmountComponentAtNode(panel);
  }
}

export function disposeDialogUfoa(): void {
  disposePanel(dialogUfoaId);
}

export function disposeDialogUfob(): void {
  disposePanel(dialogUfobId);
}

export function disposeDialogSim(): void {
  disposePanel(dialogSimId);
}

export function disposeModal(): void {
  // $FlowFixMe
  $(`#${modalId}`).modal("hide");
  disposeModalComp(modalBoxId);
}

// Messages

const closeButton = `
  <button type="button" class="close" aria-label="Close" onclick="$('#${messageId}').hide()"}>
    <span aria-hidden="true">&times;</span>
  </button>`;

export function displayMsg(msg: string, style: "alert-success"|"alert-danger", fade: boolean): void {
  const msgBox = $("#" + messageId);
  msgBox.html(msg + closeButton);
  msgBox.removeClass();
  msgBox.addClass("message-box alert");
  msgBox.addClass(style);
  if (fade) {
    msgBox.fadeIn().delay(3000).fadeOut();
  } else {
    msgBox.fadeIn();
  }
}

export function hideMsg(): void {
  $("#" + messageId).hide();
}

export function displayInfo(msg: string): void {
  displayMsg(msg, "alert-success", true);
}

export function displayError(msg: string): void {
  displayMsg(msg, "alert-danger", false);
}

// Component

export class PaneDialog<Props: {}, State: ?{} = null> extends React.Component<Props, State> {
  componentDidMount() {
    fitPanes();
  }
  componentDidUpdate() {
    fitPanes();
  }
}

