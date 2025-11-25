import { Block } from "../../block/Block";
export class BlockManagerModel {
  // blocks:
  blocks: Block[] = [];

  private _barrier: number[][];

  private _map: number[][];

  constructor() {
    this._barrier = [
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1,  1,  1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
    ];
    this._map = [
      [2, 8, 3, 1, 3, 3, 1, 1],
      [6, 7, 9, 4, 4, 5, 2, 8],
      [2, 8, 9, 6, 6, 4, 1, 8],
      [6, 3, 9, 1, 5, 4, 1, 9],
      [6, 5, 7, 5, 5, 7, 3, 7],
      [3, 5, 4, 6, 4, 3, 1, 9],
      [1, 8, 7, 3, 3, 3, 7, 4],
      [6, 5, 9, 5, 5, 4, 9, 4],
      [1, 8, 7, 2, 7, 8, 7, 6],
      [6, 5, 3, 6, 5, 5, 9, 8],
      [3, 2, 1, 7, 6, 5, 7, 8],
      [6, 5, 4, 3, 5, 7, 1, 9],
      [2, 3, 7, 2, 6, 1, 7, 7],
    ];
  }

  public get barrier(): number[][] {
    return this._barrier;
  }

  public get map(): number[][] {
    return this._map;
  }

  /** 获取格子值
   * @param row 横坐标
   * @param col 纵坐标
   * @returns 格子值
   */
  getBarrierValue(row: number, col: number): number {
    if (
      col < 0 ||
      col >= this._barrier[0].length ||
      row < 0 ||
      row >= this._barrier.length
    ) {
      console.error("GridBarrier getValue: Invalid coordinates");
      return -1;
    }
    return this._barrier[row][col];
  }

  /** 更新障碍格子值
   * @param row 横坐标
   * @param col 纵坐标
   * @param val 新值
   */
  updateBarrierValue(row: number, col: number) {
    if (row < 0 || row >= this._barrier.length ||col < 0 || col >= this._barrier[0].length) {
      console.error("GridBarrier update: Invalid coordinates");
      return;
    }
    this._barrier[row][col] = 1;    
  }

  /** 获取地图格子值
   * @param row
   * @param col
   * @returns
   */
  getMapValue(row: number, col: number): number {
    if (
      col < 0 ||
      col >= this._map[0].length ||
      row < 0 ||
      row >= this._map.length
    ) {
      console.error("GridMap getValue: Invalid coordinates");
      return -1;
    }
    return this._map[row][col];
  }

  /** 更新地图格子值
   * @param row 横坐标
   * @param col 纵坐标
   * @param val 新值
   */
  updateMapValue(row: number, col: number, val: number = 0) {    
    if (row < 0 || row >= this._map.length || col < 0 || col >= this._map[0].length) {
      console.error("GridMap update: Invalid coordinates");
      return;
    }
    this._map[row][col] = val;    
  }


    /** 获取索引砖块     
     * @param row 横坐标
     * @param col 纵坐标
     * @returns 砖块对象
     */
  getBlock(row: number, col: number): Block{
    return this.blocks.find(block=>block.model.row === row && block.model.col === col);
  }
}
