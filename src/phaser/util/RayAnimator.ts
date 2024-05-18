import { level, persistentRaysAvailable, showingVirtualObjects } from '$lib/stores';
import { get } from 'svelte/store';
import type MainScene from '../scenes/MainScene';
import { RayEnding } from './ReflectionCalculator';

type RayPath = {
	graphics: Phaser.GameObjects.Graphics[];
	segments: Phaser.Geom.Line[];
	fading: boolean;
	keep: boolean;
	rayEnding: RayEnding;
};

export class RayAnimator {
	persistentRays: RayPath[] = [];
	unfoldGraphics: Phaser.GameObjects.Graphics[] = [];
	constructor(private scene: MainScene) {
		this.scene.input.on('pointerdown', (event: any) => {
			if (event.button === 1) {
				this.unfoldPersistentRays();
			}
		});
		persistentRaysAvailable.set(false);
		showingVirtualObjects.subscribe((showing) => {
			if (showing) {
				this.unfoldPersistentRays();
			} else {
				this.foldPersistentRays();
			}
		});
		level.subscribe(() => {
			this.persistentRays = [];
			persistentRaysAvailable.set(false);
		});
	}

	animateRays(raySegments: Phaser.Geom.Line[], rayEnding: RayEnding) {
		const rayPath: RayPath = {
			graphics: [],
			segments: raySegments,
			fading: false,
			rayEnding,
			keep: rayEnding === RayEnding.EYE
		};
		raySegments.forEach((ray, i) => {
			this.scene.time.delayedCall(i * 300, () => {
				const rayGraphics = this.scene.add.graphics();
				rayPath.graphics.push(rayGraphics);
				this.drawRay(ray, rayGraphics, rayPath, i === raySegments.length - 1);
			});
		});
	}

	private fadeOutPath(rayPath: RayPath) {
		rayPath.fading = true;
		for (const rayGraphics of rayPath.graphics) {
			this.scene.add.tween({
				targets: rayGraphics,
				duration: 1000,
				alpha: 0,
				onComplete: () => {
					rayGraphics.destroy();
				}
			});
		}
	}

	private drawRay(
		ray: Phaser.Geom.Line,
		rayGraphics: Phaser.GameObjects.Graphics,
		rayPath: RayPath,
		lastSegment: boolean
	) {
		if (rayPath.fading) {
			return;
		}
		this.scene.add.tween({
			targets: rayGraphics,
			duration: 300,
			x: 0,
			onUpdate: (tween) => {
				const progress = tween.progress;
				const easedProgress = Phaser.Math.Easing.Quadratic.InOut(progress);
				rayGraphics.clear();
				rayGraphics.lineStyle(5, 0xffffff);
				rayGraphics.beginPath();
				rayGraphics.moveTo(ray.x1, ray.y1);
				rayGraphics.lineTo(
					ray.x1 + (ray.x2 - ray.x1) * easedProgress,
					ray.y1 + (ray.y2 - ray.y1) * easedProgress
				);
				rayGraphics.closePath();
				rayGraphics.strokePath();
			},
			onComplete: () => {
				if (lastSegment) {
					if (rayPath.rayEnding !== RayEnding.EYE) {
						this.fadeOutPath(rayPath);
					} else {
						this.addPersistentRay(rayPath);
						this.scene.events.emit('ray-hit-eye');
					}
				}
			}
		});
	}

	private addPersistentRay(rayPath: RayPath) {
		for (const rp of this.persistentRays) {
			if (this.rayPathsAreSimilar(rp, rayPath)) {
				this.fadeOutPath(rp);
				this.persistentRays.splice(this.persistentRays.indexOf(rp), 1);
			}
		}
		this.persistentRays.push(rayPath);
		persistentRaysAvailable.set(true);
	}

	private rayPathsAreSimilar(rayPath1: RayPath, rayPath2: RayPath): boolean {
		if (rayPath1.segments.length !== rayPath2.segments.length) {
			return false;
		}
		const distanceTolerance = 60;
		for (let i = 0; i < rayPath1.segments.length; i++) {
			const segment1 = rayPath1.segments[i];
			const segment2 = rayPath2.segments[i];
			if (
				Phaser.Math.Distance.Between(segment1.x1, segment1.y1, segment2.x1, segment2.y1) >
					distanceTolerance ||
				Phaser.Math.Distance.Between(segment1.x2, segment1.y2, segment2.x2, segment2.y2) >
					distanceTolerance
			) {
				return false;
			}
		}
		return true;
	}

	private unfoldPersistentRays() {
		for (const g of this.unfoldGraphics) {
			g.destroy();
		}
		this.unfoldGraphics = [];
		for (const rayPath of this.persistentRays) {
			const lineGraphics = this.scene.add.graphics();
			this.unfoldGraphics.push(lineGraphics);
			this.scene.tweens.addCounter({
				duration: 1500,
				onUpdate: (tween) => {
					const progress = tween.getValue();
					const easedProgress = Phaser.Math.Easing.Cubic.InOut(progress);
					this.drawUnfoldedPath(rayPath, lineGraphics, easedProgress);
				}
			});
		}
	}

	private foldPersistentRays() {
		for (let i = 0; i < this.unfoldGraphics.length; i++) {
			this.scene.tweens.addCounter({
				duration: 1500,
				onUpdate: (tween) => {
					const progress = tween.getValue();
					const easedProgress = 1 - Phaser.Math.Easing.Cubic.InOut(progress);
					this.drawUnfoldedPath(this.persistentRays[i], this.unfoldGraphics[i], easedProgress);
				},
				onComplete: () => {
					if (!get(showingVirtualObjects)) {
						this.unfoldGraphics[i].destroy();
					}
				}
			});
		}
	}

	private drawUnfoldedPath(
		rayPath: RayPath,
		graphics: Phaser.GameObjects.Graphics,
		progress: number
	) {
		if (rayPath === undefined) return;
		graphics.clear();
		const unfoldedPath = this.unfoldedPath(rayPath.segments, progress);
		for (const ray of unfoldedPath) {
			graphics.lineStyle(5, 0xffffff, 0.3);
			graphics.beginPath();
			graphics.moveTo(ray.x1, ray.y1);
			graphics.lineTo(ray.x2, ray.y2);
			graphics.closePath();
			graphics.strokePath();
		}
	}

	private unfoldedPath(rayPath: Phaser.Geom.Line[], progress: number): Phaser.Geom.Line[] {
		const unfoldedPath: Phaser.Geom.Line[] = [];
		if (rayPath.length === 0) {
			return unfoldedPath;
		}

		const lastLine = rayPath[rayPath.length - 1];
		unfoldedPath[rayPath.length - 1] = lastLine;

		const targetAngle = Phaser.Math.Angle.Between(
			lastLine.x1,
			lastLine.y1,
			lastLine.x2,
			lastLine.y2
		);

		let currentEndX = lastLine.x1;
		let currentEndY = lastLine.y1;

		for (let i = rayPath.length - 2; i >= 0; i--) {
			const line = rayPath[i];
			const lineAngle = Phaser.Math.Angle.Between(line.x1, line.y1, line.x2, line.y2);

			const interpolatedAngle = Phaser.Math.Interpolation.Linear(
				[lineAngle, targetAngle],
				progress
			);

			const lineLength = Phaser.Math.Distance.Between(line.x1, line.y1, line.x2, line.y2);

			const currentStartX = currentEndX - Math.cos(interpolatedAngle) * lineLength;
			const currentStartY = currentEndY - Math.sin(interpolatedAngle) * lineLength;

			const newLine = new Phaser.Geom.Line(currentStartX, currentStartY, currentEndX, currentEndY);
			unfoldedPath[i] = newLine;

			currentEndX = currentStartX;
			currentEndY = currentStartY;
		}

		return unfoldedPath;
	}

	getVirtualObjectsPositions(): Phaser.Math.Vector2[] {
		const positions: Phaser.Math.Vector2[] = [];
		for (const rayPath of this.persistentRays) {
			const fullyUnfoldedPath = this.unfoldedPath(rayPath.segments, 1);
			positions.push(new Phaser.Math.Vector2(fullyUnfoldedPath[0].x1, fullyUnfoldedPath[0].y1));
		}
		return positions;
	}
}
