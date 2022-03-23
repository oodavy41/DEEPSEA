// @ts-nocheck
import { mat4 } from "gl-matrix";

import { ResManager } from "../../ResManager";
import { Scenes } from "../../Scenes";
import { AMaterial } from "../Material";
import { Transform } from "../Transform";

export class DepthMat extends AMaterial {
  constructor(GL: WebGLRenderingContext, res: ResManager) {
    let path = res.resRoot + res.shadersPath;
    super(path + "shadow_only.vert", path + "shadow_only.frag", GL, res);
  }
  initS(scene: Scenes) {
    this.scene = scene;
  }
  drawS(mvpM: mat4, modelM: mat4) {
    super.draw();
    this.setUniformM4f("mvpMatrix", mvpM, this.scene.GL);
    this.setUniformM4f("modelMatrix", modelM, this.scene.GL);
  }
}
