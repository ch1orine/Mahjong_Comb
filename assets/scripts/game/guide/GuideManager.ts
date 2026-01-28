import { _decorator, instantiate, Node, Prefab, resources, Tween, tween, v3, find} from "cc";
import { GuideEvent } from "./GuideEvent";
import { EventBus } from "../../event/EventBus";
import { Cube } from "../cube/Cube";
import { EffectEvent } from "../../effect/EffectEvent";
const { ccclass } = _decorator;

@ccclass("Guide")
export class GuideManager {
  private _hand!: Node;


    // EventBus.instance.on(EventBus.UpdateTimer, this.checkTimer, this); //恢复计时
    // EventBus.instance.on(EventBus.StopTimer, this.stopTimer, this);   //阻断计时

    // 
  private _mask!: Node;
  constructor() {
    resources.load(`hand/guide`, Prefab, (err, prefab) => {
        if (err) {
            console.error(err);
            return;
        }
        this._hand = instantiate(prefab);
        this._hand.parent = find("gui/game");
        this._hand.setPosition(175, -4, 0);
        this._mask = this._hand.children[0].getChildByName("mask")!;
        this._hand.active = false;     
        this._mask.active = false;
      });

    EventBus.instance.on(GuideEvent.ShowHand, this.showGuide, this);    
    EventBus.instance.on(GuideEvent.StopShowGuide, this.stopGuideShow, this);
  }

  public showGuide(){   
    Tween.stopAllByTarget(this._hand);    

    this._hand.active = true;
    this._hand.setPosition(175, -4, 0);
    this._mask.active = false;

    tween(this._hand)
    .repeatForever(
          tween()
          .to(1.0, { position: v3(175, -247, 0) })
          .call(() => {
            this._mask.active = true;
          })
          .delay(1.0)
          .call(() => {
              this._hand.setPosition(175, -4, 0);
              this._mask.active = false;
            })
          )
       .start();
  }

  public stopGuideShow(){        
    this._hand.active = false;    
    Tween.stopAllByTarget(this._hand);    
  }  
}
