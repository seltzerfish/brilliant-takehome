import type MainScene from '../scenes/MainScene';

const WALL_WIDTH = 6;
const WALL_COLOR = 0x222222;

export class Wall extends Phaser.GameObjects.Container {
	start: Phaser.Math.Vector2;
	end: Phaser.Math.Vector2;
	line: Phaser.GameObjects.Graphics;
	constructor(scene: MainScene, x1: number, y1: number, x2?: number, y2?: number) {
		super(scene, 0, 0);
		this.start = new Phaser.Math.Vector2(x1, y1);
		this.end = new Phaser.Math.Vector2(x2 ? x2 : x1, y2 ? y2 : y1);
		this.line = scene.add.graphics();
		this.add(this.line);
		this.drawWall();
		scene.add.existing(this);
	}

	private drawWall() {
		this.line.clear();
		this.line.lineStyle(WALL_WIDTH, WALL_COLOR);
		this.line.beginPath();
		this.line.moveTo(this.start.x, this.start.y);
		this.line.lineTo(this.end.x, this.end.y);
		this.line.closePath();
		this.line.strokePath();
	}
}
