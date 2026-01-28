import { _decorator, Component, Node, EventTouch } from 'cc';
import { EventBus } from '../../../event/EventBus';
import { CubeManagerEvent } from '../CubeManagerEvent';
const { ccclass, property } = _decorator;

@ccclass('CubeManagerView')
export class CubeManagerView extends Component {
    
    @property(Node)
    cubeContainer!: Node; // cube 的父容器节点

    onLoad() {
        // 将自己注册到 CubeManager
        EventBus.instance.emit(CubeManagerEvent.RegisterView, this);
        // this.cubeContainer = this.node;
        
    }

    start() {
        // 监听触摸移动事件
        if (this.cubeContainer) {
            this.cubeContainer.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.cubeContainer.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.cubeContainer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.cubeContainer.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    private onTouchStart(event: EventTouch) {      
        EventBus.instance.emit(CubeManagerEvent.TouchStart, event);
    }

    private onTouchMove(event: EventTouch) {
        EventBus.instance.emit(CubeManagerEvent.TouchMove, event);
    }

    private onTouchEnd(event: EventTouch) {
        EventBus.instance.emit(CubeManagerEvent.TouchEnd, event);
    }
}

