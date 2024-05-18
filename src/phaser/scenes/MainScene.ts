import { clearLevel, inputDisabled, level, showingVirtualObjects } from '$lib/stores';
import { get } from 'svelte/store';
import { Eye } from '../objects/Eye';
import { Mirror } from '../objects/Mirror';
import { Object } from '../objects/Object';
import { RayAnimator } from '../util/RayAnimator';
import { RayEnding, ReflectionCalculator } from '../util/ReflectionCalculator';
import { LEVELS, type Level } from '$lib/levels';
import { Wall } from '../objects/Wall';

export default class MainScene extends Phaser.Scene {
	eye!: Eye;
	mirrors!: Mirror[];
	walls!: Wall[];
	objects!: Object[];
	virtualObjects!: Object[];
	reflectionCalculator!: ReflectionCalculator;
	rayAnimator!: RayAnimator;
	level!: Level;

	constructor() {
		super('main');
	}

	create() {
		const currentLevelIndex = get(level);
		this.level = LEVELS[currentLevelIndex];

		this.setUpLevel();
		this.triggerLevelSpecificActions();

		this.reflectionCalculator = new ReflectionCalculator(this);
		this.rayAnimator = new RayAnimator(this);
		this.setupSceneRestartListeners(currentLevelIndex);

		this.fadeInCamera();

		showingVirtualObjects.subscribe((showing) => {
			if (showing) {
				this.showVirtualObjects();
			} else {
				this.hideVirtualObjects();
			}
		});
	}

	private fadeInCamera() {
		this.cameras.main.setAlpha(0);
		this.tweens.add({
			targets: this.cameras.main,
			duration: 1000,
			alpha: 1
		});
	}

	private setupSceneRestartListeners(currentLevelIndex: number) {
		let unsub1: () => void;
		let unsub2: () => void;
		unsub1 = clearLevel.subscribe((clear) => {
			if (clear) {
				clearLevel.set(false);
				this.rayAnimator.persistentRays = [];
				unsub1();
				unsub2();
				this.scene.restart();
			}
		});
		unsub2 = level.subscribe((l) => {
			if (l !== currentLevelIndex) {
				this.scene.restart();
				unsub1();
				unsub2();
			}
		});
	}

	private setUpLevel() {
		this.mirrors = [];
		this.walls = [];
		this.objects = [];
		this.virtualObjects = [];

		if (this.level.canDrawMirrors) {
			const w = this.scale.width;
			const h = this.scale.height;
			const background = this.add.rectangle(w / 2, h / 2, w, h, 0x295191, 0);
			background.setInteractive();
			background.on('pointerdown', this.drawMirror, this);
		}

		const center = new Phaser.Math.Vector2(this.scale.width / 2, this.scale.height / 2);

		const eyePos = center
			.clone()
			.add(new Phaser.Math.Vector2(this.level.eyePosition.x, this.level.eyePosition.y));
		const objectPos = center
			.clone()
			.add(new Phaser.Math.Vector2(this.level.objectPosition.x, this.level.objectPosition.y));

		this.eye = new Eye(this, eyePos.x, eyePos.y);
		this.objects.push(new Object(this, objectPos.x, objectPos.y));

		for (const mirror of this.level.mirrors) {
			const start = center.clone().add(new Phaser.Math.Vector2(mirror.start.x, mirror.start.y));
			const end = center.clone().add(new Phaser.Math.Vector2(mirror.end.x, mirror.end.y));
			this.mirrors.push(new Mirror(this, start.x, start.y, end.x, end.y));
		}

		for (const wall of this.level.walls) {
			const start = center.clone().add(new Phaser.Math.Vector2(wall.start.x, wall.start.y));
			const end = center.clone().add(new Phaser.Math.Vector2(wall.end.x, wall.end.y));
			this.walls.push(new Wall(this, start.x, start.y, end.x, end.y));
		}
	}

	private triggerLevelSpecificActions() {
		if (get(level) === 0) {
			this.objects[0].randomlyCastRays();
		}
	}

	update(time: number, delta: number): void {}

	private drawMirror(event: Phaser.Input.Pointer) {
		if (get(inputDisabled)) return;
		const mirror = new Mirror(this, event.worldX, event.worldY);
		this.mirrors.push(mirror);
	}

	castRay(x1: number, y1: number, x2: number, y2: number) {
		const ray = new Phaser.Geom.Line(x1, y1, x2, y2);
		const { raySegments, rayEnding } = this.reflectionCalculator.getReflections(ray);

		this.rayAnimator.animateRays(raySegments, rayEnding);
	}

	private showVirtualObjects() {
		const virtualObjectPositions = this.rayAnimator.getVirtualObjectsPositions();
		for (const position of virtualObjectPositions) {
			const virtualObject = new Object(this, position.x, position.y, true);
			this.virtualObjects.push(virtualObject);
		}

		let farthestPosition = new Phaser.Math.Vector2(0, 0);
		for (const position of virtualObjectPositions) {
			if (position.length() > farthestPosition.length()) {
				farthestPosition = position;
			}
		}

		const camera = this.cameras.main;
		const cameraCenter = new Phaser.Math.Vector2(camera.width / 2, camera.height / 2);
		const distanceToFarthest = Phaser.Math.Distance.Between(
			cameraCenter.x,
			cameraCenter.y,
			farthestPosition.x,
			farthestPosition.y
		);

		const viewWidth = camera.width / 1;
		const viewHeight = camera.height / 1;

		const scaleX = distanceToFarthest / (viewWidth / 1.25);
		const scaleY = distanceToFarthest / (viewHeight / 2);
		const scale = Math.max(scaleX, scaleY);

		if (scale > 1) {
			camera.zoomTo(1 / scale, 1500);
		}
	}

	private hideVirtualObjects() {
		for (const virtualObject of this.virtualObjects) {
			virtualObject.fadeOut();
		}
		this.virtualObjects = [];
		this.cameras.main.zoomTo(1, 1500);
	}
}
