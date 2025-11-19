import { _decorator, Component, Graphics, UITransform, Color } from "cc";
const { ccclass, property } = _decorator;

/**
 * 棋盘格组件 - 使用 Graphics 绘制横线和竖线
 */
@ccclass("GridBoard")
export class GridBoard extends Component {
  @property
  public rows: number = 8; // 行数

  @property
  public cols: number = 8; // 列数

  @property
  public cellSize: number = 83; // 每个格子的大小（像素）

  @property
  public lineWidth: number = 3.8; // 线条宽度

  @property(Color)
  public lineColor: Color = new Color(0, 0, 0, 255); // 线条颜色（黑色）

  private _graphics: Graphics = null;

  protected onLoad(): void {
    this._graphics = this.node.getComponent(Graphics);
    if (!this._graphics) {
      this._graphics = this.node.addComponent(Graphics);
    }

    // 设置节点的 UITransform 尺寸
    const uiTransform = this.node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.setContentSize(
        this.cols * this.cellSize,
        this.rows * this.cellSize
      );
    }

    this.drawGrid();
  }

  /**
   * 绘制棋盘格（不包含边界，内部线条占满整个区域）
   */
  public drawGrid(): void {
    if (!this._graphics) return;

    this._graphics.clear();
    this._graphics.lineWidth = this.lineWidth;
    this._graphics.strokeColor = this.lineColor;

    const width = this.cols * this.cellSize;
    const height = this.rows * this.cellSize;

    // 计算起始位置（居中绘制）
    const startX = -width / 2;
    const startY = -height / 2;

    // 绘制横线（不包含顶部和底部边界，从第1条到第rows-1条，共rows-1条）
    for (let i = 1; i < this.rows; i++) {
      const y = startY + i * this.cellSize;
      this._graphics.moveTo(startX, y);
      this._graphics.lineTo(startX + width, y);
      this._graphics.stroke();
    }

    // 绘制竖线（不包含左侧和右侧边界，从第1条到第cols-1条，共cols-1条）
    for (let i = 1; i < this.cols; i++) {
      const x = startX + i * this.cellSize;
      this._graphics.moveTo(x, startY);
      this._graphics.lineTo(x, startY + height);
      this._graphics.stroke();
    }    
  }

  /**
   * 更新棋盘格参数并重新绘制
   */
  public updateGrid(rows: number, cols: number, cellSize?: number): void {
    this.rows = rows;
    this.cols = cols;
    if (cellSize !== undefined) {
      this.cellSize = cellSize;
    }

    // 更新 UITransform 尺寸
    const uiTransform = this.node.getComponent(UITransform);
    if (uiTransform) {
      uiTransform.setContentSize(
        this.cols * this.cellSize,
        this.rows * this.cellSize
      );
    }

    this.drawGrid();
  }

  /**
   * 设置线条样式
   */
  public setLineStyle(width: number, color: Color): void {
    this.lineWidth = width;
    this.lineColor = color;
    this.drawGrid();
  }

  /**
   * 清除棋盘格
   */
  public clear(): void {
    if (this._graphics) {
      this._graphics.clear();
    }
  }
}
