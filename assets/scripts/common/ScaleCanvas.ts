import { _decorator, Component, view, ResolutionPolicy, Enum } from "cc";
const { ccclass, property } = _decorator;

/**
 * ScaleCanvas
 * 简单的“重设分辨率”脚本：
 * - 在加载时按设置的设计分辨率与缩放策略重设
 * - 监听窗口尺寸变化并自动重设（可关闭）
 * - 可在按钮事件里直接绑定调用 resetResolution()
 */
@ccclass("ScaleCanvas")
export class ScaleCanvas extends Component {
  private _designSize = { width: 0, height: 0 };

  onLoad(): void {
    // 初次进入时重设一次
    this._designSize = view.getDesignResolutionSize();
    view.resizeWithBrowserSize(true);
    this.resetResolution();
    // 监听窗口变化
    // Cocos Creator 3.8 使用字符串事件名监听画布尺寸变化
    view.on("canvas-resize", this._onResize, this);
  }

  onDestroy(): void {
    view.off("canvas-resize", this._onResize, this);
  }

  /**
   * 对外暴露的方法，可在按钮点击事件中直接绑定调用
   */
  public resetResolution(): void {
    // 应用当前配置的设计分辨率与策略
    // try {
    //     view.setDesignResolutionSize(this.designWidth, this.designHeight, this.policy as number);
    // } catch (e) {
    //     // 某些平台/版本若 policy 不兼容，退回为沿用当前策略
    //     const currentPolicy = (view as any).getResolutionPolicy ? (view as any).getResolutionPolicy() : ResolutionPolicy.SHOW_ALL;
    //     view.setDesignResolutionSize(this.designWidth, this.designHeight, currentPolicy as any);
    // }
    var winSize = view.getVisibleSize();
    var aspect = winSize.width / winSize.height;
    if (aspect > this._designSize.width / this._designSize.height) {
      view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
    } else {
      view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
    }
    console.log("resize");
  }

  private _onResize() {
    this.resetResolution();
  }
}
