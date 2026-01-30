import {
  _decorator,
  Component,
  instantiate,  
  Prefab,
  resources,
  find,
  v3,
  Vec3,
  view,
  math,
  EventTouch,
  Sprite,
} from "cc";
import { CubeManager } from "../CubeManager";
import { Cube } from "../../cube/Cube";
import { EventBus } from "../../../event/EventBus";
import { CubeManagerEvent } from "../CubeManagerEvent";
import { EffectEvent } from "../../../effect/EffectEvent";
import { JumpEvent } from "../../jump/JumpEvent";
import { CubeEvent } from "../../cube/CubeEvent";
import { GuideEvent } from "../../guide/GuideEvent";
import { Sound } from "../../../sound/Sound";

const { ccclass, property } = _decorator;

@ccclass("CubeManagerBll")
export class CubeManagerBll  {
  
  private _size: math.Size = null;

  private _selectedCube: Cube = null;  // 选中的麻将

  private _originalPos: Vec3 = null;  // 记录原始位置

  private _id: number = 0;

  private _finished: boolean = false;

  private _guide: boolean = true;

  init(e: CubeManager) {
    this.addEvents(e); 
    this._size = view.getVisibleSize();   
  }


  public addEvents(e: CubeManager){
    EventBus.instance.on(CubeManagerEvent.TouchStart, (event: EventTouch) => this.onTouchStart(e, event), this);
    EventBus.instance.on(CubeManagerEvent.TouchMove, (event: EventTouch) => this.onTouchMove(e, event), this);
    EventBus.instance.on(CubeManagerEvent.TouchEnd, (event: EventTouch) => this.onTouchEnd(e, event), this);  
    // EventBus.instance.on(GuideEvent.ShowMask, (flag: boolean) => this.setMask(e, flag), this);
    // this.setMask(e, true); // 初始化时显示遮罩
  }


  private onTouchStart(e: CubeManager, event: EventTouch) {
    // console.log(event.target as Cube);
    EventBus.instance.emit(GuideEvent.StopShowGuide);
    EventBus.instance.emit(EventBus.StopTimer);   //阻断计时          
    const cube = event.target.getComponent(Cube);  
    if (cube && this._guide && (cube.node.name != "cube_11" || cube.getComponent(Sprite).spriteFrame.name != "0")) { 
      return;
    }
    if (cube) {
      Sound.ins.playOneShot(Sound.effect.click);
      this._selectedCube = cube;  // 清空之前的选择
      this._originalPos = cube.node.getPosition();  // 记录原始位置
      this.markCube(cube);
      this._id = cube.model.id;
    }    
  }

  private onTouchMove(e: CubeManager, event: EventTouch) {  
    if (!this._selectedCube) return;
    EventBus.instance.emit(EventBus.StopTimer);   //阻断计时

    const pos = event.getUILocation();    
    const node = this._selectedCube.node;
    node.setWorldPosition(pos.x, pos.y, 0);
    node.setSiblingIndex(999);  // 确保在最上层显示         
  }

  private onTouchEnd(e: CubeManager, event: EventTouch) {
    if (!this._selectedCube) return;
    // console.log(this._selectedCube.getComponent(Sprite).spriteFrame.name == "0");
    // console.log(this._selectedCube.node.name);
    // if (this._selectedCube.node.name == "cube_11" && this._selectedCube.getComponent(Sprite).spriteFrame.name == "0") {
    //   EventBus.instance.emit(EventBus.UpdateTimer); //恢复计时
    // }
    const pos = event.getUILocation();
    const centerPos = this.uiToCenterOrigin(pos.toVec3());
    
    // 尝试找到最近的格子
    let nearestGrid: { row: number; col: number } | null = null;
    let minDistance = Infinity;
    
    // 遍历所有格子，找到最近的
    for (let row = 0; row < e.model.map.length; row++) {
      for (let col = 0; col < e.model.map[row].length; col++) {
        const gridPos = this.getPosByRowCol(e, row, col);
        const distanceSq = Vec3.squaredDistance(centerPos, gridPos);
        const distance = Vec3.distance(centerPos, gridPos);
        
        if (distanceSq < minDistance) {
          minDistance = distanceSq;
          nearestGrid = { row, col };
        }
      }
    }
    if (this._selectedCube.node.name == "cube_11" && this._selectedCube.getComponent(Sprite).spriteFrame.name == "0") {      
       if (nearestGrid.col != 3 || nearestGrid.row != 3) {
        this._selectedCube.moveTo(this._originalPos);
        this._selectedCube = null;
        this._originalPos = null;
        EventBus.instance.emit(EventBus.UpdateTimer); //恢复计时        
        return;
      }
    }
    
    // 判断是否在吸附距离内且该位置为空或是原位置
    if (nearestGrid && minDistance < e.model.MOVE_TOLERANCE) {      
      const targetCube = e.model.getCube(nearestGrid.row, nearestGrid.col);
      const isOriginalPos = (nearestGrid.row === this._selectedCube.model.row && 
                            nearestGrid.col === this._selectedCube.model.col);
      
      if (!targetCube || isOriginalPos) {
        // 合法位置：吸附到最近的格子
        if (!isOriginalPos) {
          // 更新model中的map数据
          e.model.updateMapValueByCube(this._selectedCube, -1); // 清空原位置
          this._selectedCube.model.row = nearestGrid.row;
          this._selectedCube.model.col = nearestGrid.col;
          e.model.updateMapValueByCube(this._selectedCube, this._selectedCube.model.id); // 设置新位置
          
          this._selectedCube.node.setSiblingIndex(nearestGrid.col + nearestGrid.row * 5); // 设置层级
          // 移动到目标位置
          const targetPos = this.getPosByRowCol(e, nearestGrid.row, nearestGrid.col);
          const movedCube = this._selectedCube; // 保存引用，因为 this._selectedCube 会被清空
          this._selectedCube.moveTo(targetPos, () => {
            // 回调不接收参数，直接使用闭包中的变量
            this.combineCubes(e, movedCube);
          });
          
        } else {
          // 回到原位置，也移动一下
          const targetPos = this.getPosByRowCol(e, nearestGrid.row, nearestGrid.col);
          this._selectedCube.moveTo(targetPos);
        }
      } else {
        // 非法位置：回退到原位置
        this._selectedCube.moveTo(this._originalPos);
      }
    } else {
      // 距离太远：回退到原位置
      this._selectedCube.moveTo(this._originalPos);
    }
    
    // 清空选择
    this._selectedCube = null;
    this._originalPos = null;
  }
  

  /** 创建麻将实体
   * @param e CubeManager实例
   * @param data 麻将数据
   * @param offsetIndex 从顶部掉落时的偏移索引（用于错开生成位置）
   */
  public createCube(e: CubeManager, data: any, offsetIndex: number = -1) {    
    resources.load(`cube/cube`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
        return;
      }
      const node = instantiate(prefab);
      node.name = `cube_${data.row * 8 + data.col}`;
      const cube = node.getComponent(Cube);
      node.parent = find("gui/game/LayerGame");
      cube.model.id = data.id;
      cube.model.row = data.row;
      cube.model.col = data.col;
      cube.view.candrag = false;
      
      const targetPos = this.getPosByRowCol(e, data.row, data.col);
      
      if (offsetIndex >= 0) {
        // 从顶部掉落：初始位置在屏幕上方，根据索引错开
        const startPos = v3(
          targetPos.x,
          targetPos.y + e.model.SIZE * (e.model.map.length + offsetIndex), // 在屏幕上方
          0
        );
        cube.load(find("gui/game/LayerGame"), startPos);
        // cube.activeMask(true);
      } else {
        // 正常加载到目标位置
        cube.load(find("gui/game/LayerGame"), targetPos);
      }
            
      e.model.cubes.push(cube);
    });
  }
    

  private uiToCenterOrigin(uiPos: Vec3): Vec3 {     
    return v3(uiPos.x - this._size.width / 2, uiPos.y - this._size.height / 2, 0);
  }

  /**
   * 将 UI 坐标（左下角为原点）转换为网格索引（row, col）
   */
  private uiPosToGrid(e: CubeManager, uiPos: Vec3): { row: number; col: number } | null {
    const centerPos = this.uiToCenterOrigin(uiPos);
    const SIZE = e.model.SIZE;
    const OFFSET_COL = e.model.OFFSET_COL;
    const OFFSET_ROW = e.model.OFFSET_ROW;

    const col = Math.floor((centerPos.x + SIZE / 2) / SIZE) + OFFSET_COL;
    const row = OFFSET_ROW - Math.floor((centerPos.y + SIZE / 2) / SIZE);

    const rows = e.model.map.length;
    const cols = e.model.map[0].length;
    if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
    return { row, col };
  }


  /** 标记一个 cube，若回到倒数第二个位置则取消最后一个的标记（撤销） */
  private markCube(cube: Cube) {
    // const len = this._selectedCube.length;
    
    // // 如果当前cube是倒数第二个（回溯），则取消最后一个的标记
    // if (len >= 2 && this._selectedCube[len - 2] === cube) {
    //   const last = this._selectedCube.pop();
    //   EventBus.instance.emit(EffectEvent.LineRemove);
    //   if (last) {
    //     last.activeMask(false);
    //   }
    //   return;
    // }
    
    // // 去重：检查整个数组中是否已存在该cube
    // if (this._selectedCube.includes(cube)) {
    //   return;
    // }
    
    // // 邻接检测：必须与最后一个标记的cube相邻（8个方向）
    // if (len > 0) {
    //   const last = this._selectedCube[len - 1];
    //   if (!this.isAdjacent(last, cube)) {
    //     return; // 不相邻则不标记
    //   }
    // }
    
    // // 正常标记
    // this._selectedCube.push(cube);
    // cube.activeMask(true);
    // cube.selectAnim();    
    // const newLen = this._selectedCube.length;
    // Sound.ins.playOneShot(Sound.effect.click);
    // if(newLen >= 2){
    //   EventBus.instance.emit(EffectEvent.Line, this._selectedCube[newLen - 2].node.getPosition() ,cube.node.getPosition());
    // }
  }

  /** 检测两个 cube 是否相邻（8个方向：上下左右+4个对角） */
  private isAdjacent(cube1: Cube, cube2: Cube): boolean {
    const dRow = Math.abs(cube1.model.row - cube2.model.row);
    const dCol = Math.abs(cube1.model.col - cube2.model.col);
    // 相邻定义：行列差值都 <= 1，且不是同一个格子
    return dRow <= 1 && dCol <= 1 && !(dRow === 0 && dCol === 0);
  }

  /** 根据行列计算位置坐标（供 CubeManager 调用） */
  public getPosByRowCol(e: CubeManager, row: number, col: number): Vec3 {
    // 每2行/列中间有间隔
    const colGap = Math.floor(col / 2) * e.model.SIZE;
    const rowGap = Math.floor(row / 2) * e.model.SIZE;
    
    // console.log("getPosByRowCol", colGap, rowGap);
    return v3(
      (col - e.model.OFFSET_COL) * e.model.SIZE + e.model.COL_GAP * Math.floor(col /2), 
      (e.model.OFFSET_ROW - row) * e.model.SIZE - e.model.ROW_GAP * Math.floor(row / 2),
      0
    );
  }
  

  /** 检查并合并2x2区域的cube
   * @param e CubeManager实例
   * @param cube 触发合并检查的cube
   */
  private combineCubes(e: CubeManager, cube: Cube) {
    const map = e.model.map;
    const rows = map.length;
    const cols = map[0].length;
    
    // 遍历所有可能的2x2区域（每个区域左上角坐标为偶数行偶数列）
    for (let regionRow = 0; regionRow < 3; regionRow++) {
      for (let regionCol = 0; regionCol < 3; regionCol++) {
        const startRow = regionRow * 2;
        const startCol = regionCol * 2;
        
        // console.log(`检查区域 [${startRow},${startCol}]`);
        
        // 检查这个2x2区域是否满足合成条件
        if (this.checkRegionForMerge(e, startRow, startCol)) {
          // console.log(`✓ 区域 [${startRow},${startCol}] 满足合成条件！`);
          
          // 获取区域的值
          const value = map[startRow][startCol];
          
          // 收集该区域的4个cube
          const cubesToRemove: Cube[] = [];
          for (let r = startRow; r < startRow + 2; r++) {
            for (let c = startCol; c < startCol + 2; c++) {
              const cubeToRemove = e.model.getCube(r, c);
              if (cubeToRemove) {
                cubesToRemove.push(cubeToRemove);
              }
            }
          }
          
          // 消除4个cube
          for (const cubeToRemove of cubesToRemove) {
            e.model.removeCube(cubeToRemove);
            cubeToRemove.shakeAnim(() => {
              cubeToRemove.scaleAnim();
              cubeToRemove.moveTo(cube.node.getPosition(), () => {
              cubeToRemove.node.active = false;
            });});
            // cubeToRemove.destroyAnim();
          }
          
          // 更新map：将该2x2区域全部设为-1
          for (let r = startRow; r < startRow + 2; r++) {
            for (let c = startCol; c < startCol + 2; c++) {
              e.model.updateMapValue(r, c, -1);
            }
          }
          
          if(this._guide){
            this._guide = false;
          }
          EventBus.instance.emit(JumpEvent.onJump); // 触发跳跃事件
          // Sound.ins.playOneShot(Sound.effect.pair);
          // 在传入cube的位置生成新cube
          const newId = this.getUpgradedId(value);
          setTimeout(() => {
            this.createCube(e, {
              id: newId,
              row: cube.model.row,
              col: cube.model.col
            });
            Sound.ins.playOneShot(Sound.effect.pair);
            e.model.updateMapValue(cube.model.row, cube.model.col, newId);
            EventBus.instance.emit(EventBus.AddScore);  // 增加分数
            EventBus.instance.emit(EffectEvent.ShowBoom, cube.node.getWorldPosition());            
            EventBus.instance.emit(EventBus.StopTimer);   //阻断计时
          }, 700);
          
        }
      }
    }
  }
  
  /** 检查2x2区域是否满足合成条件
   * @param e CubeManager实例
   * @param startRow 区域起始行
   * @param startCol 区域起始列
   * @returns 是否满足合成条件
   */
  private checkRegionForMerge(e: CubeManager, startRow: number, startCol: number): boolean {
    const map = e.model.map;
    
    // 获取2x2区域的4个值
    const values: number[] = [];
    for (let r = startRow; r < startRow + 2; r++) {
      for (let c = startCol; c < startCol + 2; c++) {
        if (r >= map.length || c >= map[0].length) {
          return false;
        }
        values.push(map[r][c]);
      }
    }
    
    // console.log(`检查区域 [${startRow},${startCol}] 的值:`, values);
    
    // 检查：4个值必须相同且不能为-1
    const firstValue = values[0];
    if (firstValue === -1 ) {
      // console.log(`区域 [${startRow},${startCol}] 第一个值为 ${firstValue}，不满足条件`);
      return false;
    }
    
    const allSame = values.every(v => v === firstValue);
    // console.log(`区域 [${startRow},${startCol}] 是否全部相同: ${allSame}`);
    
    return allSame;
  }
  
  /** 获取升级后的cube id（根据游戏规则定义）
   * @param currentId 当前id
   * @returns 升级后的id
   */
  private getUpgradedId(currentId: number): number {
    // 根据游戏规则返回升级后的id，这里简单返回+1
    // 实际可能需要一个映射表
    return math.clamp(currentId + 1, 1, 8);
  }


  /** 根据行和列获取cube的位置
   * @param e CubeManager实例
   * @param row 行
   * @param col 列
   * @returns cube的位置
   */  
  private setMask(e: CubeManager, boolean: boolean) {
    for (const cube of e.model.cubes) {
      cube.node.children[0].active = boolean;
    }
  }
}
