import {
  _decorator,
  resources,
  Component,
  Input,
  Node,
  Sprite,
  SpriteFrame,
  Tween,
  tween,
  Vec3,
  find,
  BlockInputEvents,
} from "cc";
import { Sound } from "../sound/Sound";
import { gameConfig } from "../common/GameConfig";
import { EventBus } from "../event/EventBus";
import { EffectManager } from "../effect/EffectManager";
import { BlockManager } from "./block/BlockManager";
import { BoardManager } from "./block/BoardManager";

declare function showMyAd(): void; //外部注入的函数，用于显示广告
const { ccclass } = _decorator;

@ccclass("GameUI")
export class GameUI extends Component {
  private _advBtn: Node = null;

  private _blockContainer: Node = null;

  private _blockManager: BlockManager = null;
  
  private _effectContainer: Node = null;

  private _effectManager: EffectManager = null;
    
  private _step: number = 0;

  private _hand: Node = null;

  private _loading:Node = null;

  public isGameOver: boolean = false;


  onLoad(): void {
    this.initModule();
    this.initEvent();

    // Sound.ins.play(Sound.music.bgm);

    // for (let i = 0; i < 24; i++) {
    //   resources.preload(`images/tiles/${i}/spriteFrame`, SpriteFrame);
    // }

    gameConfig.loadConfig().then(() => {
      this.init();
    });
  }

  private initModule() {
    this._advBtn = this.node.getChildByName("btn_adv");
    this._blockContainer = this.node.getChildByName("block_container");    
    this._effectContainer = this.node.getChildByName("effect_container");    

    this._hand = find("Canvas/hand");
    this._loading = find("Canvas/loading");

    this._blockManager = new BlockManager(this._blockContainer);    
    this._effectManager = new EffectManager(this._effectContainer);       
  }

  private init() {
    this._blockManager.init();    

    resources.load(
      `images/button/playnow_${gameConfig.getSimplifiedLanguage()}/spriteFrame`,
      SpriteFrame,
      (err, spriteFrame) => {
        if (err) {
          console.error("加载立即游戏按钮失败:", err);
          return;
        }
        this._advBtn.getComponent(Sprite).spriteFrame = spriteFrame;
      }
    );

    tween(this._advBtn)
      .repeatForever(
        tween()
          .to(1.0, { scale: new Vec3(3.2, 3.2, 3.2) })
          .to(1.0, { scale: new Vec3(3, 3, 3) })
      )
      .start();


    
    //test
    this.onGuideShow();  
  }

  private initEvent() {
    this._advBtn.on(Input.EventType.TOUCH_END, this.onAdvBtnClick, this);

    EventBus.instance.on(EventBus.AdvJumpEvent, this.onAdvBtnClick, this);
    EventBus.instance.on(EventBus.GameStart, this.onGameStart, this);
    EventBus.instance.on(EventBus.GameOver, this.onGameOver, this);

    EventBus.instance.on(EventBus.GuideShow, this.onGuideShow, this);

    EventBus.instance.on(EventBus.GuideHide, this.onGuideHide, this);

    EventBus.instance.on(EventBus.PlayerStepCord, this.onSteptoJump, this);

    EventBus.instance.on(EventBus.CheckAndClear, this.onCheckAndClear, this);

    EventBus.instance.on(EventBus.HighlightBlock, this.onHighlightBlock, this);

    EventBus.instance.on(EventBus.Closelight, this.onCloselightBlock, this);

    EventBus.instance.on(EventBus.StopInteract, this.onStopInteract, this);
    
    EventBus.instance.on(EventBus.StartInteract, this.onStartInteract, this);
  }

  private onAdvBtnClick() {
    console.log("onJumpBtnClick");
    if (typeof showMyAd !== "undefined") {
      //@ts-ignore
      showMyAd();
    } else {
      // console.log("showMyAd未定义");
    }
  }

  private onGuideShow() {
    Tween.stopAllByTarget(this._hand);
    this._loading.active = false;
    this._hand.active = true;
    this._hand.position = new Vec3(-225, -375, 0);
    let t = tween(this._hand)
      .call(() => {
        this._hand.children[0].active = true;
        this._hand.children[1].active = true;
        this._hand.children[2].active = true;                
      })
      .to(1.0, { position: new Vec3(250,156, 0) })
      .delay(1.0)
      .call(() => {
        this._hand.position = new Vec3(-225, -375, 0);
        this._hand.children[0].active = false;
        this._hand.children[1].active = false;
        this._hand.children[2].active = false;
        
      })
      .delay(1.0);

    tween(this._hand).repeatForever(t).start();
  }

  private onGuideHide() {
    this._hand.active = false;
    Tween.stopAllByTarget(this._hand);
  }


  private onGameStart() {
    // this._blockManager.SetAllTilesInteractive(true);
  }

  private onGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;    
    EventBus.instance.emit(EventBus.GameOver);
    this.onAdvBtnClick();
    this.node.pauseSystemEvents(true);
    this.node.addComponent(BlockInputEvents);
  }

  private onSteptoJump() {
    this._step++;
    this._hand.active = false;
    console.log("当前步骤数:", this._step);
    if (
      gameConfig.getThreeSteps() &&
      this._step >= gameConfig.getStepsToJump()
    ) {
      // 触发三步跳广告
      EventBus.instance.emit(EventBus.AdvJumpEvent);
    }
  }

  private onCheckAndClear(pos: Vec3, hex: string, count: number) {
    this._effectManager.ShowWipeEffect(pos, hex, count);    
  }

  private onHighlightBlock() {
    this._effectManager.Highlight();
  }

  private onCloselightBlock() {
    this._effectManager.ClearHighlight();
  }

  private onStopInteract(){
    this._blockContainer.pauseSystemEvents(true);
  }

  private onStartInteract(){
    this._blockContainer.resumeSystemEvents(true);
  }
}
