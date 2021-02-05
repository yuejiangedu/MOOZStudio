/* eslint-disable */
// @ts-nocheck
/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

import * as THREE from 'three';
interface IDragControls extends THREE.EventDispatcher {
  object: THREE.Camera;
  enabled: boolean;
  activate(): void;
  deactivate(): void;
  dispose(): void;
}

export default class DragControls extends THREE.EventDispatcher implements IDragControls {
  constructor(_objects: THREE.Object3D[] | THREE.Camera, _camera: THREE.Camera | THREE.Object3D[], _domElement: HTMLCanvasElement) {
    super();
    if (_objects instanceof THREE.Camera) {
      console.warn('THREE.DragControls: Constructor now expects ( objects, camera, domElement )');
      let temp = _objects;
      _objects = _camera;
      _camera = temp;
    }

    let _plane = new THREE.Plane();
    let _raycaster = new THREE.Raycaster();

    let _mouse = new THREE.Vector2();
    let _offset = new THREE.Vector3();
    let _intersection = new THREE.Vector3();
    let _worldPosition = new THREE.Vector3();
    let _inverseMatrix = new THREE.Matrix4();

    let _selected: any = null, _hovered: any = null;

    //

    let scope = this;

    function activate() {
      _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
      _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
      _domElement.addEventListener('mouseup', onDocumentMouseCancel, false);
      _domElement.addEventListener('mouseleave', onDocumentMouseCancel, false);
      _domElement.addEventListener('touchmove', onDocumentTouchMove, false);
      _domElement.addEventListener('touchstart', onDocumentTouchStart, false);
      _domElement.addEventListener('touchend', onDocumentTouchEnd, false);
    }

    function deactivate() {
      _domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
      _domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
      _domElement.removeEventListener('mouseup', onDocumentMouseCancel, false);
      _domElement.removeEventListener('mouseleave', onDocumentMouseCancel, false);
      _domElement.removeEventListener('touchmove', onDocumentTouchMove, false);
      _domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
      _domElement.removeEventListener('touchend', onDocumentTouchEnd, false);
    }

    function dispose() {
      deactivate();
    }

    function onDocumentMouseMove(event: MouseEvent) {
      event.preventDefault();

      let rect: DOMRect | undefined = _domElement.getBoundingClientRect();

      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, _camera as THREE.Camera);

      if (_selected && scope.enabled) {
        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
          _selected.position.z = 0;
        }

        scope.dispatchEvent({ type: 'drag', object: _selected });

        return;
      }

      _raycaster.setFromCamera(_mouse, _camera as THREE.Camera);

      let intersects = _raycaster.intersectObjects(_objects as THREE.Object3D[]);

      if (intersects.length > 0) {
        let object = intersects[0].object;

        _plane.setFromNormalAndCoplanarPoint((_camera as THREE.Camera).getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(object.matrixWorld));

        if (_hovered !== object) {
          scope.dispatchEvent({ type: 'hoveron', object: object });

          _domElement.style.cursor = 'pointer';
          _hovered = object;
        }
      } else if (_hovered !== null) {
        scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

        _domElement.style.cursor = 'auto';
        _hovered = null;
      }
    }

    function onDocumentMouseDown(event: MouseEvent) {
      event.preventDefault();

      _raycaster.setFromCamera(_mouse, _camera as THREE.Camera);

      let intersects = _raycaster.intersectObjects(_objects as THREE.Object3D[]);

      if (intersects.length > 0) {
        _selected = intersects[0].object;

        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _inverseMatrix.getInverse(_selected.parent.matrixWorld);
          _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
        }

        _domElement.style.cursor = 'move';

        scope.dispatchEvent({ type: 'dragstart', object: _selected });
      }
    }

    function onDocumentMouseCancel(event: MouseEvent) {
      event.preventDefault();

      if (_selected) {
        scope.dispatchEvent({ type: 'dragend', object: _selected });

        _selected = null;
      }

      _domElement.style.cursor = _hovered ? 'pointer' : 'auto';
    }

    function onDocumentTouchMove(event: any) {
      event.preventDefault();
      event = event.changedTouches[0];

      let rect = _domElement.getBoundingClientRect();

      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, _camera as THREE.Camera);

      if (_selected && scope.enabled) {
        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
        }

        scope.dispatchEvent({ type: 'drag', object: _selected });

        return;
      }
    }

    function onDocumentTouchStart(event: any) {
      event.preventDefault();
      event = event.changedTouches[0];

      let rect = _domElement.getBoundingClientRect();

      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, _camera as THREE.Camera);

      let intersects = _raycaster.intersectObjects(_objects as THREE.Object3D[]);

      if (intersects.length > 0) {
        _selected = intersects[0].object;

        _plane.setFromNormalAndCoplanarPoint((_camera as THREE.Camera).getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _inverseMatrix.getInverse(_selected.parent.matrixWorld);
          _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
        }

        _domElement.style.cursor = 'move';

        scope.dispatchEvent({ type: 'dragstart', object: _selected });
      }
    }

    function onDocumentTouchEnd(event: any) {
      event.preventDefault();

      if (_selected) {
        scope.dispatchEvent({ type: 'dragend', object: _selected });

        _selected = null;
      }

      _domElement.style.cursor = 'auto';
    }

    activate();

    // API

    this.enabled = true;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
  }
  object: any;
  enabled: boolean;
  activate(): void {
    throw new Error('Method not implemented.');
  }
  deactivate(): void {
    throw new Error('Method not implemented.');
  }
  dispose(): void {
    throw new Error('Method not implemented.');
  }
}

