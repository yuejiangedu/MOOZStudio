import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Buttons';
import Dropdown, { MenuItem } from '../Dropdown';
import * as WebGL from '../../lib/three/WebGL';
import styles from './primary-toolbar.styl';

interface Istate {
  cameraMode: string;
  cameraPosition: string[];
  disabled: boolean;
  gcode: { [index: string]: string | boolean };
  objects: { [index: string]: { [index: string]: boolean } };
  projection: string;
  viewZoom: number;
}

interface Iprops {
  state: Istate;
  actions: { [index: string]: () => void };
}

const PrimaryToolbar = (props: Iprops) => {
  const { state, actions } = props;
  const { disabled, gcode, projection, objects } = state;
  const canToggleOptions = WebGL.isWebGLAvailable() && !disabled;
  const { t } = useTranslation();
  return (
    <div className={styles.primaryToolbar}>
      <Dropdown
        pullRight
        className={classNames(styles.dropdown, {
          [styles.active]: !(!WebGL.isWebGLAvailable() || disabled)
        })}
      >
        <Button
          btnSize="sm"
          btnStyle="flat"
          title={(!WebGL.isWebGLAvailable() || disabled)
            ? t('Enable 3D View')
            : t('Disable 3D View')
          }
          onClick={actions.toggle3DView}
          className={styles.dropdownBtn}
        >
          {(!WebGL.isWebGLAvailable() || disabled)
            ? <i className="fa fa-toggle-off" />
            : <i className="fa fa-toggle-on" />
          }
          {t('3D View')}
        </Button>
        <Dropdown.Toggle btnSize="sm" className={styles.dropdownToggle} />
        <Dropdown.Menu>
          <MenuItem divider />
          <MenuItem header>
            {t('Projection')}
          </MenuItem>
          <MenuItem
            disabled={!canToggleOptions}
            onSelect={actions.toPerspectiveProjection}
          >
            <i className={classNames('fa', 'fa-fw', { 'fa-check': projection !== 'orthographic' })} />
            {t('Perspective Projection')}
          </MenuItem>
          <MenuItem
            disabled={!canToggleOptions}
            onSelect={actions.toOrthographicProjection}
          >
            <i className={classNames('fa', 'fa-fw', { 'fa-check': projection === 'orthographic' })} />

            {t('Orthographic Projection')}
          </MenuItem>
          <MenuItem divider />
          <MenuItem
            disabled={!canToggleOptions}
            onSelect={actions.toggleGCodeFilename}
          >
            {gcode.displayName
              ? <i className="fa fa-toggle-on fa-fw" />
              : <i className="fa fa-toggle-off fa-fw" />
            }

            {t('Display G-code Filename')}
          </MenuItem>
          <MenuItem
            disabled={!canToggleOptions}
            onSelect={actions.toggleCoordinateSystemVisibility}
          >
            {objects.coordinateSystem.visible
              ? <i className="fa fa-toggle-on fa-fw" />
              : <i className="fa fa-toggle-off fa-fw" />
            }

            {objects.coordinateSystem.visible
              ? t('Hide Coordinate System')
              : t('Show Coordinate System')
            }
          </MenuItem>
          <MenuItem
            disabled={!canToggleOptions}
            onSelect={actions.toggleGridLineNumbersVisibility}
          >
            {objects.gridLineNumbers.visible
              ? <i className="fa fa-toggle-on fa-fw" />
              : <i className="fa fa-toggle-off fa-fw" />
            }

            {objects.gridLineNumbers.visible
              ? t('Hide Grid Line Numbers')
              : t('Show Grid Line Numbers')
            }
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    </div>

  );
};

export default PrimaryToolbar;
