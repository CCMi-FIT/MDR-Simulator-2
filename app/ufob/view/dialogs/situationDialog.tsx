import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Panel, renderConfirmPm } from "../../../components";
import { Situation, Disposition } from "../../metamodel";
import { Id } from "../../../metamodel";
import * as ufobMeta from "../../metamodel";
import * as ufobModel from "../../model";
import * as ufobDB from "../../db";
import { UfobVisModel, UfobVisEdge } from "../diagram";
import * as diagram from "../diagram";
import * as panels from "../../../panels";
import * as dispositionModal from "./dispositionModal";
import * as wmdaModal from "./wmdaModal";

interface Props {
  situation: Situation;
  ufobVisModel: UfobVisModel;
}

interface State {
  situation2: Situation;
  saveDisabled: boolean;
}

class SituationForm extends panels.PaneDialog<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      situation2: Object.assign({}, props.situation),
      saveDisabled: true
    };
    //console.dir(this.props);
    //console.dir(this.state);
  }

  private updateEdges() {
    const nodes = this.props.ufobVisModel.nodes;
    const edges = this.props.ufobVisModel.edges;
    const mn = nodes.get().find((node) => node.id === this.state.situation2.s_id);
    if (mn) {
      const sId = mn.id.toString();
      if (!sId) {
        console.error(new Error("Internal inconsistency in situationDialog/updateEdges"));
      } else {
        const edgesIds = edges.get({ filter: (edge) => edge.from === sId }).map((edge) => edge.id);
        edges.remove(edgesIds);
        this.state.situation2.s_dispositions.forEach((d) => {
          d.d_events_ids.forEach((evId) => {
            const newEdge = diagram.mkEdge(sId, evId, d.d_text);
            edges.add(newEdge);
          });
        });
      }
    }
  }

  private commitSituation(nodes: any, s: Situation) {
    ufobDB.updateSituation(s).then(
      () => {
        nodes.update({ id: s.s_id, label: s.s_name });
        this.updateEdges();
        panels.disposeDialogUfob();
        panels.displayInfo("Situation saved.");
      },
      (error) => panels.displayError("Situation save failed: " + error)
    );
  }

  private setAttr(attr: string, val: any) {
    this.setState((state: State, props: Props) => {
      const sOrig = props.situation;
      const stateNew = { ...state, situation2: { [attr]: val }};
      return {
	...state, 
	saveDisabled: _.isEqual(sOrig, stateNew.situation2)
      };
    });
  }

  private save() {
    const situationOriginal = this.props.situation;
    const situationNew = this.state.situation2;
    const nodes: any = this.props.ufobVisModel.nodes;
    if (!_.isEqual(situationOriginal, situationNew)) {
      this.commitSituation(nodes, situationNew);
    }
  }

  private delete() {
    const nodes: any = this.props.ufobVisModel.nodes;
    const edges: any = this.props.ufobVisModel.edges;
    const s_id = this.props.situation.s_id;
    ufobDB.deleteSituation(s_id).then(
      () => {
        nodes.remove({ id: s_id });
        const edges2remove = edges.get().filter((e: UfobVisEdge) => e.from === s_id || e.to === s_id);
        edges.remove(edges2remove.map((e: UfobVisEdge) => e.id));
        panels.disposeDialogUfob();
        panels.displayInfo("Situation deleted.");
      },
      (error) => panels.displayError("Situation delete failed: " + error));
  }

  private editWMDA() {
    const situation2 = this.state.situation2;
    wmdaModal.render(situation2.s_name, situation2.s_wmda_text).then(
      (wmdaText2) => this.setAttr("s_wmda_text", wmdaText2)
    );
  }

  private renderSituationName() {
    return (
      <div className="form-group">
        <textarea className="form-control" value={this.state.situation2.s_name} onChange={(e) => this.setAttr("s_name", e.currentTarget.value)} rows={3} cols={30}/>
      </div>
    );
  }

  private renderEvent(evId: Id) {
    const ev = ufobDB.getUfobEventById(evId);
    return (
      <div key={evId}>
        <i className="fas fa-arrow-right"/>
        <span>{ev ? ev.ev_name : ""}</span>
      </div>
    );
  }

  private editDisposition(d: Disposition) {
    dispositionModal.render(this.state.situation2, d).then(
      (dNew) => {
        if (!dNew) {
          const newS = ufobModel.deleteDisposition(this.state.situation2, d.d_text);
          this.setState({ situation2: newS, saveDisabled: false });
        } else {
          const newS = ufobModel.withUpdatedDisposition(this.state.situation2, d.d_text, dNew);
          this.setState({ situation2: newS, saveDisabled: false });
        }
      }
    );
  }

  private addDisposition() {
    dispositionModal.render(this.state.situation2, ufobMeta.emptyDisposition).then(
      (dNew) => {
        const newS = ufobModel.addDisposition(this.state.situation2, dNew);
        this.setState({ situation2: newS, saveDisabled: false });
      }
    );
  }

  private renderDispositionRow(d: Disposition) {
    return (
      <tr className="clickable-disposition" key={d.d_text} onClick={() => this.editDisposition(d)}>
        <td>
          {d.d_text ? d.d_text : "<Implicit>"}
          </td>
          <td>
            {d.d_events_ids.map(this.renderEvent)}
          </td>
        </tr>
    );
  }

  private renderDispositions() {
    return (
      <div className="form-group">
        <Panel heading="Dispositions" inner={true} >
          <table className="table table-striped">
            <tbody>
              {this.state.situation2.s_dispositions.map(this.renderDispositionRow)}
            </tbody>
          </table>
          <button type="button" className="btn btn-primary btn-sm" onClick={this.addDisposition}><i className="fas fa-plus"/></button>
        </Panel>
      </div>
    );
  }

  private renderWMDAButton() {
    return (
      <div className="form-group">
        <button type="button" className="btn col-sm-12 btn-primary" onClick={this.editWMDA}>Edit WMDA Standard</button>
      </div>
    );
  }

  private renderButtons() {
    return (
      <div className="form-group row col-sm-12">
        <div className="col-sm-6 text-center">
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update situation</button>
        </div>
        <div className="col-sm-6  text-center">
          {this.renderButtonDelete()}
        </div>
      </div>
    );
  }

  private renderButtonDelete() {
    return (
      <button type="button" className="btn btn-danger" onClick={() => {
        renderConfirmPm(
          "Deleting Situation",
          "delete",
          <span>Are you sure you want to delete &quot;{this.props.situation.s_name}&quot;?</span>
        ).then(() => this.delete());
      }}>Delete
      </button>
    );
  }

  public render() {
    return (
      <Panel heading={<span><strong>Situation {this.props.situation.s_id}</strong></span>}>
        {this.renderSituationName()}
        {this.renderDispositions()}
        {this.renderWMDAButton()}
        {this.renderButtons()}
      </Panel>
    );
  }
}

export function render(situation: Situation, ufobVisModel: UfobVisModel) {
  const panel = panels.getDialogUfob();
  if (panel) {
    ReactDOM.render(<SituationForm situation={situation} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialogUfob();
  }
}
