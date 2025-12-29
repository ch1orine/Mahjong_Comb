import { _decorator, color, Color, Component, Graphics, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

interface LineSegment {
    start: Vec3;
    end: Vec3;
    color: Color;
    lineWidth: number;
}

@ccclass('DrawLine')
export class DrawLine extends Component {
    
    private lines: LineSegment[] = []; // 存储所有线段
    private g!: Graphics; // Graphics 组件

    protected onLoad(): void {        
         this.g = this.addComponent(Graphics);
    }

    /** 绘制从起点到终点的线段并记录 */
    drawLine(start: Vec3, end: Vec3, color: Color = new Color(120, 255, 160, 255), lineWidth: number = 8) {
        if (!this.g) return;
        
        // 记录线段
        this.lines.push({ start, end, color, lineWidth });
        
        // 重绘所有线段
        // this.draw();
    
        this.drawAll();
        // for (const line of this.lines) {
        //     this.g.lineWidth = lineWidth;
        //     this.g.lineCap = Graphics.LineCap.ROUND;
        //     this.g.lineJoin = Graphics.LineJoin.ROUND;
        //     this.g.strokeColor = color;
            
        //     this.g.moveTo(line.start.x, line.start.y);
        //     this.g.lineTo(line.end.x, line.end.y);
        //     this.g.stroke();
        // }
    }

    /** 移除指定索引的线段 */
    removeLineAt(index: number) {
        if (index >= 0 && index < this.lines.length) {
            this.lines.splice(index, 1);
            this.drawAll();
        }
    }

    /** 移除最后一条线段 */
    removeLastLine() {
        if (this.lines.length > 0) {
            this.lines.pop();
            this.drawAll();
        }
    }

    /** 清除所有绘制内容 */
    clearLines() {
        this.lines = [];
        if (this.g) {
            this.g.clear();
        }
    }

    /** 重绘所有线段 */
    private drawAll() {
        if (!this.g) return;
        
        this.g.clear();
        
        // 1. 先绘制所有背景粗线（低透明）
        for (const line of this.lines) {
            this.g.lineWidth = line.lineWidth + 12;
            this.g.lineCap = Graphics.LineCap.ROUND;
            this.g.lineJoin = Graphics.LineJoin.ROUND;
            this.g.strokeColor = new Color(80, 255, 120, 80);

            this.g.moveTo(line.start.x, line.start.y);
            this.g.lineTo(line.end.x, line.end.y);
            this.g.stroke();
        }
        
        // 2. 然后绘制所有中景线（半透明）
        for (const line of this.lines) {
            this.g.lineWidth = line.lineWidth + 6;
            this.g.lineCap = Graphics.LineCap.ROUND;
            this.g.lineJoin = Graphics.LineJoin.ROUND;
            this.g.strokeColor = new Color(80, 255, 120, 128);

            this.g.moveTo(line.start.x, line.start.y);
            this.g.lineTo(line.end.x, line.end.y);
            this.g.stroke();
        }

        // 3. 再绘制所有前景细线（实色）
        for (const line of this.lines) {
            this.g.lineWidth = line.lineWidth;
            this.g.lineCap = Graphics.LineCap.ROUND;
            this.g.lineJoin = Graphics.LineJoin.ROUND;
            this.g.strokeColor = Color.WHITE;
            
            this.g.moveTo(line.start.x, line.start.y);
            this.g.lineTo(line.end.x, line.end.y);
            this.g.stroke();
        }
    }

    /** 获取当前线段数量 */
    getLineCount(): number {
        return this.lines.length;
    }
}

