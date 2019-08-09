//@flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, renderConfirmPm } from '../../../components';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { Id } from '../../../metamodel';
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
  instsNamesViolations: Array<Id>,
  saveDisabled: boolean
};

function mkInstsNamesStrDict(addOps: Array<AddEntityInstOp>): any {
  return addOps.reduce(
    (dict, addOp) => R.assoc(addOp.opa_e_id, addOp.opa_insts_names.join(" "), dict),
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
      instsNamesViolations: [],
      saveDisabled: true
    };
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
        : attr === "instsNamesViolations.set" ?
          R.mergeDeepRight(state, { instsNamesViolations: R.append(val, state.instsNamesViolations) })
        : attr === "instsNamesViolations.unset" ?
          R.mergeDeepRight(state, { instsNamesViolations: R.without([val], state.instsNamesViolations) })
        : R.mergeDeepRight(state, { eventB2: { [attr]: val }});
      const res = R.mergeDeepRight(stateNew, { saveDisabled: 
        stateNew.instsNamesViolations.length > 0 || R.equals(evOrig, stateNew.eventB2)
      });
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

  hasInstNameError(op: AddEntityInstOp): boolean {
    return this.state.instsNamesViolations.includes(op.opa_e_id);
  }

  checkInstsNamesUnique(op: AddEntityInstOp, instsNames: Array<string>): Array<string> {
    const oldInstsNames = op.opa_insts_names;
    const allInstsNames = R.without(oldInstsNames, ufobDB.getInstsNames());
    return instsNames.filter(instName => allInstsNames.includes(instName));
  }

  updateInstsNamesFromStr = (op: AddEntityInstOp) => {
    const str = this.state.instsNamesStrDict[op.opa_e_id];
    const newInstsNames = str.split(" ").filter(i => i.length > 0);
    const violations = this.checkInstsNamesUnique(op, newInstsNames);
    if (violations.length === 0) {
      this.setAttr("instsNamesViolations.unset", op.opa_e_id);
      const newOp = R.mergeDeepRight(op, { opa_insts_names: newInstsNames });
      this.setAttr("ev_add_ops.update", newOp);
    } else {
      this.setAttr("instsNamesViolations.set", op.opa_e_id);
    }
  };

  // Operations actions {{{2
  
  // Rendering {{{1

  renderEventName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.eventB2.ev_name} onChange={ev => this.setAttr("ev_name", ev.currentTarget.value)} rows="3" cols="30"/>
      </div>);
  }

  // Operations Rendering {{{2
  // AddOperation {{{3
  
  renderAddOpDelete = (op: AddEntityInstOp) => {
    return (
      <button type="button" className="btn-danger btn-sm" onClick={() => this.setAttr("ev_add_ops.delete", op)}>
        <i className="fas fa-trash"/>
      </button>
    );
  }

  renderInstsNamesInput = (op: AddEntityInstOp) => {
    const instsTip = this.hasInstNameError(op) ?
        "The name is not unique"
      : "Unique instance names separated by a space";
    return (
      <div>
        <input 
          className={this.hasInstNameError(op) ? "form-control bg-error" : "form-control"}
          value={this.state.instsNamesStrDict[op.opa_e_id]}
          data-toggle="tooltip" data-placement="right" title={instsTip}
          onChange={ev => {
            const val = ev.currentTarget.value;
            this.setState(
              (state: State) => 
              R.mergeDeepRight(state,
                { instsNamesStrDict: R.assoc(op.opa_e_id, val, state.instsNamesStrDict) }));
          }}
          onBlur={() => this.updateInstsNamesFromStr(op)}
        />
      </div>
    );
  }

  renderAddOperation = (op: AddEntityInstOp) => {
    const entity = ufoaDB.getEntity(op.opa_e_id);
    return (
      <div key={op.opa_e_id} className="form-group">
        <div className="row">
          <div className="col-1 pl-0 my-auto">
            <i className="fas fa-plus text-success" style={{fontSize: "20px"}}/>
          </div>
          <div className="col-9 pl-0">
            {entity ? diagram.renderEntity(entity) : "This entity does not exist, this should not happen..."}
          </div>
          <div className="col-2 my-auto">
            {this.renderAddOpDelete(op)}
          </div>
        </div>
        <div className="row">
          <div className="offset-1 col-9 pl-0">
            {this.renderInstsNamesInput(op)}
          </div>
        </div>
      </div>
    );
  }
  
  // Remove Operation {{{3
  renderRemoveOpDelete = (op: RemoveEntityInstOp) => {
    return (
      <button type="button" className="btn btn-danger btn-sm" onClick={() => this.setAttr("ev_remove_ops.delete", op)}>
        <i className="fas fa-trash"/>
      </button>
    );
  }

  renderRemoveOperation = (op: RemoveEntityInstOp) => {
    const entity = ufoaDB.getEntity(op.opr_e_id);
    return (
      <div key={op.opr_e_id} className="form-group row">
        <div className="col-1 pl-0 my-auto">
          <i className="fas fa-minus text-danger" style={{fontSize: "20px"}}/>
        </div>
        <div className="col-9 pl-0">
          {entity ? diagram.renderEntity(entity) : "This entity does not exist, this should not happen..."}
        </div>
        <div className="col-2 my-auto">
          {this.renderRemoveOpDelete(op)}
        </div>
      </div>
    );
  }

  // New Operation {{{3
  
  renderNameInput = () => {
    const addOps = this.state.eventB2.ev_add_ops;
    const removeOps = this.state.eventB2.ev_remove_ops;
    const opsEIds = R.concat(addOps.map(op => op.opa_e_id), removeOps.map(op => op.opr_e_id));
    return (
      <Typeahead
        id="situationTA"
        ref={typeahead => this.newOpTypeahead = typeahead}
        options={ufoaDB.getEntities().filter(e => opsEIds.indexOf(e.e_id) < 0)}
        labelKey={"e_name"}
        onChange={es => { 
          if (es.length > 0) { 
            this.setState({ newOpEntity: es[0] });
          }
        }}
      />
    );
  }

  renderAddOpButton = () => {
    return (
			<button 
				type="button"
				className="btn btn-primary btn-sm" 
        style={{marginBottom: "5px"}}
				disabled={!this.state.newOpEntity}
				onClick={() => { 
					if (this.state.newOpEntity) {
						this.setAttr("ev_add_ops.add", this.state.newOpEntity.e_id);
						this.newOpTypeahead.getInstance().clear();
						this.setState({ newOpEntity: null });
					}
				}}>
				<i className="fas fa-plus"/>
			</button>
    );
  }
  
  renderRemoveOpButton = () => {
    return (
      <button 
        type="button"
        className="btn btn-primary btn-sm" 
        disabled={!this.state.newOpEntity}
        onClick={() => { 
          if (this.state.newOpEntity) {
            this.setAttr("ev_remove_ops.add", this.state.newOpEntity.e_id);
            this.newOpTypeahead.getInstance().clear();
            this.setState({ newOpEntity: null });
          }
        }}>
        <i className="fas fa-minus"/>
      </button>
    );
  }
  
  renderNewOp = () => {
    return (
      <div className="form-group row">
        <div className="offset-1 col-9 pl-0 my-auto">
					{this.renderNameInput()}
        </div>
        <div className="col-2 my-auto">
					{this.renderAddOpButton()}
          {this.renderRemoveOpButton()}
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
        <Panel heading="Operations">
          <div className="container-fluid">
            {addOpsSorted.map(this.renderAddOperation)}
            {removeOpsSorted.map(this.renderRemoveOperation)}
            {this.renderNewOp()}
          </div>
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
          id="toSituationxxxTA"
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
        <button type="button" className="btn col-sm-12 btn-primary" onClick={this.editWMDA}>Edit WMDA Standard</button>
      </div>);
  }

  // Buttons rendering {{{2

  renderButtons() {
    return (
      <div className="form-group row col-sm-12"> 
        <div className="col-sm-6">
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update event</button>
        </div>
        <div className="col-sm-6 text-right">
          {this.renderButtonDelete()}
        </div>
      </div>);
  }

  renderButtonDelete() {
    return (
      <button type="button" className="btn btn-danger" onClick={() => {
        renderConfirmPm(
          "Deleting Event",
          "delete",
          <span>Are you sure you want to delete &quot;{this.props.eventB.ev_name}&quot;?</span>
        ).then(() => this.delete());
      }}>Delete
      </button>
    );
  }

  // }}}2

  render() {
    return ( 
      <Panel heading={<span><strong>Event {this.props.eventB.ev_id}</strong></span>}>
        {this.renderEventName()}
        {this.renderOperations()}
        {this.renderToSituation()}
        {this.renderWMDAButton()}
        {this.renderButtons()}
      </Panel>
    );
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

