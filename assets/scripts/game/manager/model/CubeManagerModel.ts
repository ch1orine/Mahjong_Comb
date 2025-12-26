import { _decorator, Component, Node } from "cc";
import { Cube } from "../../cube/Cube";
import { EventBus } from "../../../event/EventBus";
import { CubeEvent } from "../../cube/CubeEvent";
import { JumpEvent } from "../../jump/JumpEvent";
import { Sound } from "../../../sound/Sound";
const { ccclass } = _decorator;

@ccclass("CubeManagerModel")
export class CubeManagerModel {
  cubes: Cube[] = [];

  private _map: number[][];

  private _barMap:number[] = [47, 51, 45, 39, 21];

  public readonly SIZE: number = 100;

  public readonly OFFSET_COL: number = 3;
  
  public readonly OFFSET_ROW: number = 4;

  public readonly MOVE_TOLERANCE: number = 40;


  public get map(): number[][] {
    return this._map;
  }

   
  constructor() {
    this._map = [
      [46, 47, 47, 46, 46, 52, 22],
      [25, 52, 54, 47, 31, 32, 52],
      [25, 25, 42, 52, 47, 45, 22],
      [25, 32, 25, 45, 45, 47, 53],
      [22, 51, 22, 34, 53, 47, 22],
      [32, 47, 47, 47, 47, 47, 51],
      [51, 54, 34, 53, 32, 42, 43],
      [22, 51, 53, 25, 52, 52, 43],
      [25, 53, 32, 32, 51, 31, 42],
      [25, 46, 32, 54, 31, 46, 45],
    ];
  }

  /** 获取格子值
   * @param row 横坐标
   * @param col 纵坐标
   * @returns 格子值
   */
  getMapValue(row: number, col: number): number {
    if (
      col < 0 ||
      col >= this._map[0].length ||
      row < 0 ||
      row >= this._map.length
    ) {
      return -1;
    }
    return this._map[row][col];
  }

  /** 更新格子值
   * @param row 
   * @param col 
   * @param value 
   * @returns 
   */
  updateMapValue(row: number, col: number, value: number = 0) {
    if (
      col < 0 ||
      col >= this._map[0].length ||
      row < 0 ||
      row >= this._map.length
    ) {
      // console.error("GridMap update: Invalid coordinates");
      return;
    }
    this._map[row][col] = value;
  }

  /** 更新格子值
   * @param cube
   * @param value 
   * @returns 
   */
  updateMapValueByCube(cube: Cube, value: number = 0) {
    this.updateMapValue(cube.model.row, cube.model.col, value);
  }

  getCube(row: number, col: number): Cube {
    return this.cubes.find((cube) => cube.model.row === row && cube.model.col === col);
  }

  getCubesById(id: number): Cube[] {
    return this.cubes.filter((cube) => cube.model.id === id);    
  }

  removeCube(cube: Cube) {
    const index = this.cubes.indexOf(cube);
    if (index > -1) {
      this.cubes.splice(index, 1);
    }
    if(this.checkIsBar(cube.model.id)) {      
      cube.flyAnim();      
    }
    else {      
      cube.destroyAnim();
      Sound.ins.playOneShot(Sound.effect.line);
    }
    
    if (cube.node.name === "cube_16") {
      EventBus.instance.emit(CubeEvent.CanDrag);
    }
    cube.clearEvent();
    EventBus.instance.emit(JumpEvent.onJump);
  }

  checkIsBar(val: number): boolean {
    return this._barMap.includes(val);
  }  
  
}
