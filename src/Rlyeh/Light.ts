// @ts-nocheck
import { mat4, vec3, vec4 } from "gl-matrix";

import { CTransform } from "./component/CTransform";
import { makeMvp } from "./GLCore/glfuncs";
import { DepthMat } from "./object/materials/depthMat";
import { FrameTexture } from "./object/Texture";
import { Scenes } from "./Scenes";

export enum LIGHT_TYPE {
  POINT,
  SPOT,
  DIRECTION,
}

export class Light extends CTransform {
  type: LIGHT_TYPE;

  private _position: vec3;
  set position(pos: vec3) {
    this._position = pos;
    this.modifyFLAG = true;
  }
  get position() {
    return this._position;
  }

  private _lightAim: vec3;
  set lightAim(aim: vec3) {
    this.modifyFLAG = true;
    this._lightAim = aim;
  }
  get lightAim() {
    return this._lightAim;
  }

  private _lightDirection: vec3;
  get lightDirection() {
    if (this.modifyFLAG) {
      this.makemvp();
    }
    return this._lightDirection;
  }

  depthMat: DepthMat;
  lightColor: vec4;
  spotAngel: number;

  private _lightMVP: mat4;
  set lightMVP(mvp: mat4) {
    this._lightMVP = mvp;
  }

  get lightMVP() {
    if (this.modifyFLAG) {
      this.makemvp();
    }
    return this._lightMVP;
  }
  depthFrame: FrameTexture;

  constructor(
    type: LIGHT_TYPE,
    position: vec3,
    lightAim: vec3,
    lightCol: vec4,
    angel?: number
  ) {
    super();
    if (type === LIGHT_TYPE.SPOT && angel === undefined) {
      console.error("define an spot light without angel!");
    }
    this.type = type;
    this._lightDirection = vec3.create();
    this.position = position;
    this.lightAim = lightAim;
    this.lightColor = lightCol;
    this.depthFrame = undefined;
  }
  makemvp() {
    let cameraInfo: number[];
    switch (this.type) {
      case LIGHT_TYPE.DIRECTION:
        cameraInfo = [-20, 20, -20, 20, 1, 100];
        break;
      case LIGHT_TYPE.POINT:
        cameraInfo = [40, Math.PI / 2, 1, 100];
        break;
    }
    vec3.sub(this._lightDirection, this.lightAim, this.position);
    if (this.position && this.lightAim) {
      this.lightMVP = makeMvp(
        [this.position, this.lightAim, vec3.fromValues(0, 1, 0)],
        cameraInfo
      );
    }
    super.make_transform();
  }

  enableShadow(scene: Scenes, width: number, height: number) {
    this.depthMat = new DepthMat(scene.GL, scene.resManager);
    this.depthFrame = new FrameTexture(scene.GL, width, height, true);
    this.makemvp();
  }

  disableShadow() {
    this.depthMat = undefined;
    this.depthFrame = undefined;
  }
}
