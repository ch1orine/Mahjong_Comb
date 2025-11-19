"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAssetMenu = void 0;
const tinypng_1 = require("./tinypng");
/**
 * 资源面板右键菜单
 */
function onAssetMenu(assetInfo) {
    return [
        {
            label: 'i18n:tinypng-compress.compress',
            click() {
                console.log(`[TinyPNG] 开始压缩: ${assetInfo.file}`);
                (0, tinypng_1.compress)(assetInfo.file);
            }
        }
    ];
}
exports.onAssetMenu = onAssetMenu;
