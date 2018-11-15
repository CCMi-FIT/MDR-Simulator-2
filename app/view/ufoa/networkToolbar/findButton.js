//@flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import type { UfoaEntity} from '../../../metamodel/ufoa';
import * as ufoaMeta from '../../../metamodel/ufoa';
import * as ufoaDB from '../../../db/ufoa';

type Props = {
  network: any,
};

export class FindEntity extends React.Component<Props> {
  
  find = (entity: ?UfoaEntity) => {
    if (entity) {
      this.props.network.fit({ 
        nodes: [entity.e_id],
        animation: true
      });
    }
  }

  render() {
    return ( 
      <div className="btn-group" role="group">
        <div style={{float: "left"}}>
          <Typeahead
            options={ufoaDB.getEntities()}
            labelKey={"e_name"}
            onChange={entities => { 
              if (entities.length) { 
                this.find(entities[0]);
              }
            }}
          />
        </div>
        <div style={{float: "left"}}>
          <i className="btn btn-default glyphicon glyphicon-search disabled"></i>
        </div>
      </div>);
  }
}

