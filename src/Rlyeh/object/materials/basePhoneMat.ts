// @ts-nocheck
import { vec4 } from "gl-matrix";

import { LIGHT_TYPE } from "../../Light";
import { ResManager } from "../../ResManager";
import { Scenes } from "../../Scenes";
import { AMaterial } from "../Material";
import { CubeTexture, Texture } from "../Texture";
import { Transform } from "../Transform";

export class BasePhoneMat extends AMaterial {
  private tex: CubeTexture;
  metalless: number;
  smoothness: number;

  constructor(GL: WebGLRenderingContext, res: ResManager, tex?: CubeTexture) {
    let path = res.resRoot + res.shadersPath;
    super(path + "base_phone.vert", path + "base_phone.frag", GL, res);
    this.metalless = 0;
    this.smoothness = 0;
    if (tex) {
      this.setTex(tex);
    }
  }

  draw() {
    super.draw();
    let lightVector: vec4;
    if (this.scene.lights["Main"].type === LIGHT_TYPE.DIRECTION) {
      let dir = this.scene.lights["Main"].lightDirection;
      lightVector = vec4.fromValues(dir[0], dir[1], dir[2], 0);
    } else {
      let pos = this.scene.lights["Main"].position;
      lightVector = vec4.fromValues(pos[0], pos[1], pos[2], 1);
    }
    this.setUniformV4f("lightVector", lightVector, this.scene.GL);
    this.setUniformV4f(
      "lightColor",
      this.scene.lights["Main"].lightColor,
      this.scene.GL
    );
    this.setUniformV3f(
      "cameraPos",
      this.scene.mainCamera.position,
      this.scene.GL
    );
    this.setUniformM4f("mvpMatrix", this.scene.mainCamera.mvp, this.scene.GL);
    this.setUniformM4f("modelMatrix", this.transform.m, this.scene.GL);
    this.setUniformM3f("normalMatrix", this.transform.nm, this.scene.GL);
    this.setUniform_1f("metalless", this.metalless, this.scene.GL);
    this.setUniform_1f("smoothness", this.smoothness, this.scene.GL);

    this.setUniformI1i("tex", this.tex, this.scene.GL, 0);
  }

  setTex(tex: CubeTexture) {
    this.tex = tex;
  }
  rmTex() {
    this.tex = undefined;
  }
}
