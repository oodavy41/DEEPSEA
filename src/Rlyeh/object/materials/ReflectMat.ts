// @ts-nocheck
import { ResManager } from "../../ResManager";
import { Scenes } from "../../Scenes";
import { AMaterial } from "../Material";
import { CubeTexture } from "../Texture";
import { Transform } from "../Transform";

export class ReflectMat extends AMaterial {
  private tex: CubeTexture;

  constructor(GL: WebGLRenderingContext, res: ResManager, tex?: CubeTexture) {
    let path = res.resRoot + res.shadersPath;
    super(path + "reflect_mat.vert", path + "reflect_mat.frag", GL, res);
    if (tex) {
      this.setTex(tex);
    }
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

    if (!this.tex) {
      console.error("NO TEXTURE BINDED!");
    }
    this.setUniformI1i("tex", this.tex, this.scene.GL, 0);
  }

  setTex(tex: CubeTexture) {
    this.tex = tex;
  }
}
