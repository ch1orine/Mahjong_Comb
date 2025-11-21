import { _decorator, Component, Node, EventTouch, Vec3 } from "cc";
import { EventBus } from "../../../event/EventBus";
import { BlockEvent } from "../BlockEvent";
const { ccclass } = _decorator;

@ccclass("BlockBll")
export class BlockBll extends Component {
 
  protected onLoad(): void {
    //test only
    EventBus.instance.on(BlockEvent.CheckPosValid, this.checkPositionValid, this);
  }

  private checkPositionValid(pos: Vec3) {    
    console.log("Bll_checking position valid..."); 
    //调用blockmanager的检测方法，即发送事件通知blockmanager

    //检测逻辑
    //判定当前位置接触到-1格子时立刻发送 invalid事件，view层响应
    //若为可消除位置，立刻执行 发送valid事件，view层响应
  }
}
