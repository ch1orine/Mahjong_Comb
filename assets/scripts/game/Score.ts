import { _decorator, Component, Label, tween } from 'cc';
import { EventBus } from '../event/EventBus';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
    @property(Label)
    scoreLabel: Label = null!;

    private _currentScore: number = 85624;

    start() {           
        EventBus.instance.on(EventBus.AddScore, this.playScoreAnimation, this);
    }

   private playScoreAnimation(addScore: number = 512, duration: number = 1.0): void {        
        const start = this._currentScore;        
        tween({ value: 0 })
            .to(duration, { value: 1 }, {
                onUpdate: (obj: any) => {
                    const t = obj.value;
                    const display = Math.floor(start + addScore * t);
                    this.scoreLabel.string = display.toString();
                }
            })
            .call(() => {
                this._currentScore += addScore;
            })
            .start();
   }
}

