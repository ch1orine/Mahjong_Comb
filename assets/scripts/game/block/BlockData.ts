export enum ShapeType {
  "one对角" = 0,
  "two对角" = 1,
  "上三角" = 2,
  "正方" = 3,
  "横线" = 4,
  "L形" = 5,
}

export const ShapeMap: Record<ShapeType, number[][]> = {
  [ShapeType.one对角]: [
    [1, 0],
    [0, 1],
  ],

  [ShapeType.横线]: [
    [1, 1, 1]
  ],

  [ShapeType.正方]: [
    [1, 1],
    [1, 1],
  ],

  [ShapeType.上三角]: [
    [0, 1, 0],
    [1, 1, 1],
  ],

  [ShapeType.two对角]: [
    [0, 1],
    [1, 0],
  ],
  
  [ShapeType.L形]: [
    [1, 1],
    [0, 1],
  ],
};

export const ShapeColorMap: Record<ShapeType, string> = {
  [ShapeType.one对角]: "purple", // 紫色 0
  [ShapeType.two对角]: "purple", // 紫色 0
  [ShapeType.上三角]: "red", // 红色 2
  [ShapeType.正方]: "green", // 绿色 3
  [ShapeType.横线]: "blue", //蓝色 4
  [ShapeType.L形]: "cyan", // 青色 5
}

export const ShapeColorHexMap: Record<ShapeType, string> = {
  [ShapeType.one对角]: "#9152E0", // 紫色 0
  [ShapeType.two对角]: "#9152E0", // 紫色 0
  [ShapeType.上三角]: "#ff0d00ff", // 红色 2
  [ShapeType.正方]: "#00ff40ff", // 绿色 3
  [ShapeType.横线]: "#375FED", //蓝色 4
  [ShapeType.L形]: "#00bbffff", // 青色 5
}


export const ShapeTypeList: ShapeType[] = [
  ShapeType.L形,
  ShapeType.上三角,
  ShapeType.one对角,
  ShapeType.two对角,
  ShapeType.正方,
  ShapeType.横线,
];

// 棋盘格配置常量
export const GridConfig = {
  CELL_SIZE: 83,    // 格子大小（像素）
  ROWS: 8,          // 行数
  COLS: 8,          // 列数  
} as const;


export const ColorMap: Record<number, string> = {
  0: "purple", // 紫色 0
  1: "orange", // 橙色 1
  2: "red",    // 红色 2
  3: "green",  // 绿色 3
  4: "blue",   // 蓝色 4
  5: "cyan",   // 青色 5
  6: "yellow", // 黄色 6
}


export const GridBoardConfig =[  
  [ 4,  4,  4,  5, -1, -1,  1,  1],
  [ 4, -1, -1,  5,  6,  6,  1,  1],
  [ 4, -1, -1,  5,  2,  2,  1,  1],
  [ 3,  3,  6,  6,  0,  5, -1, -1],
  [ 3,  3,  6,  6,  0,  0,  5, -1],
  [ 2,  2,  2,  1,  0, -1,  3,  3],
  [ 2,  1,  1,  1, -1, -1, -1,  3],
  [-1, -1, -1, -1, -1, -1, -1,  3],
];

export const CellConfig = {
  CELL_SIZE: 83,    // 格子大小（像素）
  ROWS: 8,          // 行数
  COLS: 8,          // 列数    
} as const;
