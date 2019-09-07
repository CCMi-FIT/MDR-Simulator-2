import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import { Panel, renderConfirmPm } from "../../../components";
import { UfoaEntity, Generalisation, GSet } from "../../metamodel";
import * as ufoaMeta from "../../metamodel";
import * as ufoaDB from "../../db";
import { UfoaVisModel } from "../diagram";
import * as panels from "../../../panels";

interface Props {
  generalisation: Generalisation;
  visModel: UfoaVisModel;
}

interface State {
  generalisation2: Generalisation;
  saveDisabled: boolean;
}

function commitGeneralisation(edges: any, g: Generalisation) {
  ufoaDB.updateGeneralisation(g).then(
    () => {
      edges.update({
        id: g.g_id,
        label: g.g_set.g_set_id,
        from: g.g_sup_e_id,
        to: g.g_sub_e_id,
      });
      panels.disposeDialogUfoa();
      panels.displayInfo("Generalisation saved.");
    },
    (error) => panels.displayError("Generalisation save failed: " + error)
  );
}

class GeneralisationsForm extends panels.PaneDialog<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      generalisation2: props.generalisation,
      saveDisabled: true
    };
  }

  private setAttr = (attr: keyof Generalisation | keyof GSet, val: any) => {
    this.setState((state: State, props: Props) => {
      const gOrig = props.generalisation;
      const stateNew: State = (
        attr === "g_set_id" ? (
          ufoaDB.getGSet(val) ? {
	    ...state,
	    generalisation2: {
	      ...state.generalisation2,
	      g_set: ufoaDB.getGSet(val) || state.generalisation2.g_set // || Just to satisfy the compiler
	    } 
	  }
        : {
	    ...state,
	    generalisation2: {
	      ...state.generalisation2,
	      g_set: {
		g_set_id: val,
		g_meta: ""
	      }
	    }
	  }
	)
        : attr === "g_meta" ? { 
	  ...state,
	  generalisation2: { 
	    ...state.generalisation2,
	    g_set: {
	      ...state.generalisation2.g_set,
	      g_meta: val
	    }
	  }
	}
	: attr === "g_sup_e_id" ? { 
	  ...state,
	  generalisation2: {
	    ...state.generalisation2,
	    g_sup_e_id: val
	  }
	}
	: attr === "g_sub_e_id" ? { 
	  ...state,
	  generalisation2: {
	    ...state.generalisation2,
	    g_sub_e_id: val
	  }
	}
	: (() => {
	    const res: State = _.clone(state);
            console.error(new Error(`GeneralisationForm: setAttr of ${attr} not implemented`));
	    return res;
	})()
      );
      return { ...stateNew, saveDisabled: _.isEqual(gOrig, stateNew.generalisation2) };
    });
  }

  private save = () => {
    const gOriginal = this.props.generalisation;
    const gNew = this.state.generalisation2;
    const edges: any = this.props.visModel.edges;
    if (!_.isEqual(gOriginal, gNew)) {
      commitGeneralisation(edges, gNew);
    }
  }

  private delete = () => {
    const edges: any = this.props.visModel.edges;
    const g_id = this.props.generalisation.g_id;
    ufoaDB.deleteGeneralisation(g_id).then(
      () => {
        edges.remove({ id: g_id });
        panels.disposeDialogUfoa();
        panels.displayInfo("Generalisation deleted.");
      },
      (error) => panels.displayError("Generalisation delete failed: " + error)
    );
  }

  private renderGSet = () => {
    return (
      <div className="form-group">
        <label>Set</label>
        <Typeahead
          id="gsetTA"
          options={ufoaDB.getGeneralisationSets()}
          labelKey={"g_set_id"}
          onChange={(gSets: GSet[]) => {
            if (gSets.length) {
              this.setAttr("g_set_id", gSets[0].g_set_id);
            }
          }}
          selected={[this.state.generalisation2.g_set]}
          allowNew={true}
        />
      </div>
    );
  }

  private renderMeta = () => {
    return (
      <div className="form-group">
        <label>Meta</label>
        <select className="form-control" value={this.state.generalisation2.g_set.g_meta} onChange={(e) => this.setAttr("g_meta", e.currentTarget.value)}>
          {ufoaMeta.genMetas.map((meta) => <option key={meta}>{meta}</option>)}
        </select>
      </div>
    );
  }

  private renderSup = () => {
    return (
      <div className="form-group">
        <label>Supertype</label>
        <Typeahead
          id="supTA"
          options={ufoaDB.getEntities()}
          labelKey={(e: UfoaEntity) => ufoaMeta.entityNameLine(e)}
          selected={[ufoaDB.getEntity(this.state.generalisation2.g_sup_e_id)]}
          onChange={(entities: UfoaEntity[]) => {
            if (entities.length) {
              this.setAttr("g_sup_e_id", entities[0].e_id);
            }
          }}
        />
      </div>
    );
  }

  private renderSub = () => {
    return (
      <div className="form-group">
        <label>Subtype</label>
        <Typeahead
          id="subTA"
          options={ufoaDB.getEntities()}
          labelKey={(e: UfoaEntity) => ufoaMeta.entityNameLine(e)}
          selected={[ufoaDB.getEntity(this.state.generalisation2.g_sub_e_id)]}
          onChange={(entities: UfoaEntity[]) => {
            if (entities.length) {
              this.setAttr("g_sub_e_id", entities[0].e_id);
            }
          }}
        />
      </div>
    );
  }

  private renderButtons = () => {
    return (
      <div className="form-group row">
        <div className="col-sm-6 text-center">
          <button type="button" className="btn btn-primary" onClick={this.save} disabled={this.state.saveDisabled}>Update</button>
        </div>
        <div className="col-sm-6 text-center">
          {this.renderButtonDelete()}
        </div>
      </div>
    );
  }

  private renderButtonDelete = () => {
    return (
      <button type="button" className="btn btn-danger" onClick={() => {
        renderConfirmPm(
          "Deleting Generalisation",
          "delete",
          <span>Are you sure you want to delete &quot;{this.props.generalisation.g_id}&quot;?</span>
        ).then(() => this.delete());
      }}>Delete
      </button>
    );
  }

  public render = () => {
    return (
      <Panel heading={<span><strong>Generalisation {this.props.generalisation.g_id}</strong></span>}>
        {this.renderGSet()}
        {this.renderMeta()}
        {this.renderSup()}
        {this.renderSub()}
        {this.renderButtons()}
      </Panel>
    );
  }
}

export function render(generalisation: Generalisation, ufoaVisModel: UfoaVisModel) {
  const panel = panels.getDialogUfoa();
  if (panel) {
    ReactDOM.render(<GeneralisationsForm generalisation={generalisation} visModel={ufoaVisModel}/>, panel);
    panels.showDialogUfoa();
  }
}
