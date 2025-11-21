/** block模块全局事件 */
export enum BlockEvent {
    /** 砖块位置合法 */
    ValidDrag = "ValidDrag",
    
    /** 砖块位置不合法 */
    InvalidDrag = "InvalidDrag",

    /** 砖块位置检查*/
    CheckPosValid = "CheckPosValid",
}
