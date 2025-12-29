import {
  _decorator,
  instantiate,
  Node,
  Prefab,
  resources,  
  Vec3,
  find,
  Graphics,
  v3,
  sp,  
} from "cc";
import { Sound } from "../sound/Sound";
import { EventBus } from "../event/EventBus";
import { ConnectLine } from "./ConnectLine";
import { EffectEvent } from "./EffectEvent";
import { CubeEvent } from "../game/cube/CubeEvent";
import { Shadow } from "./Shadow";
import { DrawLine } from "./DrawLine";
import { GuideEvent } from "../game/guide/GuideEvent";
const { ccclass } = _decorator;

@ccclass("EffectManager")
export class EffectManager {

  // private _lines: ConnectLine[] = []; //连接线

  private _line: DrawLine;

  constructor() {    
    resources.load(`effect/boom`, Prefab, (err, prefab) => {
    });
    const node = new Node("Line");
    node.parent = find("gui/game/LayerEffect");
    this._line = node.addComponent(DrawLine);

    EventBus.instance.on(EffectEvent.Line, this.playLine, this);
    EventBus.instance.on(EffectEvent.LineRemove, this.removeLine, this);        
    EventBus.instance.on(EffectEvent.LineClear, this.clearLines, this);
    EventBus.instance.on(EffectEvent.ShowBoom, this.showBoom, this);

    EventBus.instance.on(GuideEvent.ShowHand, this.playLine, this);
  }

  
  playLine(s:Vec3 = v3(-300, 300, 0), e:Vec3 = v3(-100, 100, 0)){
    this._line.drawLine(s,e);
  }

  removeLine(){ 
    this._line.removeLastLine();
  }
  
  clearLines(){
    this._line.clearLines();
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
    // node.getComponent(Shadow).show();
  }
}
