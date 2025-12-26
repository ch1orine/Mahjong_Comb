import { _decorator, Component, Node, sp, Sprite, tween, UITransform, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ConnectLine")
export class ConnectLine extends Component {
  @property(Sprite)
  line!: Sprite;

  playAnim(s: Vec3, e: Vec3) {    
    this.setAngle(s, e);
    const ui = this.line.getComponent(UITransform)!;

    const w = ui.contentSize.width;
    const h = ui.contentSize.height;
    ui.setContentSize(w, Vec3.distance(s, e) + 80);

    // tween({w:w, h:h})
    //   .to(0.1, {w: w, h: Vec3.distance(s, e) + 90},{
    //     onUpdate: (obj) => {
    //       ui.setContentSize(obj.w, obj.h);
    //     }
    //   })
    //   .delay(0.1)
    //   .call(() => {
    //       // this.line.node.active = false;
    //   })
    //   .start();    
    this.node.setWorldPosition(this.getMidPoint(s, e));
  }


  private getMidPoint(s: Vec3, e: Vec3): Vec3 {
      return new Vec3((s.x + e.x) / 2, (s.y + e.y) / 2, 0);
  }

  private setAngle(s: Vec3, e: Vec3) {
      const dx = e.x - s.x;
      const dy = e.y - s.y;
      const rad = Math.atan2(dy, dx);           // 以 x 轴为基准的弧度
      const deg = rad * 180 / Math.PI;          // 转为角度
      this.node.angle = deg + 90;//默认竖直向上
      // return deg;     
      // return Vec3.distance(s, e);     
  }
}
