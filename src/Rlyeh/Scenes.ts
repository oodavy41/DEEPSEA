import { vec3, vec4 } from "gl-matrix";

import { donghnut, skybox } from "./baseModels";
import { Camera } from "./Camera";
import { glclear, initgl } from "./GLCore/glfuncs";
import { Light, LIGHT_TYPE } from "./Light";
import { AMaterial } from "./object/Material";
import { RObject } from "./object/Object";
import { Transform } from "./object/Transform";
import { ResManager } from "./ResManager";

export class Scenes {
  SELF: Scenes;
  requestFramer: number;
  GL: WebGLRenderingContext | undefined;
  framectx: CanvasRenderingContext2D | undefined;
  update: (context: Scenes) => void = (c) => {};
  mainCamera: Camera;
  cameras: { [key: string]: Camera };
  lights: { [key: string]: Light }; // todo: lights feature
  skybox: Transform | undefined;
  resManager: ResManager;
  mtllib: { [key: string]: AMaterial };
  Time: number;
  deltaTime: number;
  state: number;
  glc: HTMLCanvasElement;
  OBJs: RObject[];
  initFuns: Function[];
  updtFuns: Function[];

  private _shadow: boolean;
  get shadow() {
    return this._shadow;
  }

  constructor(canvas: HTMLCanvasElement, resMgr: ResManager) {
    this.SELF = this;
    this.requestFramer = 0;
    this.state = 0;
    this.initFuns = [];
    this.updtFuns = [];
    this.resManager = resMgr;
    this._shadow = false;

    this.cameras = {};
    this.lights = {};
    this.mainCamera = this.cameras["Main"] = new Camera();
    this.mtllib = {};

    this.glc = canvas;
    this.GL = initgl(canvas);

    this.Time = 0;
    this.deltaTime = 0;

    this.OBJs = [];
  }

  ObjNums() {
    return this.OBJs.length;
  }

  LoadSence(objs: RObject[]) {
    // will overwrite exist objs
    this.OBJs = objs;
  }

  AddObj(obj: RObject) {
    this.OBJs.push(obj);
  }

  EnableShadow(width: number, height: number) {
    this.lights["Main"].enableShadow(this, width, height);
    this._shadow = true;
  }
  DisableShadow() {
    this.lights["Main"].disableShadow();
    this._shadow = false;
  }

  Run() {
    if (this.OBJs.length !== 0) {
      this._Init();
      this._update();
    } else {
      console.warn("no any OBJS be loaded");
    }
  }

  End() {
    cancelAnimationFrame(this.requestFramer);
    this.GL?.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private _Init() {
    this.Time = Date.now();

    for (let i = 0, l = this.OBJs.length; i < l; i++) {
      this.OBJs[i].init(this);
    }

    let light = this.lights["Main"];
    if (this.shadow) {
      light.depthMat.initS(this);
    }
    this.state++;
  }

  private _update() {
    this.deltaTime = Date.now() - this.Time;
    this.Time = Date.now();
    this.update?.(this);
    // ===========================render cycle

    this.GL && glclear(this.GL);

    if (this.shadow) {
      let light = this.lights["Main"];
      this.GL?.bindFramebuffer(
        this.GL?.FRAMEBUFFER,
        light.depthFrame.frameBuffer
      );
      this.GL?.viewport(0, 0, light.depthFrame.width, light.depthFrame.height);
      this.GL?.clear(this.GL?.COLOR_BUFFER_BIT | this.GL.DEPTH_BUFFER_BIT);

      for (let i = 0, l = this.OBJs.length; i < l; i++) {
        this.OBJs[i].draw(this, true);
      }

      this.GL?.readPixels(
        0,
        0,
        light.depthFrame.width,
        light.depthFrame.height,
        this.GL.RGBA,
        this.GL.UNSIGNED_BYTE,
        light.depthFrame.textData
      );

      this.GL?.bindFramebuffer(this.GL.FRAMEBUFFER, null);
      this.GL?.viewport(0, 0, this.glc.width, this.glc.height);
    }

    for (let i = 0, l = this.OBJs.length; i < l; i++) {
      this.OBJs[i].draw(this);
    }
    this.GL?.flush();
    this.requestFramer = requestAnimationFrame(() => this._update());
  }
}
