import { _decorator } from "cc";
import { Cube } from "../../cube/Cube";

const { ccclass } = _decorator;

@ccclass("CubeManagerModel")
export class CubeManagerModel {
  cubes: Cube[] = [];

  private _map: number[][];

  private _barMap:number[] = [47, 51, 45, 39, 21];

  public readonly SIZE: number = 110;

  public readonly OFFSET_COL: number = 2.65;
  
  public readonly OFFSET_ROW: number = 2.75;

  public readonly MOVE_TOLERANCE: number = 1600;

  public readonly COL_GAP: number = 16;
  
  public readonly ROW_GAP: number = 20;

  public get map(): number[][] {
    return this._map;
  }

   
  constructor() {
    this._map = [
      [ 6,  6,  1,  1,  8,  8],
      [ 6, -1,  1,  0, -1,  8],
      [ 7,  7,  0,  0,  4,  4],
      [ 7,  2,  0, -1,  3, -1],
      [ 3, -1,  2,  2, -1,  5],
      [-1,  4,  3, -1,  5,  5],         
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

  /** 移除麻将并记录列信息（不立即下落）
   * @param cube 
   * @returns 是否计分
   */
  removeCube(cube: Cube) {
    const index = this.cubes.indexOf(cube);
    if (index > -1) {
      this.cubes.splice(index, 1);
    }
    
    // 清空该位置的地图值
    const row = cube.model.row;
    const col = cube.model.col;
    this.updateMapValue(row, col, 0);
  }

  /** 整理指定列：将所有非空元素下沉，返回需要填充的数量
   * @param col 列索引
   * @returns 需要从顶部填充的cube数量
   */
  compactColumn(col: number): number {
    const nonEmptyValues: number[] = [];
    
    // 收集该列所有非空值
    for (let row = 0; row < this._map.length; row++) {
      if (this._map[row][col] !== 0) {
        nonEmptyValues.push(this._map[row][col]);
      }
    }
    
    // 清空该列
    for (let row = 0; row < this._map.length; row++) {
      this._map[row][col] = 0;
    }
    
    // 从底部开始填充非空值
    const startRow = this._map.length - nonEmptyValues.length;
    for (let i = 0; i < nonEmptyValues.length; i++) {
      this._map[startRow + i][col] = nonEmptyValues[i];
    }
    
    // 返回需要填充的空位数量
    return this._map.length - nonEmptyValues.length;
  }



  /** 获取指定列需要填充的空位数量（从顶部开始连续的0）
   * @param col 列索引
   * @returns 需要填充的数量
   */
  getEmptyCountInColumn(col: number): number {
    let count = 0;
    for (let row = 0; row < this._map.length; row++) {
      if (this._map[row][col] === 0) {
        count++;
      } else {
        break; // 遇到非空则停止计数
      }
    }
    return count;
  }

  /** 生成随机 cube ID（从现有地图中随机选取）
   * @returns cube ID
   */
  getRandomCubeId(): number {
    const allIds = this._map.flat().filter(id => id > 0);
    return allIds[Math.floor(Math.random() * allIds.length)];
  }


  
}
