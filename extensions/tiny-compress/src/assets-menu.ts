import { AssetInfo } from "./cocos";
import { compress } from './tinypng';

/**
 * 资源面板右键菜单
 */
export function onAssetMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'i18n:tinypng-compress.compress',  // "图片压缩"
            click() {
                console.log(`[TinyPNG] 开始压缩: ${assetInfo.file}`);
                compress(assetInfo.file);
            }
        }
    ];
}