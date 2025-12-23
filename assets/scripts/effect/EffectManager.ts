import {
  _decorator,
  instantiate,
  Node,
  Prefab,
  resources,
  tween,
  UIOpacity,
  Vec3,
  Animation,
  Color,
  director,
  find,
  Line,
} from "cc";
import { Sound } from "../sound/Sound";
import { EventBus } from "../event/EventBus";
import { ConnectLine } from "./ConnectLine";
import { EffectEvent } from "./EffectEvent";
const { ccclass } = _decorator;

@ccclass("EffectManager")
export class EffectManager {



  constructor() {    
    resources.load(`effect/line`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
      // const node = instantiate(prefab);
      // node.parent = find("gui/game/LayerGame");
    });

    EventBus.instance.on(EffectEvent.Line, this.PlayLine, this);
  }

  
  PlayLine(s:Vec3, e:Vec3){
    resources.load(`effect/line`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
       const node = instantiate(prefab);
       node.parent = find("gui/game/LayerEffect");
       const line = node.getComponent(ConnectLine);
       line.playAnim(s,e);
    });
  }

}
