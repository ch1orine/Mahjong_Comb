import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  resources,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec3,
} from "cc";
import {
  ShapeTypeList,
  ColorMap,
  GridBoardConfig,
  CellConfig,
} from "./BlockData";
import { Block } from "./Block";
import { BoardManager } from "./BoardManager";
import { EventBus } from "../../event/EventBus";
import { Sound } from "../../sound/Sound";

export class BlockManager {
  private _container: Node = null;

  private _index: number = 0;

  private _slotpos: number[] = [-228, 0, 228];

  private _boardManager: BoardManager = null; // 棋盘状态管理   

  private _blocks: Node[] = []; // 方块对象池
  /**
   *
   */
  constructor(c: Node) {
    this._container = c;
    this._index = 0;    

    this._boardManager = new BoardManager();  
  }

  public init(): void {
    this.CreateMap();
    this.GenerateBlockNodesAtSlot(0);
    this.GenerateBlockNodesAtSlot(1);
    this.GenerateBlockNodesAtSlot(2);    
        
    EventBus.instance.on(EventBus.SlotBlockUsed, this.onSlotBlockUsed, this);    
    EventBus.instance.on(EventBus.GuideOver, this.onGuideHide, this);

    console.log("BlockManager init");
  }

  public GenerateBlockNodesAtSlot(slotIndex: number): Node {
    if (slotIndex < 0 || slotIndex >= this._slotpos.length) {
      console.error("Invalid slot index",slotIndex);
      return null;
    }
    const pos = new Vec3(this._slotpos[slotIndex], -375, 0);
    return this.GenerateBlockNodes(pos, slotIndex);
  }

  private GenerateBlockNodes(pos: Vec3, slotIndex: number): Node {
    resources.load(`prefabs/block`, Prefab, (err, prefab) => {
      if (err) {
        console.error("加载方块预制体失败:", err);
        return null;
      }
      const blockNode = instantiate(prefab) as Node;
      const blockComp = blockNode.getComponent(Block);
      
      // 分配唯一ID      
      blockComp.slotIndex = slotIndex;
      
      // 初始化形状
      blockComp.init(ShapeTypeList[this._index % ShapeTypeList.length]);
    
      if(this._index == 0){
        blockComp.isGuide = true;
      }

      

      // 设置棋盘状态管理器
      blockComp.setBoardState(this._boardManager);
      
      blockNode.setParent(this._container);
      blockNode.setPosition(pos);
      if (this._index == 1 || this._index == 2 ) {
        blockNode.pauseSystemEvents(true);
        this._blocks.push(blockNode);
      }
      this._index++;
      return blockNode;
    });

    return null;
  }

  private CreateMap(): void {
    const CellSize = CellConfig.CELL_SIZE;
    const COLS = CellConfig.COLS;
    const ROWS = CellConfig.ROWS;

    for (let i = 0; i < GridBoardConfig.length; i++) {
      for (let j = 0; j < GridBoardConfig[0].length; j++) {
        if (GridBoardConfig[i][j] === -1) continue;
        // 创建格子节点
        const cellNode = instantiate(new Node());
        cellNode.name = `cell_${i}_${j}`;
        cellNode.setParent(this._container);
        const uiTransform = cellNode.addComponent(UITransform);
        const cellComp = cellNode.addComponent(Sprite);    
        cellNode.setPosition(
            new Vec3((2 * j - COLS + 1) * CellSize / 2.0,
                  (ROWS + 2.85 - 2 * i) * CellSize / 2.0 ));// 应该为3 实际是2.9，留出一点空隙（图片有轻微偏移）
        
        // 将节点引用存储到 BoardManager
        this._boardManager.setCellNode(i, j, cellNode);
        
        resources.load(
          `images/blocks/${ColorMap[GridBoardConfig[i][j]]}/spriteFrame`,
          SpriteFrame,
          (err, spriteFrame) => {
            if (err) {
              console.error("加载格子图片失败:", err);
              return;
            }
            cellComp.spriteFrame = spriteFrame;
            cellComp.sizeMode = Sprite.SizeMode.CUSTOM; // 以内容尺寸驱动
            uiTransform.setContentSize(CellConfig.CELL_SIZE, CellConfig.CELL_SIZE);    
          }
        );
      }
    }
  }

  private onSlotBlockUsed(slotIndex: number): void {
    this.GenerateBlockNodesAtSlot(slotIndex);
    Sound.ins.playOneShot(Sound.effect.new); //播放音效
  }

  /**
   * 获取棋盘状态（用于调试）
   */
  public getBoardState(): BoardManager {
    return this._boardManager;
  }

  /**
   * 清空棋盘状态
   */
  public clearBoard(): void {
    if (this._boardManager) {
      this._boardManager.clear();
    }
  }

  private onGuideHide(){
    for( let b of this._blocks){      
      b.resumeSystemEvents(true);
    }
  }
}