import {
  _decorator,
  instantiate,
  Node,
  Prefab,
  resources,  
  Vec3,
  find,  
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

  private _lines: ConnectLine[] = []; //连接线

  constructor() {    
    resources.load(`effect/line`, Prefab, (err, prefab) => {
    });

    resources.load(`effect/shadow`, Prefab, (err, prefab) => {
    });

    EventBus.instance.on(EffectEvent.Line, this.playLine, this);
    EventBus.instance.on(EffectEvent.LineRemove, this.removeLine, this);

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
       this._lines.push(line);
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

  removeLine(){ 
    if(this._lines.length > 0){
      this._lines.pop()?.node.removeFromParent();
    }
  }
}
