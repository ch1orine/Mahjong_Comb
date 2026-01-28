import { _decorator, Component, Label, tween } from 'cc';
import { EventBus } from '../../event/EventBus';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
    @property(Label)
    scoreLabel: Label = null!;

    private _currentScore: number = 0;

    private _addCount: number = 1;

    start() {                   
        EventBus.instance.on(EventBus.AddScore, this.playScoreAnimation, this);
    }

   private playScoreAnimation(addScore: number = 8, duration: number = 0.4) {        
        const start = this._currentScore;   
        addScore *= this._addCount;     
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
        this._addCount ++;    
   }
}

