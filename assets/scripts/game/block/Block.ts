import {
  _decorator,
  Component,
  Enum,
  EventTouch,
  Node,
  resources,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec3,
  tween,
} from "cc";
import { EventBus } from "../../event/EventBus";
import {
  ShapeType,
  ShapeMap,
  ShapeColorMap,
  ShapeColorHexMap,
  GridConfig,
} from "./BlockData";
import { BoardManager } from "./BoardManager";
import { Sound } from "../../sound/Sound";
const { ccclass, property } = _decorator;

@ccclass("Block")
export class Block extends Component {
  //  "one对角" = 0,
  //   "two对角" = 1,
  //   "上三角" = 2,
  //   "正方" = 3,
  //   "横线" = 4,
  //   "L形" = 5,

  @property({ type: Enum(ShapeType) })
  public shapeType: ShapeType; //形状类型

  public shapeMap: Number[][]; //形状映射

  private _canDrag: boolean = true; //是否可以拖拽

  private _sprite: Sprite = null; //精灵

  private _isDragging: boolean = false; //是否正在拖拽

  private _originalPosition: Vec3; //记录初始位置

  // 每个小方块的尺寸（UI坐标系像素）
  private readonly CELL_SIZE: number = 65;

  private _cellNodes: Node[] = [];

  // 棋盘管理引用
  private _boardManager: BoardManager = null;

  public slotIndex: number = -1; // 方块所在的槽位索引

  // 当前在棋盘上的位置（格子索引，-1表示未放置）
  private _currentGridRow: number = -1;

  public isGuide: boolean = false;

  protected onLoad(): void {
    this._sprite = this.node.getComponent(Sprite);
  }

  public init(shape: ShapeType): void {
    this.shapeType = shape;
    // 根据当前形状类型刷新形状映射
    this.shapeMap = ShapeMap[shape];

    resources.load(
      `images/blocks/${ShapeColorMap[this.shapeType]}/spriteFrame`,
      SpriteFrame,
      (err, spriteframe) => {
        if (err) {
          console.error("加载方块图片失败:", err);
          return;
        }
        this._buildShape(spriteframe);
        this.InitEvent();
      }
    );
  }

  /**
   * 设置棋盘状态管理器引用
   */
  public setBoardState(boardState: BoardManager): void {
    this._boardManager = boardState;
  }

  // 基于 shapeMap 生成由多个小方块组成的形状
  private _buildShape(spriteFrame: SpriteFrame) {
    // 清理旧子节点
    this._cellNodes.forEach((n) => n.destroy());
    this._cellNodes.length = 0;

    if (!this.shapeMap || this.shapeMap.length === 0) return;

    // 如果父节点上有占位的 Sprite，避免叠加显示
    if (this._sprite) this._sprite.enabled = false;

    const rows = this.shapeMap.length;
    const cols = Math.max(...this.shapeMap.map((r) => r.length));

    const width = cols * this.CELL_SIZE;
    const height = rows * this.CELL_SIZE;
    const startX = -width / 2 + this.CELL_SIZE / 2; // 居中摆放
    const startY = height / 2 - this.CELL_SIZE / 2;

    for (let r = 0; r < rows; r++) {
      const row = this.shapeMap[r] as number[];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== 1) continue;
        const cell = new Node(`cell_${r}_${c}`);
        const ui = cell.addComponent(UITransform);
        const sp = cell.addComponent(Sprite);
        sp.spriteFrame = spriteFrame;
        sp.sizeMode = Sprite.SizeMode.CUSTOM; // 以内容尺寸驱动
        ui.setContentSize(this.CELL_SIZE, this.CELL_SIZE);

        const x = startX + c * this.CELL_SIZE;
        const y = startY - r * this.CELL_SIZE;
        cell.setPosition(new Vec3(x, y, 0));
        this.node.addChild(cell);
        this._cellNodes.push(cell);
      }
    }

    this.node.getComponent(UITransform).setContentSize(width, height);
    this.node.name = `block_${ShapeType[this.shapeType]}`;
  }

  private InitEvent() {
    this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
  }

  private OnTouchStart(event: EventTouch) {
     Sound.ins.playOneShot(Sound.effect.click); //点击音效

    if (!this._canDrag) {
      return;
    }


    if (this.isGuide) {
      EventBus.instance.emit(EventBus.HighlightBlock);
      EventBus.instance.emit(EventBus.GuideHide);
    }
   
    this._isDragging = true;
    this._originalPosition = this.node.position.clone();

    // 如果方块已经在棋盘上，先从棋盘状态中移除
    if (this._boardManager && this._currentGridRow !== -1) {
      console.log("!!!!!!!!!!!!");
      this._currentGridRow = -1;
    }

    this.node.setScale(Vec3.ONE.clone().multiplyScalar(1.3)); //放大block

    const touchPos = event.getUILocation();
    this.node.setWorldPosition(touchPos.x, touchPos.y, 0); //直接设置世界坐标

    // 提升层级，让拖动的方块显示在最上层
    this.node.setSiblingIndex(99999);
  }

  private OnTouchMove(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }

    // 获取触摸位置
    const touchPos = event.getUILocation();
    this.node.setWorldPosition(touchPos.x, touchPos.y, 0);
  }

  private OnTouchEnd(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }

    this._isDragging = false;

    // 检查是否已设置必要的引用
    if (!this._boardManager) {
      console.warn("棋盘状态未设置，无法放置");
      // 位置无效，恢复原始位置
      this.returnOriginalPos();
      return;
    }

    // 获取当前方块的世界坐标
    const worldPos = this.node.getWorldPosition();

    // 转换为父节点（容器）的本地坐标
    const parentUITransform = this.node.parent?.getComponent(UITransform);
    if (!parentUITransform) {
      console.warn("父节点没有 UITransform");
      this._snapToPosition(this._originalPosition, null);
      return;
    }

    const localPos = new Vec3();
    parentUITransform.convertToNodeSpaceAR(worldPos, localPos);

    // 计算最近的格子索引
    const gridPos = this._worldToGridIndex(localPos);

    if (this.isGuide) {
      if (gridPos.row !== 3 || gridPos.col !== 6) {
        this.returnOriginalPos();
        EventBus.instance.emit(EventBus.Closelight);    
        setTimeout(() => {
          EventBus.instance.emit(EventBus.GuideShow);
        }, 500);
        return;
      }
    }
    console.log(`格子索引: (${gridPos.row}, ${gridPos.col})`);
    // 检查是否可以放置在该位置
    if (this._canPlaceAtGrid(gridPos.row, gridPos.col)) {
      if(this.isGuide){
        EventBus.instance.emit(EventBus.GuideOver);
      EventBus.instance.emit(EventBus.Closelight);
      }
      // 计算吸附位置（容器本地坐标）
      EventBus.instance.emit(EventBus.PlayerStepCord);
      Sound.ins.playOneShot(Sound.effect.place); //播放音效
      const snappedPos = this._gridIndexToWorld(gridPos.row, gridPos.col);

      this.node.children.forEach((cell) => {
        const row = cell.name.split("_")[1];
        const col = cell.name.split("_")[2];
        const boardRow = gridPos.row + parseInt(row);
        const boardCol = gridPos.col + parseInt(col);
        this._boardManager.cellNodes[boardRow][boardCol] = cell;
      });
      // 使用缓动吸附效果
      this._snapToPosition(snappedPos, () => {
        // 在棋盘状态中标记占用
        this._boardManager.placeShape(
          this.shapeMap as number[][],
          gridPos.row,
          gridPos.col,
          this.shapeType
        );
        this._currentGridRow = gridPos.row;
        

        // 检查并消除完整行列
        const cleared = this._boardManager.checkAndClearLines(
          ShapeColorMap[this.shapeType]
        );
        if (cleared.length > 0) {
          console.log("消除行列:", cleared);
          EventBus.instance.emit(EventBus.AddScore); //每消除一行加1000分
          EventBus.instance.emit(EventBus.StopInteract);
          EventBus.instance.emit(
            EventBus.CheckAndClear,
            new Vec3(0, 280 - cleared[0] * GridConfig.CELL_SIZE, 0),
            ShapeColorHexMap[this.shapeType],
            cleared.length - 1
          );          
        }
      });
      this.node.pauseSystemEvents(false);
      EventBus.instance.emit(EventBus.SlotBlockUsed, this.slotIndex);
      console.log(`吸附成功 - 格子位置: (${gridPos.row}, ${gridPos.col})`);
    } else {
      // 位置无效，恢复原始位置
      this.returnOriginalPos();
      if (this.isGuide) {
        EventBus.instance.emit(EventBus.Closelight);
        setTimeout(() => {
          EventBus.instance.emit(EventBus.GuideShow);
        }, 500);
      }
    }
  }

  /**
   * 吸附到指定位置（带缓动效果）
   */
  private _snapToPosition(targetPos: Vec3, onComplete?: () => void): void {
    tween(this.node)
      .to(
        0.2,
        {
          position: targetPos,
          scale: Vec3.ONE.clone().multiplyScalar(1.3),
        },
        {
          easing: "backOut",
        }
      )
      .call(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .start();
  }

  /**
   * 将本地坐标（容器坐标系）转换为格子索引
   * 返回的是 shapeMap[0][0] 应该放置的格子索引
   * 使用与 BlockManager.CreateMap() 相同的坐标系统
   */
  private _worldToGridIndex(localPos: Vec3): { row: number; col: number } {
    if (!this.shapeMap || this.shapeMap.length === 0) {
      return { row: 0, col: 0 };
    }

    const CellSize = GridConfig.CELL_SIZE;
    const COLS = GridConfig.COLS;
    const ROWS = GridConfig.ROWS;

    const shapeRows = this.shapeMap.length;
    const shapeCols = Math.max(...this.shapeMap.map((r) => r.length));

    // 方块自身的尺寸（用CELL_SIZE=65构建的）
    const blockWidth = shapeCols * this.CELL_SIZE;
    const blockHeight = shapeRows * this.CELL_SIZE;

    // 方块左上角第一个cell的中心点相对于方块中心的偏移
    const blockCellOffsetX = -blockWidth / 2 + this.CELL_SIZE / 2;
    const blockCellOffsetY = blockHeight / 2 - this.CELL_SIZE / 2;

    // 方块左上角cell的中心点的本地坐标
    const cellLocalX = localPos.x + blockCellOffsetX;
    const cellLocalY = localPos.y + blockCellOffsetY;

    // 使用 CreateMap 的逆向公式计算格子索引
    // CreateMap 公式: x = (2*j - COLS + 1) * CellSize / 2
    //                y = (ROWS + 2.85 - 2*i) * CellSize / 2

    // 逆向求解 j: j = (2*x / CellSize + COLS - 1) / 2
    const col = Math.round(((2 * cellLocalX) / CellSize + COLS - 1) / 2);

    // 逆向求解 i: i = (ROWS + 2.85 - 2*y / CellSize) / 2
    const row = Math.round((ROWS + 2.85 - (2 * cellLocalY) / CellSize) / 2);

    return { row, col };
  }

  /**
   * 将格子索引转换为本地坐标（容器坐标系）
   * 输入的格子索引是 shapeMap[0][0] 应该放置的位置
   * 返回的是方块节点中心应该在的位置（容器本地坐标）
   * 使用与 BlockManager.CreateMap() 相同的坐标系统
   */
  private _gridIndexToWorld(row: number, col: number): Vec3 {
    if (!this.shapeMap || this.shapeMap.length === 0) {
      return new Vec3(0, 0, 0);
    }

    const CellSize = GridConfig.CELL_SIZE;
    const COLS = GridConfig.COLS;
    const ROWS = GridConfig.ROWS;

    const shapeRows = this.shapeMap.length;
    const shapeCols = Math.max(...this.shapeMap.map((r) => r.length));

    // 方块自身的尺寸
    const blockWidth = shapeCols * CellSize;
    const blockHeight = shapeRows * CellSize;

    // 方块左上角第一个cell的中心点相对于方块中心的偏移
    const blockCellOffsetX = -blockWidth / 2 + CellSize / 2;
    const blockCellOffsetY = blockHeight / 2 - CellSize / 2;

    // 使用 CreateMap 的公式计算目标格子的位置（容器本地坐标）
    // x = (2*j - COLS + 1) * CellSize / 2
    // 使用 CreateMap 的公式计算目标格子的位置（容器本地坐标）
    // x = (2*j - COLS + 1) * CellSize / 2
    // y = (ROWS + 2.85 - 2*i) * CellSize / 2
    const gridCellX = ((2 * col - COLS + 1) * CellSize) / 2.0;
    const gridCellY = ((ROWS + 2.85 - 2 * row) * CellSize) / 2.0;

    // 方块节点中心应该在的位置（容器本地坐标）
    const blockCenterX = gridCellX - blockCellOffsetX;
    const blockCenterY = gridCellY - blockCellOffsetY;

    return new Vec3(blockCenterX, blockCenterY, 0);
  }

  /**
   * 检查方块是否可以放置在指定格子位置
   * 考虑方块的形状，确保所有cell都在棋盘内且不与已有方块重叠
   */
  private _canPlaceAtGrid(gridRow: number, gridCol: number): boolean {
    if (!this._boardManager || !this.shapeMap) {
      return false;
    }

    // 使用BoardState的碰撞检测
    return this._boardManager.canPlaceShape(
      this.shapeMap as number[][],
      gridRow,
      gridCol
    );
  }

  /**
   * 放置无效，恢复原始位置
   */
  private returnOriginalPos(): void {
    this.node.pauseSystemEvents(true);
    tween(this.node)
      .to(
        0.2,
        { position: this._originalPosition.clone() },
        { easing: "backOut" }
      )
      .start();

    tween(this.node)
      .to(
        0.2,
        { scale: Vec3.ONE.clone().multiplyScalar(1.0) },
        { easing: "backOut" }
      )
      .call(() => {
        this.node.resumeSystemEvents(true);
      })
      .start();
  }
}
