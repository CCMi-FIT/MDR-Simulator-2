import $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

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
  return $(window).innerHeight() || 0;
}

export function getWindowWidth(): number {
  return $(window).innerWidth() || 0;
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
  [dialogUfoaId, dialogUfobId, dialogSimId].forEach(
    (dialog) => {
      const dbox = $(`#${dialog} > div`);
      const dboxh = wh - 150;
      dbox.css("height", `${dboxh}px`);
      dbox.css("overflow-y", "scroll");
    }
  );
}

export function getPanel(panelId: string): HTMLElement | null {
  const dom = document.getElementById(panelId);
  if (dom) {
    return dom;
  } else {
    console.error(`Panel id=${panelId} does not exist in DOM`);
    return null;
  }
}

function disposePanel(panelId: string): void {
  const panel = getPanel(panelId);
  if (panel) {
    ReactDOM.unmountComponentAtNode(panel);
  }
}

export function getCleanPanel(panelId: string): HTMLElement | null {
  disposePanel(panelId);
  return getPanel(panelId);
}

export function getDialogUfoa(): HTMLElement | null {
  return getCleanPanel(dialogUfoaId);
}

export function getDialogUfob(): HTMLElement | null {
  return getCleanPanel(dialogUfobId);
}

export function getDialogSim(): HTMLElement | null {
  return getCleanPanel(dialogSimId);
}

export function getModal(): HTMLElement | null {
  return getCleanPanel(modalBoxId);
}

export function getUfoaBox(): HTMLElement | null {
  return getCleanPanel(ufoaBoxId);
}

export function getUfobBox(): HTMLElement | null {
  return getCleanPanel(ufobBoxId);
}

export function getSimulationBox(): HTMLElement | null {
  return getCleanPanel(simulationBoxId);
}

export function getSimInstDiagram(): HTMLElement | null {
  return getCleanPanel(simInstDiagramId);
}

export function getSimUfobDiagram(): HTMLElement | null {
  return getCleanPanel(simUfobDiagramId);
}

export function getToolbarTop(): number {
  const offset = $(`#${ufoaBoxId}`).offset()
  return offset ? offset.top : 0;
}

// Showing
function showPanel(panelId: string): void {
  const panel = getPanel(panelId);
  if (panel) {
    $(panel).show();
  }
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

// Hiding

export function disposeDialogUfoa(): void {
  disposePanel(dialogUfoaId);
}

export function disposeDialogUfob(): void {
  disposePanel(dialogUfobId);
}

export function disposeDialogSim(): void {
  disposePanel(dialogSimId);
}

// Messages

const closeButton = `
  <button type="button" class="close" aria-label="Close" onclick="$('#${messageId}').hide()"}>
    <span aria-hidden="true">&times;</span>
  </button>`;

export function displayMsg(msg: string, style: "alert-success" | "alert-danger", fade: boolean): void {
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

// Components
export class PaneDialog<Props, State> extends React.Component<Props, State> {
  public componentDidMount = () => {
    fitPanes();
  }
  public componentDidUpdate = () => {
    fitPanes();
  }
}
