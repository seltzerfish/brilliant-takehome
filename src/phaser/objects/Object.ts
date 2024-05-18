import { inputDisabled, showingVirtualObjects } from '$lib/stores';
import { get } from 'svelte/store';
import type MainScene from '../scenes/MainScene';

const RAY_FIRE_DISTANCE_THRESHOLD = 40;

export class Object extends Phaser.GameObjects.Container {
	text: Phaser.GameObjects.Text;
	dragging = false;
	arrowSprite!: Phaser.GameObjects.Image;

	constructor(public scene: MainScene, x: number, y: number, virtual = false) {
		super(scene, x, y);
		this.text = scene.add.text(0, 0, '🍎', {
			fontSize: '64px',
			padding: {
				y: 8
			}
		});
		this.x -= this.text.width / 2;
		this.y -= this.text.height / 2;
		this.add(this.text);
		if (!virtual) {
			this.text.setInteractive({
				cursor: 'pointer'
			});
			this.text.on('pointerover', () => {
				if (get(inputDisabled)) return;
				this.grow();
			});
			this.text.on('pointerout', () => {
				if (get(inputDisabled)) return;
				this.shrink();
			});
			this.text.on('pointerdown', this.beginDrag, this);
			this.scene.input.on('pointermove', this.drag, this);
			this.scene.input.on('pointerup', this.endDrag, this);
			this.makeArrow(scene);
		} else {
			this.text.setAlpha(0);
			this.scene.tweens.add({
				targets: this.text,
				alpha: 0.3,
				duration: 1500
			});
		}

		this.setDepth(1);
		scene.add.existing(this);
	}

	private makeArrow(scene: MainScene) {
		this.arrowSprite = scene.add.image(this.text.width / 2, this.text.height / 2, 'arrow');
		this.arrowSprite.setOrigin(0, 0.5);
		this.arrowSprite.setScale(0.1);
		this.arrowSprite.setVisible(false);
		this.add(this.arrowSprite);
	}

	private beginDrag(pointer: Phaser.Input.Pointer) {
		if (get(inputDisabled)) return;
		this.dragging = true;
		showingVirtualObjects.set(false);
		this.arrowSprite.setVisible(true);
		this.pointArrowAtCursor(pointer);
	}

	private drag(pointer: Phaser.Input.Pointer) {
		if (get(inputDisabled)) return;
		if (!this.dragging) return;
		this.pointArrowAtCursor(pointer);
	}

	private endDrag(pointer: Phaser.Input.Pointer) {
		if (get(inputDisabled)) return;
		if (!this.dragging) return;
		this.dragging = false;
		this.arrowSprite.setVisible(false);
		const distance = Phaser.Math.Distance.Between(
			this.x + this.text.width / 2,
			this.y + this.text.height / 2,
			pointer.worldX,
			pointer.worldY
		);
		if (distance > RAY_FIRE_DISTANCE_THRESHOLD) {
			this.scene.castRay(
				this.x + this.text.width / 2,
				this.y + this.text.height / 2,
				pointer.worldX,
				pointer.worldY
			);
		}
	}
	private pointArrowAtCursor(pointer: Phaser.Input.Pointer) {
		this.arrowSprite.setRotation(
			Phaser.Math.Angle.BetweenPoints(
				{ x: this.x + this.text.width / 2, y: this.y + this.text.height / 2 },
				{ x: pointer.worldX, y: pointer.worldY }
			)
		);
		// scale arrow to point to pointer
		const distance = Phaser.Math.Distance.Between(
			this.x + this.text.width / 2,
			this.y + this.text.height / 2,
			pointer.worldX,
			pointer.worldY
		);
		this.arrowSprite.setAlpha(distance > RAY_FIRE_DISTANCE_THRESHOLD ? 1 : 0.3);

		this.arrowSprite.setScale(Math.max(0.05, Math.min((distance / 50) * 0.1, 0.3)), 0.2);
	}
	private grow() {
		this.scene.add.tween({
			targets: this.text,
			scaleX: 1.2,
			scaleY: 1.2,
			x: -this.text.width * 0.1,
			y: -this.text.height * 0.1,
			duration: 100,
			ease: 'Sine.easeInOut'
		});
	}
	private shrink() {
		this.scene.add.tween({
			targets: this.text,
			scaleX: 1,
			scaleY: 1,
			x: 0,
			y: 0,
			duration: 100,
			ease: 'Sine.easeInOut'
		});
	}

	fadeOut() {
		this.scene.add.tween({
			targets: this.text,
			alpha: 0,
			duration: 500,
			onComplete: () => {
				this.destroy();
			}
		});
	}

	randomlyCastRays() {
		this.scene.time.addEvent({
			delay: Phaser.Math.Between(200, 250),
			callback: () => {
				const angle = Phaser.Math.Between(0, 360);
				this.scene.castRay(
					this.x + this.text.width / 2,
					this.y + this.text.height / 2,
					this.x + this.text.width / 2 + Math.cos(angle) * 1000,
					this.y + this.text.height / 2 + Math.sin(angle) * 1000
				);
			},
			callbackScope: this,
			loop: true
		});
	}
}
