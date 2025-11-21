import { _decorator, Component, EventTouch, Node, Sprite, tween, Vec3 } from "cc";
import { EventBus } from "../../../event/EventBus";
import { BlockEvent } from "../BlockEvent";
const { ccclass, property } = _decorator;

@ccclass("BlockView")
export class BlockView extends Component {
  @property({ type: Sprite, tooltip: "方块图片" })
  sprite!: Sprite;

  private _canDrag: boolean = true; //是否可以拖拽

  private _isDragging: boolean = false; //是否正在拖拽

  private _originalPosition: Vec3; //记录初始位置

  onLoad() {
    this._originalPosition = this.node.position.clone();

    this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

    EventBus.instance.on(BlockEvent.InvalidDrag, this.inValidHandler, this);
    EventBus.instance.on(BlockEvent.ValidDrag, this.validHandler, this);
  }

  private OnTouchStart(event: EventTouch) {    
    if (!this._canDrag) {
      return;
    }
    this._isDragging = true;    
    EventBus.instance.emit(EventBus.Combine,3,3);//test only
  }

  private OnTouchMove(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {      
      return;
    }    
    EventBus.instance.emit(BlockEvent.CheckPosValid, this.node.position);
    const touchPos = event.getUILocation();
    this.node.setWorldPosition(touchPos.x, touchPos.y, 0);
  }

  private OnTouchEnd(event: EventTouch) {
    if (!this._canDrag || !this._isDragging) {
      return;
    }

    this._isDragging = false;

    console.log("拖动结束,(depre)bll检测是否触发消除逻辑");
  }


  /** 位置不合理 block回归原位置（属于表现层） */
  public inValidHandler(){
        console.log("位置不合理，停止拖动，回归原位置");
        this._isDragging = false;
        tween(this.node)
        .to(0.2, { position: this._originalPosition })
        .start();
  }

    /** 位置合理 block停留在当前位置，执行特效、粒子等（属于表现层） */
  public validHandler(){
        console.log("位置合理，停止拖动，通知bll执行后续逻辑");
        this._canDrag = false;
  }
  
  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.OnTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

    this.node.off(BlockEvent.InvalidDrag, this.inValidHandler, this);
    this.node.off(BlockEvent.ValidDrag, this.validHandler, this);
  }
}
