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
        if (this.model.map[r][c] === -1) continue;
        this.bll.createCube(this, {
          id: this.model.map[r][c],
          row: r,
          col: c,
        });
      }
    }
  }

  /** 批量移除多个cube */
  public removeCubes(cubes: Cube[]) {
    // 按列分组
    const columnMap = new Map<number, Cube[]>();
    for (const cube of cubes) {
      const col = cube.model.col;
      if (!columnMap.has(col)) {
        columnMap.set(col, []);
      }
      columnMap.get(col)!.push(cube);
    }
    
    // 对每一列统一处理
    for (const [col, cubesToRemove] of columnMap.entries()) {
      // 收集该列所有剩余cube（排除要移除的）
      const columnCubes = this.model.cubes.filter(c => 
        c.model.col === col && !cubesToRemove.includes(c)
      );
      
      // 移除所有目标cube
      for (const cube of cubesToRemove) {
        this.model.removeCube(cube);
      }
      
      // 整理该列数据，获取需要填充的数量
      const emptyCount = this.model.compactColumn(col);
      
      // 按当前row排序（从小到大，即从上到下）
      columnCubes.sort((a, b) => a.model.row - b.model.row);
      
      // 更新现有cube的行坐标到新位置（从底部开始填充）
      let newRowIndex = this.model.map.length - columnCubes.length;
      for (const c of columnCubes) {
        c.model.row = newRowIndex;
        newRowIndex++;
      }
      
      // 先生成新cube（在顶部上方待命）
      const newCubes: any[] = [];
      for (let i = 0; i < emptyCount; i++) {
        const row = i;
        const id = this.model.getRandomCubeId();
        this.model.updateMapValue(row, col, id);
        newCubes.push({ row, col, id });
      }
      
      // 延迟一帧后，同步触发所有cube（旧的+新的）的下落动画
      setTimeout(() => {
        // 1. 先创建新cube（在上方）
        for (let i = 0; i < newCubes.length; i++) {
          this.bll.createCube(this, newCubes[i], i);
        }
        
        // 2. 同步更新该列所有cube的位置（包括原有的下落到新位置）
        setTimeout(() => {
          this.updateColumnView(col);
        }, 100);
      }, 50);
    }
  }

  public removeCube(cube: Cube) {
    const col = cube.model.col;
    
    // 先收集该列所有cube（按它们当前的col过滤，不包括要移除的）
    const columnCubes = this.model.cubes.filter(c => c.model.col === col && c !== cube);
    
    // 移除目标cube
    this.model.removeCube(cube);
    
    // 整理该列数据，获取需要填充的数量
    const emptyCount = this.model.compactColumn(col);
    
    // 按当前row排序（从小到大，即从上到下）
    columnCubes.sort((a, b) => a.model.row - b.model.row);
    
    // 更新现有cube的行坐标到新位置（从底部开始填充）
    let newRowIndex = this.model.map.length - columnCubes.length;
    for (const c of columnCubes) {
      c.model.row = newRowIndex;
      newRowIndex++;
    }    
    // 先生成新cube（在顶部上方待命）
    const newCubes: any[] = [];
    for (let i = 0; i < emptyCount; i++) {
      const row = i;
      const id = this.model.getRandomCubeId();
      //固定设置
      if(col === 5){
        this.model.updateMapValue(row, col, 46);
      }else{
        this.model.updateMapValue(row, col, id);
        newCubes.push({ row, col, id });
      }
    }
    
    // 延迟一帧后，同步触发所有cube（旧的+新的）的下落动画
    setTimeout(() => {
      // 1. 先创建新cube（在上方）
      for (let i = 0; i < newCubes.length; i++) {
        this.bll.createCube(this, newCubes[i], i);
      }
      
      // 2. 同步更新该列所有cube的位置（包括原有的下落到新位置）
      setTimeout(() => {
        this.updateColumnView(col);
      }, 100);
    }, 50);
  }

  /** 更新指定列所有 Cube 的视图位置 */
  private updateColumnView(col: number) {
    for (let row = 0; row < this.model.map.length; row++) {
      const cube = this.model.getCube(row, col);
      if (cube) {
        const targetPos = this.bll.getPosByRowCol(this, row, col);
        cube.node.setSiblingIndex(row);
        cube.moveTo(targetPos);
      }
    }
  }

  private addEvents() {    
    EventBus.instance.on(CubeEvent.onShakeCube, this.onShakeCubes, this);

    // 监听 View 层注册事件
    EventBus.instance.on(CubeManagerEvent.RegisterView, this.setView, this);
  }


  private onShakeCubes(e:Cube) {
    // Sound.ins.playOneShot(Sound.effect.shake);  
    // const cube = node.getComponent(Cube);
    const id = e.model.id || 0;
    const cubes = this.model.getCubesById(id);
    cubes.forEach((cube)=>{
      cube.activeMask(false);
      cube.shakeAnim();
    });
  }
}
