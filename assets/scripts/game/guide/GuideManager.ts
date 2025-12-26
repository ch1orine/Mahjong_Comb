import { _decorator, instantiate, Node, Prefab, resources, Tween, tween, v3, find} from "cc";
import { GuideEvent } from "./GuideEven";
import { EventBus } from "../../event/EventBus";
import { Cube } from "../cube/Cube";
const { ccclass } = _decorator;

@ccclass("Guide")
export class GuideManager {
  private _hand!: Node;
  private _mask!: Node;

  constructor() {
    // const guideNode = new Node(); //创建一个节点作为guidelayer
    // guideNode.name = "GuideLayer";
    // director.getScene().children[0].addChild(guideNode); //添加节点到场景
    // const mapNode = director.getScene().children[0].children[0].getChildByName("Map");

    resources.load(`hand/guide`, Prefab, (err, prefab) => {
        if (err) {
            console.error(err);
            return;
        }
        this._hand = instantiate(prefab);
        this._hand.parent = find("gui/game");
        this._hand.setPosition(-200,-4,0);
        this._hand.active = false;
        this._mask = this._hand.children[0].children[0];
        // this.showGuide();
      });

    // EventBus.instance.on(GuideEvent.ShowHand, this.showGuide, this);    
    EventBus.instance.on(GuideEvent.StopShowGuide, this.stopGuideShow, this);
  }

  public showGuide(){ 
   const cube = find("gui/game/LayerGame/cube_16").getComponent(Cube);
   cube.activeMask(true);
   this._hand.setPosition(v3(-200,-4,0)); 
   this._hand.active = true;
   this._mask.active = false;
    //   //播放动画
      tween(this._hand)
        .tag(0)
        .repeatForever(
          tween()
          .to(1.5, { position: v3(155,-4,0) })
          .call(() => {
            this._mask.active = true;
          })
          .delay(1)            
          .call(() => {
            this._hand.setPosition(v3(-200,-4,0)); 
            this._mask.active = false;           
          })   
        )                
        .start();
        
    //   tween(opacity)
    //     .tag(0)
    //     .repeatForever(
    //       tween()
    //       .delay(0.5)
    //       .to(1, { opacity: 0 })                     
    //       .call(() => {            
    //         opacity.opacity = 255;
    //       })    
    //     )
    //     .start();  
      
    //   tween(opacityMask)
    //     .tag(0)
    //     .repeatForever(
    //       tween()
    //       .delay(0.5)
    //       .to(1, { opacity: 0 })                     
    //       .call(() => {            
    //         opacityMask.opacity = 255;
    //       })    
    //     )
    //     .start();    
    // }
  }

  public stopGuideShow(){        
    this._hand.active = false;    
    Tween.stopAllByTag(0);    
  }  
}
