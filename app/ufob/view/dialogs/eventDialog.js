//@flow

// Imports {{{1
import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Panel, Button } from 'react-bootstrap';
import { Confirm } from 'react-confirm-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { UfoaEntity } from '../../../ufoa/metamodel';
import type { EventB, AddEntityInstOp, RemoveEntityInstOp } from '../../metamodel';
import * as ufobMeta from '../../metamodel';
import * as ufoaDB from '../../../ufoa/db';
import * as ufobDB from '../../db';
import type { VisModel } from '../../../rendering';
import * as rendering from '../../../rendering';
import * as canvasRendering from '../canvas/rendering';
import * as panels from '../../../panels';

// Props & State {{{1
type Props = {
  eventB: EventB,
  ufobVisModel: VisModel
};

type State = {
  eventB2: EventB,
  newOpEntity: ?UfoaEntity,
  saveDisabled: boolean
};

// Component {{{1
class EventForm extends panels.PaneDialog<Props, State> {

  newOpTypeahead: any = null;
  
  constructor(props) {
    super(props);
    this.state = {
      eventB2: R.clone(props.eventB),
      newOpEntity: null,
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
            //TODO: WTF?!? Pri odebrani posledniho prvku se zmeni na objekt tohoto prvku misto prazdneho array!!!!!!!!! a u add_ops to funguje normalne!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            ev_remove_ops: state.eventB2.ev_remove_ops.filter(op => op.opr_e_id !== val.opr_e_id)
          }})
        : R.mergeDeepRight(state, { eventB2: { [attr]: val }});
      return R.mergeDeepRight(stateNew, { saveDisabled: R.equals(evOrig, stateNew.eventB2) });
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
      edges.add(canvasRendering.mkEdge(ev.ev_id, ev.ev_to_situation_id));
      panels.hideDialog();
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
        panels.hideDialog();
        panels.displayInfo("Event deleted.");
      },
      error => panels.displayError("Event delete failed: " + error));
  }

  // Operations actions {{{2

  setExplicit = (op: AddEntityInstOp) => {
    this.setAttr("ev_add_ops.update", R.mergeDeepRight(op, { opa_ei_is_default: false }));
  }

  setDefault = (op: AddEntityInstOp) => {
    this.setAttr("ev_add_ops.update", R.mergeDeepRight(op, { opa_ei_is_default: true }));
  }

  // Rendering {{{1

  renderEventName() {
    return (
      <div className="form-group">
        <textarea className="form-control" type="text" value={this.state.eventB2.ev_name} onChange={(e) => this.setAttr("ev_name", e.currentTarget.value)} rows="3" cols="30"/>
      </div>);
  }

  // Operations rendering {{{2
  renderAddOperation = (op: AddEntityInstOp) => {
    const entity: ?UfoaEntity = ufoaDB.getEntity(op.opa_e_id);
    if (!entity) {
      console.error(`Internal error: entity with id=${op.opa_e_id} required in event ${this.state.eventB2.ev_name} does not exist`);
    }
    return (
      <div className="row" style={{marginBottom: "15px"}} key={op.opa_e_id}>
        <div className="col-xs-1" style={{paddingTop: "10px"}}>
          <i className="glyphicon glyphicon-plus text-success" style={{fontSize: "20px"}}/>
        </div>
        <div className="col-xs-6">
          {entity ? rendering.renderEntity(entity) : "This entity does not exist: this should not happen..."}
        </div>
        <div className="col-xs-3" style={{paddingTop: "10px"}}>
          {op.opa_ei_is_default ? 
            <Button 
              className="btn-default btn-sm"
              title="Default instances are nameless single instances of an entity"
              onClick={() => this.setExplicit(op)}
            >Default</Button> 
            : 
            <Button
              className="btn-primary btn-sm"
              title="Explicit instances ask for a name when instantiated"
              onClick={() => this.setDefault(op)}
            >Explicit</Button> 
          }
        </div>
        <div className="col-xs-2" style={{paddingTop: "10px"}}>
          <Button className="btn-danger btn-sm" onClick={() => this.setAttr("ev_add_ops.delete", op)}>
            <i className="glyphicon glyphicon-trash"/>
          </Button>
        </div>
      </div>
    );
  }

  renderRemoveOperation = (op: RemoveEntityInstOp) => {
    const entity: ?UfoaEntity = ufoaDB.getEntity(op.opr_e_id);
    if (!entity) {
      console.error(`Internal error: entity with id=${op.opr_e_id} required in event ${this.state.eventB2.ev_name} does not exist`);
    }
    return (
      <div className="row" style={{marginBottom: "15px"}} key={op.opr_e_id}>
        <div className="col-xs-1" style={{paddingTop: "10px"}}>
          <i className="glyphicon glyphicon-minus text-danger" style={{fontSize: "20px"}}/>
        </div>
        <div className="col-xs-6">
          {entity ? rendering.renderEntity(entity) : "This entity does not exist, this should not happen..."}
        </div>
        <div className="col-xs-3">
        </div>
        <div className="col-xs-2" style={{paddingTop: "10px"}}>
          <Button className="btn-danger btn-sm" onClick={() => this.setAttr("ev_remove_ops", op)}>
            <i className="glyphicon glyphicon-trash"/>
          </Button>
        </div>
      </div>
    );
  }
  
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
            onClick={() => { 
              if (this.state.newOpEntity) {
                this.setAttr("ev_add_ops.add", this.state.newOpEntity.e_id);
                this.newOpTypeahead.getInstance().clear();
              }
            }}>
            <i className="glyphicon glyphicon-plus"/>
          </Button>
        </div>
        <div className="col-xs-1">
          <Button 
            className="btn-primary btn-sm" 
            onClick={() => { 
              if (this.state.newOpEntity) {
                this.setAttr("ev_remove_ops.add", this.state.newOpEntity.e_id);
                this.newOpTypeahead.getInstance().clear();
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
          {this.renderButtons()}
        </Panel.Body>
      </Panel>);
  }

}

///}}}1

export function render(eventB: EventB, ufobVisModel: VisModel) {
  let panel = panels.getDialog();
  if (panel) {
    ReactDOM.render(<EventForm eventB={eventB} ufobVisModel={ufobVisModel}/>, panel);
    panels.showDialog();
  }
}
