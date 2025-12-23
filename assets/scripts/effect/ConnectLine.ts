import { _decorator, Component, Node, sp, Sprite, tween, UITransform, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ConnectLine")
export class ConnectLine extends Component {


  @property(sp.Skeleton)
  startSp!: sp.Skeleton;


  @property(sp.Skeleton)
  endSp!: sp.Skeleton;
  
  @property(Sprite)
  line!: Sprite;


  playAnim(s: Vec3, e: Vec3) {
   if (this.getHV(s, e).res) {
       this.line.node.angle = 90; // 水平       
   }
    const ui = this.line.getComponent(UITransform)!;

    const w = ui.contentSize.width;
    const h = ui.contentSize.height;

    tween({w:w, h:h})
      .to(0.1, {w: w, h: this.getHV(s, e).dis + 100},{
        onUpdate: (obj) => {
          ui.setContentSize(obj.w, obj.h);
        }
      })
      .delay(0.1)
      .call(() => {
          this.line.node.active = false;
      })
      .start();
    
    this.node.setWorldPosition(this.getMidPoint(s, e));
    this.startSp.node.setWorldPosition(s);
    this.endSp.node.setWorldPosition(e);
    this.startSp.setCompleteListener(() => {
      this.node.removeFromParent();            
      this.node.destroy();  
    })
  }


  private getMidPoint(s: Vec3, e: Vec3): Vec3 {
      return new Vec3((s.x + e.x) / 2, (s.y + e.y) / 2, (s.z + e.z) / 2);
  }

  private getHV(s: Vec3, e: Vec3): {res:boolean, dis:number} {    
      return {res: Math.abs(s.x - e.x) > Math.abs(s.y - e.y), 
        dis: Math.abs(s.x - e.x) > Math.abs(s.y - e.y) ? Math.abs(s.x - e.x) : Math.abs(s.y - e.y)}; // true:水平 false:垂直
  }
}
