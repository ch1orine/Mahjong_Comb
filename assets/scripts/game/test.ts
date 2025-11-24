import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  resources,
} from "cc";
import { BlockManager } from "./manager/BlockManager";
const { ccclass, property } = _decorator;

@ccclass("test")
export class test extends Component {
  start() {
    resources.load("prefabs/game", Prefab, (err, prefab) => {
      if (err) {
        console.error(err);
      }
      const node = instantiate(prefab);
      node.parent = this.node;
      const manager = new BlockManager();
      manager.init();
    });
  }
}
