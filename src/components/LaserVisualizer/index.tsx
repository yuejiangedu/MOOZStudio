import React, { useEffect, useRef, useReducer, useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { initState as settingState } from '../../containers/Settings/reducers'
import { ILaserState } from '../../containers/Laser/types'
import { fabric } from 'fabric';
import _throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import { useLocation } from 'react-router'
import Snap from 'snapsvg';
import ProcessImage from '../../lib/processBeauty';
import ContextMenu from '../ContextMenu/ContextMenu';
import { drawGrid, drawCoords } from './drawBackground';
import { NAVBAR_HEIGHT, CONTAINER_MARGIN, RIGHT_SIDER_WIDTH, LEFT_SIDER_WIDTH, WORKSPACE_HEADERTOOL_HEIGHT, FONTSIZE } from '../../constants';
import { mm2px, px2mm, changeDecimal } from '../../lib/units';
import { useSubscribe, useUnsubscribe } from '../../lib/hooks/usePubSub'
import {
  setCoordsInfo,
  setSaveJSON,
  setLaserGenerate,
  setLaserFileInfo,
  setLaserFilter,
  setBeautyType,
  setLaserOption,
  setActiveObj
} from '../../containers/Laser/actions'
import {
  DEFAULT_OPTION,
  COORDSUNIT_MM,
  BEAUTY_OFFSET,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_FILTER
} from './constants'

interface Istate {
  COORDSUNIT_PX: number;
  COORD_COUNT: number;
  canvasObj: any;
  rectObj: any;
  offsetYcoords: number;
  offsetXcoords: number;
  gcode: string,
  currentPic: any,
  currentText: any,
  handleTarget: any,
  aidsBg: any,
  beautyObjID: number,
  checkList: any[],
  jsonDatas: string[],
}

const initStates = {
  COORDSUNIT_PX: mm2px(COORDSUNIT_MM),
  COORD_COUNT: 0,
  canvasObj: null,
  rectObj: null,
  offsetYcoords: 0,
  offsetXcoords: 0,
  gcode: '',
  currentPic: null,
  currentText: null,
  handleTarget: null,
  aidsBg: null,
  beautyObjID: 0,
  checkList: [],
  jsonDatas: [],
}

const reducer = (state: Istate, action: { type: string, meta: any }) => {
  if (action.type in state) {
    return { ...state, [action.type]: action.meta };
  } else {
    throw new Error('Unexpected action');
  }
}

const LaserVisualizer = (props: {}, ref: any) => {
  const {
    coordsInfo,
    laserFileInfo,
    beautyType,
    laserBeautyData,
    visualAidsUrl,
    saveJSON,
    activeObj } = useSelector<IrootState, ILaserState>(state => state.laserReducers);
  const { moozVersion } = useSelector<IrootState, typeof settingState>(state => state.settingReducers);
  const dispatch = useDispatch();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0
  })
  const [state, setState] = useReducer(reducer, initStates)
  const unsubscribe = useUnsubscribe();
  const subscribe = useSubscribe();
  useImperativeHandle(ref, () => ({
    zoomOut,
    zoomIn,
    setBeautyData,
    zoomFit
  }))
  let node: any = useRef(null);
  const changeBeautyType = (val: string) => {
    if (activeObj && /image/.test(activeObj.id) && activeObj.selfType !== 'svg') {
      activeObj.gcodeType = val;
      dispatch(setBeautyType(val));
      rebuildCurrentPic();
    }
  }

  const changeBeautyFilter = (obj: { [index: string]: boolean }) => {
    if (activeObj && /image/.test(activeObj.id) && activeObj.selfType !== 'svg') {
      Object.assign(activeObj.customFilter, obj);
      rebuildCurrentPic();
    }
  }

  const changeText = (meta: any) => {
    const { canvasObj } = state;
    if (activeObj && /text/.test(activeObj.id)) {
      const fillColor = meta.textType === 1 ? 'black' : 'white';
      activeObj.set({
        fill: fillColor,
        textType: meta.textType,
        text: meta.text
      });
      collisionDetection();
      saveCvData();
    }
    canvasObj.renderAll();
  }

  const zoomOut = () => {
    const { canvasObj } = state;
    const zoom = canvasObj.getZoom();
    const newZoom = Math.max(zoom - 0.1, MIN_ZOOM);
    canvasObj.zoomToPoint({ x: (canvasObj.width) / 2, y: (canvasObj.height) / 2 }, newZoom);
  }

  const zoomIn = () => {
    const { canvasObj } = state;
    const zoom = canvasObj.getZoom();
    const newZoom = Math.min(zoom + 0.1, MAX_ZOOM);
    canvasObj.zoomToPoint({ x: (canvasObj.width) / 2, y: (canvasObj.height) / 2 }, newZoom);
  }

  const changeOption = (key: string, val: any) => {
    if (Object.keys(activeObj).length != 0) {
      activeObj.option[key] = val;
      dispatch(setLaserOption(activeObj.option));
      key === 'thres' && rebuildCurrentPic();
    }
    saveCvData();
  }

  const rebuildCurrentPic = () => {
    const { canvasObj } = state;
    canvasObj.remove(activeObj);
    removeObjFromCheckList(activeObj.id);
    insertPic(activeObj);
  }

  const beautyTypeIsSVG = () => {
    return laserFileInfo.type === 'svg';
  }

  const insertText = (meta: any) => {
    if (meta.text === '') {
      return;
    }
    const { canvasObj, COORD_COUNT, COORDSUNIT_PX } = state;
    const { offsetYcoords, offsetXcoords } = coordsInfo;
    const stokeText = new fabric.Text(meta.text, {
      strokeWidth: 1, // 邊框粗細
      fill: meta.textType === 1 ? 'black' : 'white',
      stroke: 'black',
      charSpacing: 100,
      fontWeight: 900,
      top: offsetYcoords + COORD_COUNT * COORDSUNIT_PX - mm2px(FONTSIZE + BEAUTY_OFFSET * 5 / 4),
      left: offsetXcoords,
      fontSize: mm2px(FONTSIZE),
      fontFamily: 'Alibaba-PuHuiTi-H',
      selectable: true,
      id: 'text' + Math.random(),
      textType: meta.textType,
      active: meta.active,
      selfType: 'text',
      gcodeType: 'text',
      option: { ...DEFAULT_OPTION }
    });
    toggleControlsVisibility(stokeText, false);
    bindSelectedEvent(stokeText);
    canvasObj.add(stokeText);
    canvasObj.setActiveObject(stokeText);
    dispatch(setActiveObj(stokeText))
    canvasObj.renderAll();
    setObjActive(true, stokeText.id);
    setState({
      type: 'checkList',
      meta: [...state.checkList, stokeText]
    });
    collisionDetection();
    saveCvData();
  }

  const changeBeauty = debounce(async () => {
    await insertPic();
  }, 500, { trailing: true })

  const updateMoozVersion = () => {
    setState({
      type: 'COORD_COUNT',
      meta: moozVersion / COORDSUNIT_MM
    })
    // setCoordsOffset();
  }

  const changeObjState = (val: number, key: string) => {
    const { canvasObj } = state;
    if (canvasObj) {
      activeObj.set(key, val).setCoords();
      canvasObj.requestRenderAll();
      collisionDetection();
      saveCvData();
    }
  }

  /**
   * 获取图片像素数据
   * @param obj 
   */

  const getBeautyRgbaPixel = (obj: any) => {
    const { width, height, scaleX, scaleY } = obj;
    //存储图片像素数据
    const realWidth = parseInt(String(width * Math.round(scaleX * 100) / 100), 10);
    const realHeight = parseInt(String(height * Math.round(scaleY * 100) / 100), 10);
    if (realWidth !== 0 && realHeight !== 0) {
      const canvasTpl = document.createElement('canvas');
      canvasTpl.width = realWidth;
      canvasTpl.height = realHeight;
      const ctx = canvasTpl.getContext('2d') as CanvasRenderingContext2D;
      //翻转判断
      if (obj.flipX) {
        ctx.translate(canvasTpl.width / 2, 0);
        ctx.scale(-1, 1);
        ctx.translate(-canvasTpl.width / 2, 0);
      }
      if (obj.flipY) {
        ctx.translate(0, canvasTpl.height / 2);
        ctx.scale(1, -1);
        ctx.translate(0, -canvasTpl.height / 2);
      }
      ctx.drawImage(obj._originalElement, 0, 0, canvasTpl.width, canvasTpl.height);
      const rgbaPixel = ctx.getImageData(0, 0, canvasTpl.width, canvasTpl.height);

      if (rgbaPixel)
        obj.data = [...rgbaPixel.data];

      saveCvData();
    }
  }

  /**
   * 设置图片rgba 数据属性
   */
  const setBeautyData = () => {
    state.checkList.forEach((item) => {
      if (item.id.includes('image') && item.selfType !== 'svg') {
        getBeautyRgbaPixel(item);
      }
    });
  }

  /**
   * 设置当前活跃的obj
   * @param flag 
   * @param id 
   */

  const setObjActive = (flag: boolean, id?: number) => {
    const { canvasObj } = state;
    canvasObj._objects.forEach((o: any) => {
      if (o.id) {
        o.active = false;
        if (flag) {
          o.active = (o.id === id);
        }
      }
    });
  }

  /**
   * 切换控制框
   */
  const toggleControlsVisibility = (object: any, val: boolean) => {
    object.setControlsVisibility({
      mt: val,
      mb: val,
      ml: val,
      mr: val,
    });
  }

  /**
   * 调整SVG 图片的尺寸
   * @param svgStr 
   */
  const abjustSvgSize = (svgStr: string) => {
    const { defaultWidth } = laserBeautyData;
    //调整svg的大小
    const domContainer = document.createElement('div');
    domContainer.innerHTML = svgStr;
    const svgDom: any = domContainer.children[0];
    const snap = new Snap(svgDom);
    const svgWidth = svgDom.width.baseVal.valueAsString;
    const svgHeight = svgDom.height.baseVal.valueAsString;
    const defaultWidthPx = mm2px(defaultWidth);
    snap.attr('width', defaultWidthPx + 'px');
    if (svgHeight.includes('px') && svgWidth.includes('px')) {
      const proportion = defaultWidthPx / parseFloat(svgWidth);
      const height = parseFloat(svgHeight) * proportion;
      snap.attr('height', height + 'px');
    } else {
      snap.attr('height', defaultWidthPx + 'px');
    }
    return snap.outerSVG();
  }

  /**
   * 调整矢量图片的尺寸
   * @param imgObj 
   */
  const abjustBeautySize = (imgObj: any) => {
    const { cvHeight, offsetYcoords, offsetXcoords } = coordsInfo;
    const { defaultWidth } = laserBeautyData;
    const { width, height } = imgObj;
    const widthmm = px2mm(width);
    const proportion = defaultWidth / widthmm * 10 / 10;
    if (imgObj.selfType && imgObj.selfType === 'text') {
      imgObj.set({
        left: offsetXcoords,
        top: (cvHeight - offsetYcoords - parseFloat(height + BEAUTY_OFFSET) * imgObj.scaleY),
      });
    } else {
      imgObj.set({
        scaleX: proportion,
        scaleY: proportion,
        left: offsetXcoords,
        top: (cvHeight - offsetYcoords + BEAUTY_OFFSET / 4 - parseFloat(height) * proportion),
      });
    }
  }

  /**
   * 加载矢量图片
   * @param url
   * @param beautyType 
   * @param type 
   * @param thres 
   * @param filter 
   */

  const uploadBeauty = async (url: string, beautyType: string, type: string, thres: number, filter: any) => {
    const step = beautyType === 'gray' ? 0 : 1;
    const processImage = new ProcessImage(url, type);
    const imgURL = await processImage.process(step, { thres, hasContract: false, ...filter });
    //插入图片
    return new Promise((resolve) => {
      fabric.Image.fromURL(imgURL, (imgObj: any) => {
        //存储图片像素数据
        abjustBeautySize(imgObj);
        setState({
          type: 'beautyObjID',
          meta: ++state.beautyObjID
        })
        resolve(imgObj);
      }, {
        selectable: true,
        selection: true,
        id: 'image' + state.beautyObjID,
        active: true,
        selfType: type
      });
    });
  }

  /**
   * 加载svg 图片
   * @param obj 
   */
  const uploadSVG = (svgStr: string) => {
    dispatch(setLaserFileInfo({ url: svgStr }));
    const newSVGStr = abjustSvgSize(svgStr);
    //插入图片
    return new Promise((resolve) => {
      fabric.loadSVGFromString(newSVGStr, (objects: any[], options: any) => {
        const svg = fabric.util.groupSVGElements(objects, options);
        svg.set({
          selectable: true,
          selection: true,
          id: 'image' + state.beautyObjID,
          active: true,
          selfType: laserFileInfo.type,
          data: svgStr
        });
        abjustBeautySize(svg);
        setState({
          type: 'beautyObjID',
          meta: ++state.beautyObjID
        })
        resolve(svg);
      });
    });
  }

  /**
   * 更新当前图片及文本
   * @param id 
   * @param val 
   */
  const updateCurrentObjState = (id: string, val: any) => {
    const key = id.includes('image') ? 'currentPic' : 'currentText';
    state[key] = val
  }
  /**
   * 绑定选中事件
   * @param object 
   */
  const bindSelectedEvent = (object: any) => {
    object.on({
      'selected': function () {
        updateCurrentObjState(this.id, this);
        dispatch(setBeautyType(this.gcodeType));
        dispatch(setLaserOption(this.option));
        this.customFilter && dispatch(setLaserFilter(this.customFilter));
        dispatch(setActiveObj(this))
        setObjActive(true, this.id);
        saveCvData();
      },
      'deselected': function () {
        updateCurrentObjState(this.id, null);
        dispatch(setActiveObj({}))
        setObjActive(false);
        saveCvData();
      }
    });
  }

  /**
   * 清理文件信息
   */
  const clearsFileInfo = () => {
    dispatch(setLaserFileInfo({
      url: '',
      name: '',
      size: 0,
      type: ''
    }));
  }

  /**
   * 插入图片
   */
  const insertPic = async (obj?: any) => {
    const insertUrl = obj ? obj.option.url : laserFileInfo.url;
    if (!insertUrl || !state.canvasObj) {
      return;
    }
    const { type } = laserFileInfo;
    const canvasObj = state.canvasObj;
    let beautyObj: any = null;
    const gcodeType = obj ? obj.gcodeType : beautyType;
    const insertType = obj ? obj.selfType : type;
    const thres = obj ? obj.option.thres : 127;
    const customFilter = obj ? obj.customFilter : DEFAULT_FILTER;

    if (beautyTypeIsSVG()) {
      beautyObj = await uploadSVG(insertUrl);
      toggleControlsVisibility(beautyObj, false);
      beautyObj.gcodeType = 'laser-svg';
    } else {
      beautyObj = await uploadBeauty(insertUrl, gcodeType, insertType, thres, customFilter);
      beautyObj.gcodeType = gcodeType;
    }
    //设置图片参数
    beautyObj.option = Object.assign({
      url: insertUrl,
    }, DEFAULT_OPTION, obj ? obj.option : {});
    //设置图片滤镜
    beautyObj.customFilter = { ...customFilter };
    dispatch(setLaserFilter(customFilter));
    //更新图像对象位置
    if (obj) {
      beautyObj.set({
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
      });
    }
    bindSelectedEvent(beautyObj);
    canvasObj.setActiveObject(beautyObj);
    dispatch(setActiveObj(beautyObj))
    canvasObj.add(beautyObj).renderAll();
    // bindSelectedEvent(beautyObj);
    setState({
      type: 'checkList',
      meta: [...state.checkList, beautyObj]
    })
    clearsFileInfo();
    setState({
      type: 'currentPic',
      meta: beautyObj
    })
    saveCvData();
  }


  /**
   * 初始化canvas
   */
  const initFabric = () => {
    if (location.pathname === '/laser') {
      setState({
        type: 'canvasObj',
        meta: new fabric.Canvas('bitmap-cv', {
          isDrawingMode: false,
          selectable: false,
          selection: false,
          fireRightClick: true,
          backgroundColor: '#fff',
          preserveObjectStacking: true
        })
      })
    }
  }

  /**
   * 鼠标移动处理逻辑
   * @param event 
   */

  const canvasObjMouseMove = (event: any) => {
    if (event && event.e) {
      const { canvasObj } = state;
      const delta = new fabric.Point(event.e.movementX, event.e.movementY);
      canvasObj.relativePan(delta);
    }
  }

  /**
   * 移除鼠标事件
   * @param event 
   */
  const removeCanvasObjMouseMovedEvent = () => {
    const { canvasObj } = state;
    canvasObj.selection = true;
    canvasObj.off('mouse:move', canvasObjMouseMove);
    canvasObj.off('mouse:up', removeCanvasObjMouseMovedEvent);
  }

  /**
   * 鼠标点击处理逻辑
   * @param event 
   */
  const canvasObjMouseDown = (event: any) => {
    const { canvasObj } = state;
    if (event.button === 1) {
      setShowMenu(false)
      setState({
        type: 'handleTarget',
        meta: null
      })
    } else if (event.button === 3) {
      const id = event.target && event.target.id;
      //存储当前对象
      if (id && id.includes('image') || id && id.includes('text')) {
        const { offsetX, offsetY } = event.e;
        setMenuPosition({ left: offsetX, top: offsetY })
        setShowMenu(true)
        canvasObj.setActiveObject(event.target);
        dispatch(setActiveObj(event.target));
        canvasObj.renderAll();
        setState({
          type: 'handleTarget',
          meta: event.target
        })
      } else {
        canvasObj.selection = false;
        canvasObj.on('mouse:move', canvasObjMouseMove);
        canvasObj.on('mouse:up', removeCanvasObjMouseMovedEvent);
      }
    }
  }

  /**
   * 保存及碰撞
   */
  const operatingObj = () => {
    saveCvData();
    collisionDetection();
  }

  /**
   * 绑定canvas 事件
   */
  const bindCvEvent = () => {
    const { canvasObj } = state;
    if (canvasObj) {
      canvasObj.on('object:moved', operatingObj);
      canvasObj.on('object:scaled', operatingObj);
      canvasObj.on('mouse:down', canvasObjMouseDown);
      canvasObj.on('object:rotated', operatingObj);
    }
  }

  const removeCvEvent = () => {
    const { canvasObj } = state;
    if (canvasObj) {
      canvasObj.off('object:moved', operatingObj);
      canvasObj.off('object:scaled', operatingObj);
      canvasObj.off('mouse:down', canvasObjMouseDown);
      canvasObj.off('object:rotated', operatingObj);
    }
  }

  /**
   * 碰撞检测
   */
  const collisionDetection = () => {
    const { rectObj } = state;
    let allInRect = state.checkList.length !== 0;
    state.checkList.forEach((item) => {
      const isContained = item.isContainedWithinObject(rectObj, true, false);
      if (!isContained) {
        allInRect = isContained;
      }
      item.set({
        borderColor: isContained ? '#1535f7' : '#f00'
      });
    });
    dispatch(setLaserGenerate(allInRect));
  }

  /**
   * 保存canvas 数据
   */
  const saveCvData = () => {
    const { canvasObj } = state;
    state.jsonDatas.length > 5 && state.jsonDatas.pop();
    state.jsonDatas.unshift(JSON.stringify(canvasObj.toJSON(['id', 'textType', 'active', 'data', 'selfType', 'gcodeType', 'option', 'customFilter'])));
    dispatch(setSaveJSON({ data: state.jsonDatas, index: 0 }))
  }

  /**
   * 调整视点中心
   */
  const restoreVpCenter = () => {
    const { canvasObj } = state;
    const vpCenter = canvasObj.getVpCenter();
    const center = canvasObj.getCenter();
    const delta = new fabric.Point(Math.ceil(vpCenter.x - center.left), Math.ceil(vpCenter.y - center.top));
    canvasObj.relativePan(delta);
  }

  /**
   * 初始化缩放
   */
  const zoomFit = () => {
    const { canvasObj } = state;
    canvasObj.zoomToPoint({ x: (canvasObj.width) / 2, y: (canvasObj.height) / 2 }, 1);
    restoreVpCenter();
    const initZoom = changeDecimal(canvasObj.width * 1 / 2 / mm2px(moozVersion), 1);
    canvasObj.zoomToPoint({ x: (canvasObj.width) / 2, y: (canvasObj.height) / 2 }, initZoom);
  }

  /**
   * 绘制背景
   */
  const drawBackground = () => {
    const { offsetXcoords, offsetYcoords, canvasObj, COORD_COUNT, COORDSUNIT_PX } = state;
    const drawConfig = {
      canvasObj,
      offsetYcoords,
      offsetXcoords,
      COORDSUNIT_PX: COORDSUNIT_PX,
      COORDSUNIT_MM,
      COORD_COUNT
    };
    drawGrid(drawConfig);
    const rect = drawCoords(drawConfig);
    setState({
      type: 'rectObj',
      meta: rect
    })
  }

  /**
   * 重绘背景层
   */
  const reDrawBackground = () => {
    const { canvasObj } = state;
    const { cvWidth, cvHeight } = coordsInfo;
    //自适应屏幕进行重绘
    canvasObj.setDimensions({
      width: cvWidth,
      height: cvHeight
    });
    canvasObj.clear();
    drawBackground();
    state.checkList.forEach((item: any) => {
      abjustBeautySize(item);
      canvasObj.add(item);
    });
    zoomFit();
    canvasObj.renderAll();
    saveCvData();
  }

  /**
   * 设置坐标轴偏移值
   */
  const setCoordsOffset = async () => {
    if (node.current) {
      const { COORD_COUNT, COORDSUNIT_PX, canvasObj } = state;
      const { cvWidth, cvHeight } = coordsInfo;
      const xOffset = Math.ceil(cvWidth / 2 - COORD_COUNT * COORDSUNIT_PX / 2);
      const yOffset = Math.ceil(cvHeight / 2 - COORD_COUNT * COORDSUNIT_PX / 2);
      setState({
        type: 'offsetXcoords',
        meta: xOffset
      })
      setState({
        type: 'offsetYcoords',
        meta: yOffset
      })
      dispatch(setCoordsInfo({
        offsetXcoords: xOffset + BEAUTY_OFFSET,
        offsetYcoords: yOffset + BEAUTY_OFFSET,
      }))
    }
  }


  /**
   * 调整canvas 尺寸
   */
  const setCvSize = async () => {
    const currentClientWidth = document.documentElement.clientWidth;
    const cvWidth = (
      currentClientWidth - RIGHT_SIDER_WIDTH - LEFT_SIDER_WIDTH - 2 * CONTAINER_MARGIN + 4
    );
    const currentClientHeight = document.documentElement.clientHeight;
    const cvHeight = (
      currentClientHeight - NAVBAR_HEIGHT - 2 * CONTAINER_MARGIN - WORKSPACE_HEADERTOOL_HEIGHT
    );

    dispatch(setCoordsInfo({
      cvWidth,
      cvHeight,
    }))
  }

  const throttledResize = _throttle(() => {
    const { canvasObj } = state;
    if (!canvasObj) return
    setCvSize();
    const initZoom = changeDecimal(canvasObj.width * 1 / 2 / mm2px(moozVersion), 1);
    canvasObj.zoomToPoint({ x: (canvasObj.width) / 2, y: (canvasObj.height) / 2 }, initZoom);
  }, 100, { 'trailing': true });

  const removeObjFromCheckList = (id: string) => {
    state.checkList.forEach((item, index) => {
      if (item.id === id) {
        state.checkList.splice(index, 1)
        setState({
          type: 'checkList',
          meta: [...state.checkList]
        })
      }
    });
  }


  const deleteTarget = () => {
    const { handleTarget, currentPic, currentText, canvasObj } = state;
    const trueTarget = handleTarget || activeObj || currentPic || currentText;
    canvasObj.remove(trueTarget);
    canvasObj.renderAll();
    removeObjFromCheckList(trueTarget.id);
    Object.assign(state, {
      handleTarget: null,
      currentPic: null,
      currentText: null,
    })
    if (trueTarget.id && trueTarget.id.includes('image')) {
      clearsFileInfo();
    }
  }

  const flipTarget = (key: string) => {
    const { handleTarget } = state;
    const direction = key === '1' ? 'X' : 'Y';
    handleTarget[`flip${direction}`] = !handleTarget[`flip${direction}`];
  }

  const alignCenter = () => {
    const { handleTarget } = state;
    handleTarget.center();
  }

  const resetTarget = () => {
    const { handleTarget } = state;
    if (handleTarget) {
      setShowMenu(false)
      abjustBeautySize(handleTarget);
      handleTarget.set({
        angle: 0,
        borderColor: '#1535f7',
      }).setCoords();
    }
  }

  const clickMenu = (key: string) => {
    const { handleTarget, canvasObj } = state;
    const menuOperations = [
      deleteTarget,
      flipTarget,
      flipTarget,
      alignCenter,
      resetTarget
    ];
    handleTarget && menuOperations[key](key);
    setShowMenu(false)
    canvasObj.renderAll();
    saveCvData();
    collisionDetection();
  }

  const clearAidsBg = () => {
    const { canvasObj } = state;
    canvasObj.remove(state.aidsBg);
    canvasObj.renderAll();
  }

  const createAidsBg = () => {
    const { canvasObj, offsetXcoords, offsetYcoords } = state;
    const actuallySize = moozVersion === '200' ? '190' : moozVersion
    if (!canvasObj) return
    fabric.Image.fromURL(visualAidsUrl, (aidsBg: any) => {
      setState({
        type: 'aidsBg',
        meta: aidsBg
      })
      canvasObj.add(aidsBg);
      canvasObj.sendToBack(aidsBg);
      canvasObj.renderAll();
    }, {
      selectable: false,
      selection: false,
      left: offsetXcoords,
      top: canvasObj.height - offsetYcoords - mm2px(actuallySize),
      hoverCursor: 'default'
    });
  }

  const deleteKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 46 && activeObj) {
      deleteTarget();
      state.canvasObj.renderAll();
      saveCvData();
      // collisionDetection();
    } else if (e.ctrlKey === true && e.keyCode === 90) {
      drawback();
    }
  }

  /**
   * 回退功能
   */
  const drawback = () => {
    const { canvasObj } = state;
    const jsonData = saveJSON.data[saveJSON.index] || '';
    const prevJsonData = saveJSON.data[saveJSON.index + 1];
    if (jsonData && prevJsonData) {
      saveJSON.data.shift();
      canvasObj.clear();
      state.checkList.length = 0;
      canvasObj.loadFromJSON(saveJSON.data[saveJSON.index], () => {
        dispatch(setSaveJSON(Object.assign(saveJSON, { data: saveJSON.data })));
        collisionDetection();
      }, (o: any, object: any) => {
        if (!/image|text/.test(object.id)) {
          object.set({
            selectable: false,
            selection: false,
            hoverCursor: 'default'
          });
        } else {
          state.checkList.push(object);
          setState({
            type: 'checkList',
            meta: [...state.checkList]
          })
          bindSelectedEvent(object);
        }
      });
      canvasObj.renderAll();
    }
  }

  const isLaserPage = useMemo(() => {
    return location.pathname === '/laser'
  }, [location.pathname])

  useEffect(() => {
    fabric.Object.prototype.set({
      borderColor: '#1535f7',
      cornerColor: '#999999',
      cornerSize: 8,
      cornerStyle: "circle"
    });
    setState({
      type: 'COORD_COUNT',
      meta: moozVersion / COORDSUNIT_MM
    })
  }, [])

  useEffect(() => {
    collisionDetection();
  }, [state.checkList, state.rectObj])

  useEffect(() => {
    state.canvasObj ? reDrawBackground() : initFabric();
  }, [coordsInfo.offsetXcoords, coordsInfo.offsetYcoords])

  useEffect(() => {
    setCoordsOffset();
  }, [coordsInfo.cvWidth, coordsInfo.cvHeight, state.COORD_COUNT])

  useEffect(() => {
    if (state.canvasObj) {
      drawBackground();
      zoomFit();
    }
  }, [state.canvasObj])

  useEffect(() => {
    bindCvEvent();
    return removeCvEvent
  }, [state.rectObj, state.checkList])

  useEffect(() => {
    window.addEventListener('keydown', deleteKeyDown);
    return () => {
      window.removeEventListener('keydown', deleteKeyDown);
    }
  })

  useEffect(() => {
    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
    }
  }, [state.canvasObj])

  useEffect(() => {
    if (location.pathname === '/laser') {
      if (!state.canvasObj) {
        setCvSize()
      }
    }
  }, [location.pathname])

  useEffect(() => {
    state.aidsBg && clearAidsBg();
    createAidsBg();
  }, [visualAidsUrl])

  useEffect(() => {
    laserFileInfo.url && changeBeauty()
  }, [laserFileInfo.url])

  useEffect(() => {
    updateMoozVersion();
  }, [moozVersion])

  useEffect(() => {
    //矢量图图片类型切换
    const objStateChange = subscribe('objStateChange', (msg: string, data: { key: string, value: number }) => {
      isLaserPage && changeObjState(data.value, data.key)
    })
    //参数变化
    const optionChange = subscribe('changeLaserOption', (msg: string, data: any) => {
      isLaserPage && changeOption(data.key, data.value)
    })
    //矢量图图片类型切换
    const toggleBeautyType = subscribe('toggleBeautyType', (msg: string, data: string) => {
      isLaserPage && changeBeautyType(data)
    })
    //滤镜变化
    const filterChange = subscribe('filterChange', (msg: string, data: { [index: string]: boolean }) => {
      isLaserPage && changeBeautyFilter(data)
    })
    //文本变化
    const onChangeText = subscribe('changeText', (msg: string, data: any) => {
      isLaserPage && changeText(data)
    })
    //插入文本
    const onInsertText = subscribe('insertText', (msg: string, data: {
      text: string,
      x: number,
      y: number,
      scale: number,
      active: boolean,
      textType: string
    }) => {
      isLaserPage && insertText(data)
    })
    return () => {
      unsubscribe(objStateChange)
      unsubscribe(optionChange)
      unsubscribe(toggleBeautyType)
      unsubscribe(filterChange)
      unsubscribe(onChangeText)
      unsubscribe(onInsertText)
    }
  })

  const { cvWidth, cvHeight } = coordsInfo;

  return (
    <div
      style={{ position: 'relative', height: 'calc(100vh - 120px)', flex: 1 }}
      ref={node}
    >
      {
        cvWidth && cvWidth !== 0 ? <div>
          <canvas
            id="bitmap-cv" width={cvWidth} height={cvHeight}
          />
        </div> : 0
      }
      <ContextMenu
        isShow={showMenu} position={menuPosition} clickMenu={clickMenu}
      />
    </div>
  )
}

export default forwardRef(LaserVisualizer);