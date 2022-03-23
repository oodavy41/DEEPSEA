import * as glm from "gl-matrix";

import { CTransform } from "./component/CTransform";
import { makeMvp } from "./GLCore/glfuncs";
import { RLSettings } from "./GLOBAL/setting";

const set = RLSettings;
export class Camera extends CTransform {
  private _cameraModified = true;
  private _cameraUp: glm.vec3 = glm.vec3.create();
  set cameraUp(value: glm.vec3) {
    glm.vec3.normalize(value, value);
    this._cameraUp = value;
    this._cameraModified = true;
  }
  get cameraUp(): glm.vec3 {
    return this._cameraUp;
  }
  private _cameraAim: glm.vec3 = glm.vec3.create();
  set cameraAim(value: glm.vec3) {
    this._cameraAim = value;
    this._cameraModified = true;
  }
  get cameraAim(): glm.vec3 {
    return this._cameraAim;
  }
  private cameraRight: glm.vec3;
  private elevation: number = 0;

  cameraInfo: number[];

  private _mvp: glm.mat4 | null;

  get mvp() {
    if (this._cameraModified) {
      this.reset();
    }
    return this._mvp;
  }

  set position(value: glm.vec3) {
    this._position = value;
    this.modifyFLAG = true;
    this._cameraModified = true;
  }
  get position() {
    return this._position;
  }

  constructor() {
    super();

    this.cameraRight = glm.vec3.fromValues(1, 0, 0);
    this.cameraAim = glm.vec3.fromValues(0, 0, -1);
    this.cameraUp = glm.vec3.fromValues(0, 1, 0);
    this.cameraInfo = [Math.PI / 3, 9 / 16, 0.01, 10000];

    this._mvp = null;
  }

  private reset() {
    if (this.cameraAim && this.cameraUp && this.cameraRight) {
      let camera_front = glm.vec3.create();

      glm.vec3.sub(camera_front, this.cameraAim, this.position);
      glm.vec3.normalize(camera_front, camera_front);
      glm.vec3.cross(this.cameraRight, camera_front, this.cameraUp);

      this.elevation =
        (glm.vec3.angle(
          glm.vec3.sub(glm.vec3.create(), this.cameraAim, this.position),
          this.cameraUp
        ) /
          Math.PI) *
        180;
      if (this.elevation < set.FPSZeroElevation) {
        console.error("camera", "camera aim to high");
        return;
      }
      this.makemvp();
    }
  }

  makemvp() {
    if (this.position && this.cameraAim && this.cameraUp && this.cameraInfo) {
      // todo: aim rotate/aim modify
      this._mvp = makeMvp(
        [this.position, this.cameraAim, this.cameraUp],
        this.cameraInfo
      );
    }
    this._cameraModified = false;
  }

  // movement:boolean[]=[w,a,s,d];
  fps_ctrl(x: number, y: number, movement: boolean[]) {
    let camera_front = glm.vec3.create();

    glm.vec3.sub(camera_front, this.cameraAim, this.position);
    glm.vec3.normalize(camera_front, camera_front);
    glm.vec3.cross(this.cameraRight, camera_front, this.cameraUp);

    const ret = [y, -x];

    ret[0] = Math.max(ret[0], -set.FPSraid);
    ret[1] = Math.max(ret[1], -set.FPSraid);
    ret[0] = Math.min(ret[0], set.FPSraid);
    ret[1] = Math.min(ret[1], set.FPSraid);

    let angx = (Math.asin(ret[0] / set.FPSraid) / Math.PI) * 180;
    let angy = (Math.asin(ret[1] / set.FPSraid) / Math.PI) * 180;

    if (!this.elevation) {
      this.reset();
    }
    let matx = glm.mat4.create();
    let maty = glm.mat4.create();
    let newFront = glm.vec3.clone(this.cameraUp);
    this.elevation += angx;
    this.elevation = Math.min(this.elevation, 180 - set.FPSZeroElevation);
    this.elevation = Math.max(this.elevation, set.FPSZeroElevation);
    glm.mat4.rotate(
      matx,
      matx,
      (-this.elevation / 180) * Math.PI,
      this.cameraRight
    );
    glm.mat4.rotate(maty, maty, (angy / 180) * Math.PI, this.cameraUp);
    glm.vec3.transformMat4(newFront, newFront, matx);
    glm.vec3.transformMat4(newFront, newFront, maty);

    glm.vec3.add(this.cameraAim, this.position, newFront);

    this.makemvp();
    return ret;
  }

  movectrl(movement: boolean[]) {
    let abf = glm.vec3.create(),
      abr = glm.vec3.create();
    let front = glm.vec3.create();
    glm.vec3.sub(front, this.cameraAim, this.position);
    const wasd = [
      front,
      glm.vec3.scale(abr, this.cameraRight, -1),
      glm.vec3.scale(abf, front, -1),
      this.cameraRight,
    ];

    const ret = glm.vec3.fromValues(0, 0, 0);

    for (let i = 0; i < 4; i++) {
      if (movement[i]) {
        glm.vec3.add(ret, ret, wasd[i]);
      }
    }

    glm.vec3.normalize(ret, ret);

    glm.vec3.scale(ret, ret, set.MoveSpeed);

    glm.vec3.add(this.position, this.position, ret);
    glm.vec3.add(this.cameraAim, this.cameraAim, ret);
    this.makemvp();
  }
}
