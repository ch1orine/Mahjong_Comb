import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CubeBll')
export class CubeBll extends Component {

    bezier(p0:Vec3, p1:Vec3, p2:Vec3, t:number) {
        const u = 1 - t;
        return new Vec3(
            u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, 
            u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
            u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z);
    }

    controlPoint(p0:Vec3, p2:Vec3, weight: number = 200, height: number = 200, random: number = 50) : Vec3 {
        return new Vec3(
            (p0.x + p2.x) / 2 + (Math.random() - 0.5) * random + weight,
            height,
            (p0.z + p2.z) / 2 + (Math.random() - 0.5) * random + weight
        );
    }
}

