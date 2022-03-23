import * as glm from "gl-matrix";
import { Transform } from "../object/Transform";

export class CTransform {
  parent: CTransform | null;

  private _m: glm.mat4 = glm.mat4.create();
  set m(value: glm.mat4) {
    this._m = value;
  }
  get m(): glm.mat4 {
    if (this.modifyFLAG) {
      this.make_transform();
    }
    return this._m;
  }
  private _nm: glm.mat3 = glm.mat3.create();
  set nm(value: glm.mat3) {
    this._nm = value;
  }
  get nm(): glm.mat3 {
    if (this.modifyFLAG) {
      this.make_transform();
    }
    return this._nm;
  }

  modifyFLAG: boolean;
  protected _position: glm.vec3 = glm.vec3.create();
  set position(value: glm.vec3) {
    this._position = value;
    this.modifyFLAG = true;
  }
  get position() {
    return this._position;
  }
  rotate: {
    x: number;
    y: number;
    z: number;
  };
  protected _scale: glm.vec3 = glm.vec3.create();
  set scale(value: glm.vec3) {
    this._scale = value;
    this.modifyFLAG = true;
  }
  get scale() {
    return this._scale;
  }
  earlyDarwFuncs: Array<(arg: Transform, arg2: WebGLRenderingContext) => void>;
  lateDarwFuncs: Array<(arg: Transform, arg2: WebGLRenderingContext) => void>;

  constructor(parent: CTransform | null = null) {
    this.parent = parent;
    this.m = glm.mat4.create();
    this.nm = glm.mat3.create();
    this.position = glm.vec3.fromValues(0, 0, 0);
    this.rotate = { x: 0, y: 0, z: 0 };
    this.scale = glm.vec3.fromValues(1, 1, 1);
    this.modifyFLAG = true;
    this.earlyDarwFuncs = [];
    this.lateDarwFuncs = [];
  }

  addEarlyDrawFunc(fun: (arg: Transform, arg2: WebGLRenderingContext) => void) {
    this.earlyDarwFuncs.push(fun);
  }
  cleanEarlyDrawFunc() {
    this.earlyDarwFuncs = [];
  }

  addLateDrawFunc(fun: (arg: Transform, arg2: WebGLRenderingContext) => void) {
    this.lateDarwFuncs.push(fun);
  }
  cleanLateDrawFunc() {
    this.lateDarwFuncs = [];
  }

  make_transform() {
    this.modifyFLAG = false;
    const rot = glm.quat.create();
    glm.quat.rotateX(rot, rot, this.rotate.x);
    glm.quat.rotateY(rot, rot, this.rotate.y);
    glm.quat.rotateZ(rot, rot, this.rotate.z);
    glm.mat4.fromRotationTranslationScale(
      this.m,
      rot,
      this.position,
      this.scale
    );
    if (this.parent) {
      glm.mat4.mul(this.m, this.parent.m, this.m);
    }
    glm.mat3.normalFromMat4(this.nm, this.m);
  }

  set_rx(x: number) {
    this.rotate.x = x;
    this.modifyFLAG = true;
  }
  set_ry(y: number) {
    this.rotate.y = y;
    this.modifyFLAG = true;
  }
  set_rz(z: number) {
    this.rotate.z = z;
    this.modifyFLAG = true;
  }
}
