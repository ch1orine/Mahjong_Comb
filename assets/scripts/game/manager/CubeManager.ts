import { _decorator, Component, Node } from "cc";
import { CubeManagerBll } from "./bll/CubeManagerBll";
import { CubeManagerView } from "./view/CubeManagerView";
import { EventBus } from "../../event/EventBus";
import { CubeManagerEvent } from "./CubeManagerEvent";
import { CubeManagerModel } from "./model/CubeManagerModel";
import { CubeEvent } from "../cube/CubeEvent";
import { Cube } from "../cube/Cube";
import { Sound } from "../../sound/Sound";
const { ccclass, property } = _decorator;

@ccclass("CubeManager")
export class CubeManager {
  //数据层
  model!: CubeManagerModel;

  //业务层
  bll!: CubeManagerBll;

  //视图层
  view!: CubeManagerView;


/**
 *
 */
constructor() {
    this.model = new CubeManagerModel();
    this.bll = new CubeManagerBll();
    // CubeManagerView 会在场景加载时通过事件注册自己
}

  init() {
    this.generateBoardLayout();
    this.addEvents();
    this.bll.init(this);
  }

  /** 设置 View 层（由场景中的组件调用） */
  setView(view: CubeManagerView) {
    this.view = view;
  }

  public generateBoardLayout() {
    for (let r = 0; r < this.model.map.length; r++) {
      for (let c = 0; c < this.model.map[r].length; c++) {
        if (this.model.map[r][c] === 0) continue;
        this.bll.createCube(this, {
          id: this.model.map[r][c],
          row: r,
          col: c,
        });
      }
    }
  }

  private addEvents() {    
    EventBus.instance.on(CubeEvent.onShakeCube, this.onShakeCubes, this);
    // EventBus.instance.on(CubeEvent.onFollowCube, this.onFollowCube, this);
    // EventBus.instance.on(CubeEvent.onCubeDragEnd, this.onCubeDragEnd, this);
    // EventBus.instance.on(CubeEvent.onCubeReturn, this.onCubeReturn, this);
    // EventBus.instance.on(CubeEvent.CanDrag, this.CanDrag, this);
    // 监听 View 层注册事件
    EventBus.instance.on(CubeManagerEvent.RegisterView, this.setView, this);
  }


  private onShakeCubes(node:Node) {
    // Sound.ins.playOneShot(Sound.effect.shake);  
    const cube = node.getComponent(Cube);
    const id = cube?.model.id || 0;
    const cubes = this.model.getCubesById(id);
    cubes.forEach((cube)=>{
      cube.activeMask(false);
      cube.shakeAnim();
    });
  }

  // private CanDrag() {
  //   this.model.cubes.forEach((cube)=>{   
  //     cube.view.candrag = true;   
  //   });
  // }
}
