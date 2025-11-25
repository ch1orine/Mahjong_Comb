import {
  resources,
  director,
  Node,
  Prefab,
  instantiate,
  sp,
  Color,
  Animation,
} from "cc";
import { EventBus } from "../../../event/EventBus";
import { BlockManagerEvent } from "../BlockManagerEvent";
import { Wipe } from "../../wipe/Wipe";
export class BlockManagerView {

  private _wipe!: Node;

  private _color!: Color;



  spine!: sp.Skeleton;

  /**
   *
   */
  constructor() {
    const effectNode = new Node(); //创建一个节点作为 audioMgr
    effectNode.name = "EffectNode";
    director.getScene().children[0].addChild(effectNode); //添加节点到场景

    resources.load(`prefabs/wipe`, Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
        return;
      }
      this._wipe = instantiate(prefab);
      this._wipe.active = false;
      this._wipe.parent = effectNode;
    });

    EventBus.instance.on(BlockManagerEvent.onWipe, this.showWipeEffect, this);
    // Color.fromHEX(this._color, "#FFFFFF");
  }

  public showWipeEffect(pos: { x: number; y: number }) {
    if (!this._wipe) return;
    const row = Math.round(6 - pos.y / 85);
    const col = Math.round(pos.x / 85 + 3.5);
    this._wipe.setPosition(pos.x - 50, pos.y, 0);//todo xoffset yoffset
    const wipe = this._wipe.getComponent(Wipe); 
    setTimeout(() => {    
        wipe.playWipeEffect(row, col);
    }, 200);      //明天添加字体放大效果
  }


}
