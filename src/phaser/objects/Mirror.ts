import type MainScene from '../scenes/MainScene';

const MIRROR_WIDTH = 6;
const MIRROR_COLOR = 0x8888ff;

export class Mirror extends Phaser.GameObjects.Container {
	start: Phaser.Math.Vector2;
	end: Phaser.Math.Vector2;
	line: Phaser.GameObjects.Graphics;
	drawing = false;
	constructor(scene: MainScene, x1: number, y1: number, x2?: number, y2?: number) {
		super(scene, 0, 0);
		this.start = new Phaser.Math.Vector2(x1, y1);
		this.end = new Phaser.Math.Vector2(x2 ? x2 : x1, y2 ? y2 : y1);
		this.line = scene.add.graphics();
		this.add(this.line);

		if (!x2 && !y2) {
			this.drawing = true;
			scene.input.on('pointermove', this.updateMirror, this);
			scene.input.on('pointerup', () => {
				this.drawing = false;
			});
		}
		this.postFX.addShine();
		this.drawMirror();
		scene.add.existing(this);
	}

	updateMirror(pointer: Phaser.Input.Pointer) {
		if (this.drawing) {
			this.end.set(pointer.worldX, pointer.worldY);
			this.drawMirror();
		}
	}

	private drawMirror() {
		this.line.clear();
		this.line.lineStyle(MIRROR_WIDTH, MIRROR_COLOR);
		this.line.beginPath();
		this.line.moveTo(this.start.x, this.start.y);
		this.line.lineTo(this.end.x, this.end.y);
		this.line.closePath();
		this.line.strokePath();
	}
}
