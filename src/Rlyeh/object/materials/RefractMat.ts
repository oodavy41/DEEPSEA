// @ts-nocheck
import { ResManager } from "../../ResManager";
import { Scenes } from "../../Scenes";
import { AMaterial } from "../Material";
import { CubeTexture } from "../Texture";
import { Transform } from "../Transform";

export class RefractMat extends AMaterial {
  tex: CubeTexture;
  ratio: number;
  constructor(GL: WebGLRenderingContext, res: ResManager, tex?: CubeTexture) {
    let path = res.resRoot + res.shadersPath;
    super(path + "refract_mat.vert", path + "refract_mat.frag", GL, res);
    if (tex) {
      this.setTex(tex);
    }
    this.ratio = 1.0 / 2.4;
  }

  draw() {
    super.draw();
    this.setUniformV3f(
      "cameraPos",
      this.scene.mainCamera.position,
      this.scene.GL
    );
    this.setUniformM4f("mvpMatrix", this.scene.mainCamera.mvp, this.scene.GL);
    this.setUniformM4f("modelMatrix", this.transform.m, this.scene.GL);
    this.setUniformM3f("normalMatrix", this.transform.nm, this.scene.GL);
    this.setUniform_1f("ratio", this.ratio, this.scene.GL);

    if (!this.tex) {
      console.error("NO TEXTURE BINDED!");
    }
    this.setUniformI1i("tex", this.tex, this.scene.GL, 0);
  }
  setTex(tex: CubeTexture) {
    this.tex = tex;
  }
}
