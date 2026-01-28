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
  
  constructor() {    
    resources.load(`effect/boom`, Prefab, (err, prefab) => {
    });

    EventBus.instance.on(EffectEvent.ShowBoom, this.showBoom, this);
  }

  


  showBoom(pos: Vec3){
    const node = instantiate(resources.get(`effect/boom`, Prefab));
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
