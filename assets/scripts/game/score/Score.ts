import { _decorator, CCInteger, Component, Node, RichText } from 'cc';
import { EventBus } from '../../event/EventBus';
import { CubeEvent } from '../cube/CubeEvent';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
    @property({ type: RichText, tooltip: "分数显示节点" })
    label!: RichText;

    @property({ type: Node, tooltip: "方块节点" })
    right!: Node;

    @property({ type: CCInteger, tooltip: "分数" })
    count!: number;

    // private _score: number = 0;

    protected onLoad(): void {
        EventBus.instance.on(CubeEvent.FlyEnd, this.onCubeFlyEnd, this); // 监听方块飞行结束事件
        this.label.string = `${this.count}`;
    }


    private onCubeFlyEnd(cubeId: number) {
        if( cubeId.toString() === this.node.name) {
        // 在这里处理方块飞行结束后的逻辑
            this.count--;
            this.label.string = `${this.count}`;
            if (this.count < 1) {
                this.label.node.active = false;
                this.right.active = true;
                EventBus.instance.off(CubeEvent.FlyEnd, this.onCubeFlyEnd, this); // 移除监听，避免重复触发
            }
        }
    }
}
