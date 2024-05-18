import { Eye } from '../objects/Eye';
import type { Mirror } from '../objects/Mirror';
import { Wall } from '../objects/Wall';
import type MainScene from '../scenes/MainScene';

export enum RayEnding {
	WALL,
	MIRROR,
	EYE,
	OFF_SCREEN
}

export class ReflectionCalculator {
	private MAX_REFLECTIONS = 35;

	constructor(private scene: MainScene) {}
	getReflections(ray: Phaser.Geom.Line): { raySegments: Phaser.Geom.Line[]; rayEnding: RayEnding } {
		const raySegments: Phaser.Geom.Line[] = [];
		let rayEnding: RayEnding = RayEnding.MIRROR;
		let currentRay = ray;
		for (let i = 0; i < this.MAX_REFLECTIONS; i++) {
			Phaser.Geom.Line.Extend(currentRay, 0, this.scene.scale.width);
			const { collisionObject, closestIntersection } = this.getNextCollision(currentRay);
			if (!collisionObject) {
				// went off screen
				rayEnding = RayEnding.OFF_SCREEN;
				raySegments.push(currentRay);
				break;
			}
			const choppedRay = new Phaser.Geom.Line(
				currentRay.x1,
				currentRay.y1,
				closestIntersection!.x,
				closestIntersection!.y
			);
			raySegments.push(choppedRay);
			if (collisionObject instanceof Wall) {
				rayEnding = RayEnding.WALL;
				break;
			}
			if (collisionObject instanceof Eye) {
				rayEnding = RayEnding.EYE;
				break;
			}
			const reflectedRay = this.reflectRay(currentRay, collisionObject);
			currentRay = reflectedRay;
		}

		return { raySegments, rayEnding };
	}

	private getNextCollision(ray: Phaser.Geom.Line): {
		collisionObject: Mirror | Wall | Eye | null;
		closestIntersection: Phaser.Math.Vector2 | null;
	} {
		let closestIntersection: Phaser.Math.Vector2 | null = null;
		let collisionObject: Mirror | Wall | Eye | null = null;
		this.scene.mirrors.forEach((mirror) => {
			const intersection = new Phaser.Math.Vector2();
			const mirrorLine = new Phaser.Geom.Line(
				mirror.start.x,
				mirror.start.y,
				mirror.end.x,
				mirror.end.y
			);
			if (Phaser.Geom.Intersects.LineToLine(ray, mirrorLine, intersection)) {
				if (
					!closestIntersection ||
					Phaser.Math.Distance.BetweenPoints(intersection, ray.getPointA()) <
						Phaser.Math.Distance.BetweenPoints(closestIntersection, ray.getPointA())
				) {
					closestIntersection = intersection;
					collisionObject = mirror;
				}
			}
		});
		this.scene.walls.forEach((wall) => {
			const intersection = new Phaser.Math.Vector2();
			const wallLine = new Phaser.Geom.Line(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
			if (Phaser.Geom.Intersects.LineToLine(ray, wallLine, intersection)) {
				if (
					!closestIntersection ||
					Phaser.Math.Distance.BetweenPoints(intersection, ray.getPointA()) <
						Phaser.Math.Distance.BetweenPoints(closestIntersection, ray.getPointA())
				) {
					closestIntersection = intersection;
					collisionObject = wall;
				}
			}
		});
		if (this.scene.eye) {
			const intersection = new Phaser.Math.Vector2();
			const eyePos = this.scene.eye.centroid();
			const eyeCircle = new Phaser.Geom.Circle(eyePos.x, eyePos.y - 6, 35);

			if (Phaser.Geom.Intersects.LineToCircle(ray, eyeCircle, intersection)) {
				if (
					!closestIntersection ||
					Phaser.Math.Distance.BetweenPoints(intersection, ray.getPointA()) <
						Phaser.Math.Distance.BetweenPoints(closestIntersection, ray.getPointA())
				) {
					closestIntersection = intersection;
					collisionObject = this.scene.eye;
				}
			}
		}
		return { collisionObject, closestIntersection };
	}

	private reflectRay(ray: Phaser.Geom.Line, mirror: Mirror): Phaser.Geom.Line {
		const mirrorLine = new Phaser.Geom.Line(
			mirror.start.x,
			mirror.start.y,
			mirror.end.x,
			mirror.end.y
		);

		const reflectAngle = Phaser.Geom.Line.ReflectAngle(ray, mirrorLine);

		let direction = new Phaser.Math.Vector2(ray.x2 - ray.x1, ray.y2 - ray.y1);
		const intersection = new Phaser.Math.Vector2();
		Phaser.Geom.Intersects.LineToLine(ray, mirrorLine, intersection);
		direction.normalize();
		let adjustedIntersection = new Phaser.Math.Vector2(
			intersection.x - direction.x,
			intersection.y - direction.y
		);

		const reflectedRay = new Phaser.Geom.Line(0, 0, 100, 100);
		Phaser.Geom.Line.SetToAngle(
			reflectedRay,
			adjustedIntersection.x,
			adjustedIntersection.y,
			reflectAngle,
			100
		);
		return reflectedRay;
	}
}
