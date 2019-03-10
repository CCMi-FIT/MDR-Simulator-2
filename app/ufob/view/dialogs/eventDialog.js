//@flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { UfoaEntity } from '../../../ufoa/metamodel';
import type { UfobEvent, AddEntityInstOp, RemoveEntityInstOp } from '../../metamodel';
import * as ufobMeta from '../../metamodel';
import * as ufoaDB from '../../../ufoa/db';
import * as ufobDB from '../../db';
import type { VisModel } from '../../../diagram';
import * as diagram from '../../../diagram';
import * as ufobDiagram from '../diagram';
import * as panels from '../../../panels';
import * as wmdaModal from './wmdaModal';

// Props & State {{{1

type InstsNamesStrDict = {
  [key: string]: string
};

type Props = {
  eventB: UfobEvent,
  ufobVisModel: VisModel
};

type State = {
  eventB2: UfobEvent,
  newOpEntity: ?UfoaEntity,
  instsNamesStrDict: InstsNamesStrDict,
  saveDisabled: boolean
};

// Helper Routines {{{1
function arr2str(arr: Array<string>): string {
  return arr.join(" ");
}

function str2arr(str: string): Array<string> {
  return str.split(" ");
}

function mkInstsNamesStrDict(addOps: Array<AddEntityInstOp>): any {
  return addOps.reduce(
    (dict, addOp) => R.assoc(addOp.opa_e_id, arr2str(addOp.opa_insts_names), dict),
    ({}: any)
  );
}

// Component {{{1
class EventForm extends panels.PaneDialog<Props, State> {

  newOpTypeahead: any = null;
  
  constructor(props) {
    super(props);
    this.state = {
      eventB2: R.clone(props.eventB),
      newOpEntity: null,
      instsNamesStrDict: mkInstsNamesStrDict(props.eventB.ev_add_ops), 
      saveDisabled: true
    };
    console.log(this.state);
  }

  // Actions {{{1

  setAttr = (attr: string, val: any) => {
    this.setState((state: State, props: Props) => {
      let evOrig = props.eventB;
      let stateNew =
        attr === "ev_add_ops.add" ?
          R.mergeDeepRight(state, { eventB2: {
            ev_add_ops: R.append(ufobMeta.newAddEntityInstOp(val), state.eventB2.ev_add_ops)
          }})
        : attr === "ev_add_ops.update" ?
          R.mergeDeepRight(state, { eventB2: {
            ev_add_ops: R.append(val, state.eventB2.ev_add_ops.filter(op => op.opa_e_id !== val.opa_e_id))
          }})
        : attr === "ev_add_ops.delete" ?
          R.mergeDeepRight(state, { eventB2: {
            ev_add_ops: state.eventB2.ev_add_ops.filter(op => op.opa_e_id !== val.opa_e_id)
          }})
        : attr === "ev_remove_ops.add" ?
          R.mergeDeepRight(state, { eventB2: {
            ev_remove_ops: R.append(ufobMeta.newRemoveEntityInstOp(val), state.eventB2.ev_remove_ops)
          }})
        : attr === "ev_remove_ops.delete" ?
          R.mergeDeepRight(state, { eventB2: {
            ev_remove_ops: state.eventB2.ev_remove_ops.filter(op => op.opr_e_id !== val.opr_e_id)
          }})
        : R.mergeDeepRight(state, { eventB2: { [attr]: val }});
      const res = R.mergeDeepRight(stateNew, { saveDisabled: R.equals(evOrig, stateNew.eventB2) });
      //console.log(res);
      return res;
    });
  }

  commit = () => {
    const ev = this.state.eventB2;
    const nodes = this.props.ufobVisModel.nodes;
    const edges = this.props.ufobVisModel.edges;
    ufobDB.updateEvent(ev).then(() => {
      nodes.update({ id: ev.ev_id, label: ev.ev_name });
      const edgesIds = edges.get().filter(e => e.from === ev.ev_id).map(e => e.id); //Effectively, there should be just one edge
      edges.remove(edgesIds);
      edges.add(ufobDiagram.mkEdge(ev.ev_id, ev.ev_to_situation_id));
      panels.disposeDialog();
      panels.displayInfo("Event saved.");
    }, (error) => panels.displayError("Event save failed: " + error));
  }
  
  save = () => {
    let eventBOriginal = this.props.eventB;
    let eventBNew = this.state.eventB2;
    if (!R.equals(eventBOriginal, eventBNew)) {
      this.commit();
    }
  };

  delete = () => {
    const nodes: any = this.props.ufobVisModel.nodes;
    const edges: any = this.props.ufobVisModel.edges;
    const ev_id = this.props.eventB.ev_id;
    ufobDB.deleteEvent(ev_id).then(
      () => {
        nodes.remove({ id: ev_id });
        const edges2remove = edges.get().filter(e => e.from === ev_id || e.to === ev_id);
        edges.remove(edges2remove.map(e => e.id));
        panels.disposeDialog();
        panels.displayInfo("Event deleted.");
      },
      error => panels.displayError("Event delete failed: " + error));
  }

  editWMDA = () => {
    const eventB2 = this.state.eventB2;
    wmdaModal.render(eventB2.ev_name, eventB2.ev_wmda_text).then(
      wmdaText2 => this.setAttr("ev_wmda_text", wmdaText2)
    );
  }

  updateInstsNamesFromStr = (op: AddEntityInstOp, str: string) => {
    // TODO
  };

  // Operations actions {{{2
  
  changeAsk = (op: AddEntityInstOp, ask: boolean) => {
    const newOp = 
      ask ?
          R.dissoc("opa_insts_names", R.mergeDeepRight(op, { opa_inst_name_ask: true }))
        : R.mergeDeepRight(op, { opa_inst_name_ask: false, opa_insts_names: [] });
      this.setAttr("ev_add_ops.update", newOp);
  }

  // Rendering {{{1

  renderEventName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.eventB2.ev_name} onChange={ev => this.setAttr("ev_name", ev.currentTarget.value)} rows="3" cols="30"/>
      </div>);
  }

  // Operations Rendering {{{2
  // AddOperation {{{3
  
  renderAskInstNames = (op: AddEntityInstOp) => {
    return (
        <div className="checkbox">
          <label>
            <input 
              type="checkbox"
              checked={op.opa_inst_name_ask}
              onChange={ev => this.changeAsk(op, ev.currentTarget.checked)}
            />Ask name</label>
        </div>
    );
  }

  renderAddOpDelete = (op: AddEntityInstOp) => {
    return (
      <Button className="btn-danger btn-sm" onClick={() => this.setAttr("ev_add_ops.delete", op)}>
        <i className="glyphicon glyphicon-trash"/>
      </Button>
    );
  }

  renderInstsNamesInput = (op: AddEntityInstOp) => {
    const instsTip = <Tooltip id="tooltip">Instance names separated by space</Tooltip>;
    return (
      <div className="col-xs-offset-1 col-xs-10">
        <OverlayTrigger placement="right" overlay={instsTip}>
          <input 
            className="form-control"
            value={this.state.instsNamesStrDict[op.opa_e_id]}
            onChange={ev => this.updateInstsNamesFromStr(op, ev.currentTarget.value)}
          />
        </OverlayTrigger>
      </div>
    );
  }

  renderAddOperation = (op: AddEntityInstOp) => {
    const entity = ufoaDB.getEntity(op.opa_e_id);
    return (
      <div key={op.opa_e_id}>
        <div className="row" style={{marginBottom: "5px"}}>
          <div className="col-xs-1 nopadding" style={{paddingTop: "10px"}}>
            <i className="glyphicon glyphicon-plus text-success" style={{fontSize: "20px"}}/>
          </div>
          <div className="col-xs-6 nopadding">
            {diagram.renderEntity(entity)}
          </div>
          <div className="col-xs-4" style={{paddingTop: "10px"}}>
            {this.renderAskInstNames(op)}
          </div>
          <div className="col-xs-1 nopadding" style={{paddingTop: "10px"}}>
            {this.renderAddOpDelete(op)}
          </div>
        </div>
        { !op.opa_inst_name_ask ?
            <div className="row" style={{marginBottom: "15px"}}>
              {this.renderInstsNamesInput(op)}
            </div>
          : ""
        }
      </div>
    );
  }
  // }}}3
  // RemoveOperation {{{3

  renderRemoveOperation = (op: RemoveEntityInstOp) => {
    const entity = ufoaDB.getEntity(op.opr_e_id);
    return (
      <div className="row" style={{marginBottom: "15px"}} key={op.opr_e_id}>
        <div className="col-xs-1" style={{paddingTop: "10px"}}>
          <i className="glyphicon glyphicon-minus text-danger" style={{fontSize: "20px"}}/>
        </div>
        <div className="col-xs-6">
          {entity ? diagram.renderEntity(entity) : "This entity does not exist, this should not happen..."}
        </div>
        <div className="col-xs-3">
        </div>
        <div className="col-xs-2" style={{paddingTop: "10px"}}>
          <Button className="btn-danger btn-sm" onClick={() => this.setAttr("ev_remove_ops.delete", op)}>
            <i className="glyphicon glyphicon-trash"/>
          </Button>
        </div>
      </div>
    );
  }

  // }}}3
  
  renderNewOp = () => {
    const addOps = this.state.eventB2.ev_add_ops;
    const removeOps = this.state.eventB2.ev_remove_ops;
    const opsEIds = R.concat(addOps.map(op => op.opa_e_id), removeOps.map(op => op.opr_e_id));
    return (
      <div className="row" style={{marginBottom: "15px"}}>
        <div className="col-xs-9">
          <Typeahead
            ref={typeahead => this.newOpTypeahead = typeahead}
            options={ufoaDB.getEntities().filter(e => opsEIds.indexOf(e.e_id) < 0)}
            labelKey={"e_name"}
            onChange={es => { 
              if (es.length > 0) { 
                this.setState({ newOpEntity: es[0] });
              }
            }}
          />
        </div>
        <div className="col-xs-1">
          <Button 
            className="btn-primary btn-sm" 
            disabled={!this.state.newOpEntity}
            onClick={() => { 
              if (this.state.newOpEntity) {
                this.setAttr("ev_add_ops.add", this.state.newOpEntity.e_id);
                this.newOpTypeahead.getInstance().clear();
                this.setState({ newOpEntity: null });
              }
            }}>
            <i className="glyphicon glyphicon-plus"/>
          </Button>
        </div>
        <div className="col-xs-1">
          <Button 
            className="btn-primary btn-sm" 
            disabled={!this.state.newOpEntity}
            onClick={() => { 
              if (this.state.newOpEntity) {
                this.setAttr("ev_remove_ops.add", this.state.newOpEntity.e_id);
                this.newOpTypeahead.getInstance().clear();
                this.setState({ newOpEntity: null });
              }
            }}>
            <i className="glyphicon glyphicon-minus"/>
          </Button>
        </div>
      </div>
    );
  }

  addOpComparator = (op1: AddEntityInstOp, op2: AddEntityInstOp) => {
    return this.compareEntities(ufoaDB.getEntity(op1.opa_e_id), ufoaDB.getEntity(op2.opa_e_id));
  }

  removeOpComparator = (op1: RemoveEntityInstOp, op2: RemoveEntityInstOp) => {
    return this.compareEntities(ufoaDB.getEntity(op1.opr_e_id), ufoaDB.getEntity(op2.opr_e_id));
  }

  compareEntities = (e1: ?UfoaEntity, e2: ?UfoaEntity) => {
    const name1 = e1 ? e1.e_name : "";
    const name2 = e2 ? e2.e_name : "";
    return (
        name1 < name2 ? -1
      : name1 > name2 ? 1
      : 0
    );
  }

  renderOperations = () => {
    const addOpsSorted = R.sort(this.addOpComparator, this.state.eventB2.ev_add_ops);
    const removeOpsSorted = R.sort(this.removeOpComparator, this.state.eventB2.ev_remove_ops);
    return (
      <div className="form-group">
        <Panel className="dialog">
          <Panel.Heading>Operations</Panel.Heading>
          <Panel.Body collapsible={false}>
            <div className="container-fluid">
              {addOpsSorted.map(this.renderAddOperation)}
              {removeOpsSorted.map(this.renderRemoveOperation)}
              {this.renderNewOp()}
            </div>
          </Panel.Body>
        </Panel>
      </div>
    );
  }

  //}}}2

  renderToSituation = () => {
    const toSituation = ufobDB.getSituationById(this.state.eventB2.ev_to_situation_id);
    return (
      <div className="form-group">
        <label>Resulting situation:</label>
        <Typeahead
          options={ufobDB.getSituations()}
          labelKey={"s_name"}
          selected={[toSituation]}
          onChange={ss => { 
            if (ss.length > 0) {
              this.setAttr("ev_to_situation_id", ss[0].s_id);
            }
          }}
        />
      </div>
    );
  }

  renderWMDAButton = () => {
    return (
      <div className="form-group row col-sm-12">
        <Button className="col-sm-12 btn-primary" onClick={this.editWMDA}>Edit WMDA Standard</Button>
      </div>);
  }

  // Buttons rendering {{{2

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <Button className="btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update event</Button>
        </div>
        <div className="col-sm-6 text-right">
          {this.renderButtonDelete()}
        </div>
      </div>);
  }

  renderButtonDelete() {
    return (
      <Confirm
        onConfirm={this.delete}
        body={`Are you sure you want to delete "${this.props.eventB.ev_name}"?`}
        confirmText="Confirm Delete"
        title="Deleting Event">
        <Button className="btn-danger">Delete event</Button>
      </Confirm>);
  }

  // }}}2

  render() {
    return ( 
      <Panel className="dialog-panel">
        <Panel.Heading><strong>{this.props.eventB.ev_name}</strong></Panel.Heading>
        <Panel.Body collapsible={false}>
          {this.renderEventName()}
          {this.renderOperations()}
          {this.renderToSituation()}
          {this.renderWMDAButton()}
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

}

///}}}1

export function render(eventB: UfobEvent, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<EventForm eventB={eventB} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}

