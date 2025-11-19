import { EventBus } from "../../event/EventBus";
import { GridBoardConfig, GridConfig, CellConfig } from "./BlockData";
import {
  Node,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec3,
  resources,
  tween,
} from "cc";

/**
 * 棋盘状态管理类
 * 负责追踪哪些格子已被占用，类似俄罗斯方块的碰撞检测
 */
export class BoardManager {
  // 棋盘状态：-1表示空，>= 0表示被占用
  private _grid: number[][];

  // 棋盘格子节点映射 [row][col] -> Node
  public cellNodes: (Node | null)[][] = [];

  private _clearedRows: number[] = [];

  constructor() {
    this._grid = [];
    for (let r = 0; r < GridBoardConfig.length; r++) {
      this._grid[r] = [];
      this.cellNodes[r] = [];
      for (let c = 0; c < GridBoardConfig[0].length; c++) {
        this._grid[r][c] = GridBoardConfig[r][c]; // -1 表示空格子
        this.cellNodes[r][c] = null;
      }
    }
    EventBus.instance.on(
      EventBus.WipeEffectDone,
      this.updateGridAfterClear,
      this
    );
    // console.log(this.cellNodes);
  }

  /**
   * 检查指定形状能否放置在指定位置
   * @param shapeMap 形状数组 (1表示有方块，0表示空)
   * @param gridRow 目标行索引 (0-7)
   * @param gridCol 目标列索引 (0-7)
   * @returns 是否可以放置
   */
  public canPlaceShape(
    shapeMap: number[][],
    gridRow: number,
    gridCol: number
  ): boolean {
    if (!shapeMap || shapeMap.length === 0) return false;

    const shapeRows = shapeMap.length;

    // 遍历形状的每个cell
    for (let r = 0; r < shapeRows; r++) {
      const row = shapeMap[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== 1) continue; // 跳过空格

        // 计算该cell在棋盘上的实际位置
        const boardRow = gridRow + r;
        const boardCol = gridCol + c;

        // 检查是否越界
        if (
          boardRow < 0 ||
          boardRow >= GridConfig.ROWS ||
          boardCol < 0 ||
          boardCol >= GridConfig.COLS
        ) {
          return false;
        }

        // 检查该位置是否已被占用
        if (this._grid[boardRow][boardCol] !== -1) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 在指定位置放置形状
   * @param shapeMap 形状数组
   * @param gridRow 目标行索引
   * @param gridCol 目标列索引
   * @param blockId 方块ID（用于标记占用）
   */
  public placeShape(
    shapeMap: number[][],
    gridRow: number,
    gridCol: number,
    blockId: number
  ): void {
    const shapeRows = shapeMap.length;

    for (let r = 0; r < shapeRows; r++) {
      const row = shapeMap[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== 1) continue;

        const boardRow = gridRow + r;
        const boardCol = gridCol + c;

        if (
          boardRow >= 0 &&
          boardRow < GridConfig.ROWS &&
          boardCol >= 0 &&
          boardCol < GridConfig.COLS
        ) {
          this._grid[boardRow][boardCol] = blockId;
        }
      }
    }
  }

  /**
   * 移除指定方块
   * @param blockId 方块ID
   */
  public removeBlock(blockId: number): void {
    for (let r = 0; r < GridConfig.ROWS; r++) {
      for (let c = 0; c < GridConfig.COLS; c++) {
        if (this._grid[r][c] === blockId) {
          this._grid[r][c] = -1;
        }
      }
    }
  }

  /**
   * 清空棋盘
   */
  public clear(): void {
    for (let r = 0; r < GridConfig.ROWS; r++) {
      for (let c = 0; c < GridConfig.COLS; c++) {
        this._grid[r][c] = -1;
      }
    }
  }

  /**
   * 获取棋盘状态（用于调试）
   */
  public getGrid(): number[][] {
    return this._grid.map((row) => [...row]);
  }

  /**
   * 设置格子节点引用
   * @param row 行索引
   * @param col 列索引
   * @param node 节点引用
   */
  public setCellNode(row: number, col: number, node: Node | null): void {
    if (
      row >= 0 &&
      row < GridConfig.ROWS &&
      col >= 0 &&
      col < GridConfig.COLS
    ) {
      this.cellNodes[row][col] = node;
    }
  }

  /**
   * 获取格子节点
   * @param row 行索引
   * @param col 列索引
   */
  public getCellNode(row: number, col: number): Node | null {
    if (
      row >= 0 &&
      row < GridConfig.ROWS &&
      col >= 0 &&
      col < GridConfig.COLS
    ) {
      return this.cellNodes[row][col];
    }
    return null;
  }

  /**
   * 检查是否有完整的行或列可以消除
   */
  public checkAndClearLines(shapeColor: string): number[] {
    this._clearedRows = [];
    const clearedCols: number[] = [];

    // 检查行
    for (let r = 0; r < GridConfig.ROWS; r++) {
      if (this._grid[r].every((cell) => cell !== -1)) {
        this._clearedRows.push(r);

        this.cellNodes[r].forEach((cell) => {
          cell.getComponent(Sprite).spriteFrame = resources.get(
            `images/blocks/${shapeColor}/spriteFrame`
          ) as SpriteFrame;

          // cell.removeFromParent();
          // cell.destroy();
        });

        // 清除该行
        for (let c = 0; c < GridConfig.COLS; c++) {
          this._grid[r][c] = -1;
        }

        //表现效果
        // this.updateGridAfterClear();
      }
    }

    // 先执行从左到右依次消除效果
    setTimeout(() => {
      this.clearCellsWithDelay();
    }, 50);

    // 检查列
    // for (let c = 0; c < GridConfig.COLS; c++) {
    //   let isFull = true;
    //   for (let r = 0; r < GridConfig.ROWS; r++) {
    //     if (this._grid[r][c] === -1) {
    //       isFull = false;
    //       break;
    //     }
    //   }
    //   if (isFull) {
    //     clearedCols.push(c);
    //     // 清除该列
    //     for (let r = 0; r < GridConfig.ROWS; r++) {
    //       this._grid[r][c] = -1;
    //     }
    //   }
    // }

    return this._clearedRows;
  }

  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 从左到右依次消除cell
   */
  private async clearCellsWithDelay(): Promise<void> {
    for (let c = 0; c < GridConfig.COLS; c++) {
      for (let r = 0; r < this._clearedRows.length; r++) {
        const cell = this.cellNodes[this._clearedRows[r]][c];
        if (cell) {
          cell.removeFromParent();
          cell.destroy();
        }
      }
      // 等待一小段时间再消除下一列
      await this.delay(90); // 50毫秒延迟,可根据需要调整
    }
  }

  public async updateGridAfterClear(): Promise<void> {
    // const COLS = GridConfig.COLS;
    // return;
    let up: number[] = [];
    let down: number[] = [];
    const half = this._clearedRows.length / 2; //0 1 2   3
    for (let i = 0; i < this._clearedRows.length; i++) {
      if (i < half) {
        up.push(this._clearedRows[i]);
      } else {
        down.push(this._clearedRows[i]);
      }
    }
    // 下落逻辑：从被清除的行开始，向下移动所有行
    for (let clearedRow of up) {
      // 从清除的行向上遍历
      for (let r = clearedRow; r > 0; r--) {
        for (let c = 0; c < GridConfig.COLS; c++) {
          // 更新数据层：将上一行的数据移到当前行
          this._grid[r][c] = this._grid[r - 1][c];
          this._grid[r - 1][c] = -1;
          // 更新表现层：移动节点
          const nodeAbove = this.cellNodes[r - 1][c];
          this.cellNodes[r - 1][c] = null;
          if (nodeAbove) {
            const cellSize = nodeAbove.getComponent(UITransform).width;
            // continue;
            // 计算新位置（下移一格）
            const newY = nodeAbove.position.y - cellSize * up.length;
            const currentX = nodeAbove.position.x;
            // 使用缓动动画下落
            tween(nodeAbove)
              .to(
                0.3,
                { position: new Vec3(currentX, newY, 0) },
                { easing: "cubicOut" }
              )
              .start();

            // 更新节点名称
            nodeAbove.name = `cell_${r}_${c}`;
          }

          // 更新节点引用映射
          this.cellNodes[r][c] = nodeAbove;
        }
      }
    }

    if (down.length !== 0) {
      for (let clearedRow of down) {
        // 从清除的行向下遍历
        for (let r = clearedRow; r < GridConfig.ROWS - 1; r++) {
          for (let c = 0; c < GridConfig.COLS; c++) {
            // 更新数据层：将上一行的数据移到当前行
            this._grid[r][c] = this._grid[r + 1][c];
            this._grid[r + 1][c] = -1;
            // 更新表现层：移动节点
            const nodeAbove = this.cellNodes[r + 1][c];
            this.cellNodes[r + 1][c] = null;
            if (nodeAbove) {
              const cellSize = nodeAbove.getComponent(UITransform).width;
              // continue;
              // 计算新位置（上移一格）
              const newY = nodeAbove.position.y + cellSize * down.length;
              const currentX = nodeAbove.position.x;
              // 使用缓动动画上升
              tween(nodeAbove)
                .to(
                  0.3,
                  { position: new Vec3(currentX, newY, 0) },
                  { easing: "cubicOut" }
                )
                .start();

              // 更新节点名称
              nodeAbove.name = `cell_${r}_${c}`;
            }

            // 更新节点引用映射
            this.cellNodes[r][c] = nodeAbove;
          }
        }
      }
    }

    // console.log("Grid after clear:", this._grid);
    // console.log("Cell nodes after clear:", this.cellNodes);
  }
}
