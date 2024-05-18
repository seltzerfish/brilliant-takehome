import { get } from 'svelte/store';
import type MainScene from '../scenes/MainScene';
import { canProceed, currentTextIndex, level } from '$lib/stores';

export class Eye extends Phaser.GameObjects.Container {
	eye: Phaser.GameObjects.Text;

	constructor(public scene: MainScene, x: number, y: number) {
		super(scene, x, y);

		this.eye = scene.add.text(0, 0, '👁️', {
			fontSize: '64px',
			padding: {
				y: 8
			}
		});
		this.x -= this.eye.width / 2;
		this.y -= this.eye.height / 2;

		this.add(this.eye);
		this.setDepth(1);
		this.scene.events.on('ray-hit-eye', this.hitEye, this);
		scene.add.existing(this);
	}

	private hitEye() {
		if (!this.scene) return;
		this.handleGameProgressionLogic();
		this.grow();
	}

	private handleGameProgressionLogic() {
		if (get(level) === 1) {
			canProceed.set(true);
		} else if (get(level) === 2 && get(currentTextIndex) === 0) {
			currentTextIndex.set(1);
		} else if (get(level) === 3 && this.scene.rayAnimator.getVirtualObjectsPositions().length > 1) {
			canProceed.set(true);
		} else if (get(level) === 4 && this.scene.rayAnimator.getVirtualObjectsPositions().length > 2) {
			canProceed.set(true);
		}
	}

	private grow() {
		this.scene.add.tween({
			targets: this.eye,
			scaleX: 1.4,
			scaleY: 1.4,
			x: -this.eye.width * 0.2,
			y: -this.eye.height * 0.2,
			duration: 200,
			ease: 'Sine.easeInOut',
			yoyo: true
		});
	}

	centroid(): Phaser.Math.Vector2 {
		return new Phaser.Math.Vector2(this.x + this.eye.width / 2, this.y + this.eye.height / 2);
	}
}
