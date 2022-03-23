// @ts-nocheck
import { ResManager } from "../../ResManager";
import { Scenes } from "../../Scenes";
import { AMaterial } from "../Material";
import { Transform } from "../Transform";

export class AnimiEdgeMat extends AMaterial {
  constructor(GL: WebGLRenderingContext, res: ResManager) {
    let path = res.resRoot + res.shadersPath;
    super(
      path + "anim_edge_phone.vert",
      path + "anim_edge_phone.frag",
      GL,
      res
    );
  }

  draw() {
    super.draw();
    if (this.scene && this.transform)
      this.setUniformM4f("mvpMatrix", this.scene.mainCamera.mvp, this.scene.GL);
    this.setUniformM4f("modelMatrix", this.transform.m, this.scene.GL);
    this.setUniformM3f("normalMatrix", this.transform.nm, this.scene.GL);
  }
}
