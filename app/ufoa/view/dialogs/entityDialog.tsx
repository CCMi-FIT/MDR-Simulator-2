// Imports {{{1
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Panel, renderConfirmPm } from "../../../components";
import { UfoaEntity, Association, Connection } from "../../metamodel";
import * as ufoaMeta from "../../metamodel";
import * as ufoaDB from "../../db";
import { UfoaVisModel } from "../../../diagram";
import * as diagram from "../../../diagram";
import * as panels from "../../../panels";
import * as associationDialog from "./associationDialog";

// Props & State {{{1
interface Props {
  ufoaEntity: UfoaEntity;
  ufoaVisModel: UfoaVisModel;
}

interface State {
  ufoaEntity2: UfoaEntity;
  saveDisabled: boolean;
}

// }}}1

function commitEntity(nodes: any, e: UfoaEntity) {
  ufoaDB.updateEntity(e).then(
    () => {
      nodes.update({ id: e.e_id, label: ufoaMeta.entityStr(e), color: ufoaMeta.entityColor(e) });
      panels.disposeDialogUfoa();
      panels.displayInfo("Entity saved.");
    },
    (error) => panels.displayError("Entity save failed: " + error)
  );
}

// Component {{{1
class UfoaVisNodeForm extends panels.PaneDialog<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      ufoaEntity2: _.clone(props.ufoaEntity),
      saveDisabled: true
    };
  }
  // Operations {{{1
  private setAttr(attr: string, val: any) {
    const ufoaEntityOriginal = this.props.ufoaEntity;
    this.setState((state) => {
      const ufoaEntityNew = state.ufoaEntity2;
      ufoaEntityNew[attr] = val;
      return {
        ufoaEntity2: ufoaEntityNew,
        saveDisabled: _.isEqual(ufoaEntityOriginal, ufoaEntityNew)
      };
    });
  }

  private save() {
    const ufoaEntityOriginal = this.props.ufoaEntity;
    const ufoaEntityNew = this.state.ufoaEntity2;
    const nodes: any = this.props.ufoaVisModel.nodes;
    if (!_.isEqual(ufoaEntityOriginal, ufoaEntityNew)) {
      commitEntity(nodes, ufoaEntityNew);
    }
  }

  private delete() {
    const nodes: any = this.props.ufoaVisModel.nodes;
    const edges: any = this.props.ufoaVisModel.edges;
    const e_id = this.props.ufoaEntity.e_id;
    ufoaDB.deleteEntity(e_id).then(
      () => {
        nodes.remove({ id: e_id });
        const edges2remove = edges.get().filter((e) => e.from === e_id || e.to === e_id);
        edges.remove(edges2remove.map((e) => e.id));
        panels.disposeDialogUfoa();
        panels.displayInfo("Entity deleted.");
      },
      (error) => panels.displayError("Entity delete failed: " + error));
  }

  // Rendering {{{1
  private renderEntityType() {
    return (
      <div className="form-group">
        <select className="form-control" value={this.state.ufoaEntity2.e_type} onChange={(e) => this.setAttr("e_type", e.currentTarget.value)}>
          {ufoaMeta.entityTypes.map((et) => <option key={et}>{et}</option>)}
        </select>
      </div>
    );
  }

  private renderEntityName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.ufoaEntity2.e_name} onChange={(e) => this.setAttr("e_name", e.currentTarget.value)} rows="5" cols="30"/>
      </div>
    );
  }

  // AssocPane {{{2
  private renderConnection(a: Association, c: Connection, align: string) {
    const prefix =
      _.isEqual(a.a_connection1, c) ?
        a.a_type === "MemberOf" ?
          !a.a_connection1.mult.upper || a.a_connection1.mult.upper > 1 ? "\u2662" : "\u2666"
        : ""
      : "";
    return (
      <div style={{float: align}}>
        <span style={{fontSize: "22px"}}>{align === "left" ? prefix : ""}</span>
        {c.mult.lower}..{c.mult.upper ? c.mult.upper : "*"}
        <span style={{fontSize: "22px"}}>{align === "right" ? prefix : ""}</span>
      </div>
    );
  }

  private renderAssocDetails(a: Association, c1: Connection, c2: Connection) {
    return (
      <div className="container-fluid">
        <div className="row" style={{textAlign: "center", display: "block"}}>
          {ufoaMeta.assocTypeStr(a.a_type)}
        </div>
        <div className="row" style={{textAlign: "center", display: "block"}}>
          {a.a_label}
        </div>
        <div className="row" style={{borderTop: "1px solid gray", display: "block"}}/>
        <div className="row" style={{display: "block"}}>
          <div className="container-fluid">
            <div className="row" style={{display: "block"}}>
              {this.renderConnection(a, c1, "left")}
              {this.renderConnection(a, c2, "right")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderAssoc(assoc: Association) {
    const e = this.props.ufoaEntity;
    let e1 = ufoaDB.getEntity1OfAssoc(assoc);
    let c1 = assoc.a_connection1;
    let e2 = ufoaDB.getEntity2OfAssoc(assoc);
    let c2 = assoc.a_connection2;
    if (e1 && e2) {
      console.assert(_.isEqual(e, e1) || _.isEqual(e, e2));
      if (e1.e_id !== e.e_id) {
        [e1, e2] = [e2, e1];
        [c1, c2] = [c2, c1];
      }
      return (
        <div
        key={assoc.a_id}
        className="d-flex flex-row clickable-assoc"
        style={{marginBottom: "10px", padding: "5px"}}
        onClick={() => associationDialog.render(assoc, this.props.ufoaVisModel)}>
          <div>
            {e1 ? diagram.renderEntity(e1) : ""}
          </div>
          <div>
            {this.renderAssocDetails(assoc, c1, c2)}
          </div>
          <div>
            {e2 ? diagram.renderEntity(e2) : ""}
          </div>
        </div>
      );
    }
  }

  private renderAssocPane() {
    return (
      <Panel heading="Associations" inner={true}>
        {ufoaDB.getAssocsOfEntity(this.props.ufoaEntity).map(this.renderAssoc)}
      </Panel>
    );
  }
  // }}}2

  // Buttons rendering {{{2
  private renderButtons() {
    return (
      <div className="form-group row col-sm-12" style={{paddingTop: "15px"}}>
        <div className="col-sm-6 text-center">
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update entity</button>
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
          "Deleting Entity",
          "delete",
          <span>Are you sure you want to delete &quot;{ufoaMeta.entityNameLine(this.props.ufoaEntity)}&quot;?</span>
        ).then(() => this.delete());
      }}>Delete
      </button>
    );
  }

  // }}}2

  public render() {
    return (
      <Panel heading={<span>{this.props.ufoaEntity.e_name} ({this.props.ufoaEntity.e_id})</span>}>
        {this.renderEntityType()}
        {this.renderEntityName()}
        {this.renderAssocPane()}
        {this.renderButtons()}
      </Panel>
    );
  }

}
//}}}1

export function render(ufoaEntity: UfoaEntity, ufoaVisModel: UfoaVisModel) {
  const panel = panels.getDialogUfoa();
  if (panel) {
    ReactDOM.render(<UfoaVisNodeForm ufoaEntity={ufoaEntity} ufoaVisModel={ufoaVisModel}/>, panel);
    panels.showDialogUfoa();
  }
}
