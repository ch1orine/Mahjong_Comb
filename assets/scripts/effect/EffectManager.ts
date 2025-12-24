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
import { CubeEvent } from "../game/cube/CubeEvent";
import { Shadow } from "./Shadow";
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

    resources.load(`effect/shadow`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
    });

    EventBus.instance.on(EffectEvent.Line, this.playLine, this);
    EventBus.instance.on(CubeEvent.FlyStart, this.showShadow, this);
  }

  
  playLine(s:Vec3, e:Vec3){
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

  showShadow(cube: Node){
    resources.load(`effect/shadow`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
       const node = instantiate(prefab);
       const shadow = node.getComponent(Shadow);
       node.parent = cube.parent;
       node.setSiblingIndex(cube.getSiblingIndex()-1);
       shadow.followNode = cube;
    })
  }
}
