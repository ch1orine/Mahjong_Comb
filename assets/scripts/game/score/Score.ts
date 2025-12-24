import { _decorator, Component, Node, RichText } from 'cc';
import { EventBus } from '../../event/EventBus';
import { CubeEvent } from '../cube/CubeEvent';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
    @property({ type: RichText, tooltip: "分数显示节点" })
    label!: RichText;

    @property({ type: Node, tooltip: "方块节点" })
    right!: Node;


    private _score: number = 0;

    protected onLoad(): void {
        EventBus.instance.on(CubeEvent.FlyEnd, this.onCubeFlyEnd, this); // 监听方块飞行结束事件
    }


    private onCubeFlyEnd(cubeId: number) {
        if( cubeId.toString() === this.node.name) {
        // 在这里处理方块飞行结束后的逻辑
            this._score++;
            this.label.string = `${this._score}/<color=#02E306>2</color>`;
            if (this._score >= 2) {
                this.label.node.active = false;
                this.right.active = true;
                EventBus.instance.off(CubeEvent.FlyEnd, this.onCubeFlyEnd, this); // 移除监听，避免重复触发
            }
        }
    }
}
