import {
  _decorator,
  instantiate,
  Prefab,
  resources,  
  Vec3,
  find,
  sp,  
} from "cc";
import { Sound } from "../sound/Sound";
import { EventBus } from "../event/EventBus";
import { EffectEvent } from "./EffectEvent";
const { ccclass } = _decorator;

@ccclass("EffectManager")
export class EffectManager {
  
  private _boomPrefab: Prefab = null;
  constructor() {    
    resources.load(`effect/boom`, Prefab, (err, prefab) => {
      if (!err) {
        this._boomPrefab = prefab;
      }
    });

    EventBus.instance.on(EffectEvent.ShowBoom, this.showBoom, this);
  }
  

  showBoom(pos: Vec3){
    if(!this._boomPrefab) return;
    const node = instantiate(this._boomPrefab);
    node.parent = find("gui/game/LayerEffect");
    node.setWorldPosition(pos);
    const spine = node.getComponent(sp.Skeleton);
    spine.setCompleteListener(() => {
      node.destroy();      
    });
    setTimeout(() => {
      Sound.ins.playOneShot(Sound.effect.boom);
    }, 300);    
  }
}
