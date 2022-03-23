import { Scenes } from "../Scenes";

import { Mesh } from "./Mesh";
import { Transform } from "./Transform";

export class RObject {
  Tranforms: { [key: string]: Transform };

  constructor(trans?: { [key: string]: Transform }) {
    this.Tranforms = trans ? trans : {};
  }

  newT(name: string) {
    this.Tranforms[name] = new Transform();
  }

  addmesh(name: string, mesh: Mesh) {
    this.Tranforms[name].add_mesh(mesh);
  }

  setParent(value: RObject) {
    let k = Object.keys(value.Tranforms)[0];
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].parent = value.Tranforms[k];
      }
    }
  }
  init(scene: Scenes) {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].init(scene);
      }
    }
  }

  draw(scene: Scenes, noMat: boolean = false) {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].draw(scene, noMat);
      }
    }
  }

  setInfo(
    scene: Scenes,
    fun: (arg: Transform, arg2: WebGLRenderingContext) => void
  ) {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        fun(this.Tranforms[key], scene.GL!);
      }
    }
  }

  setEarlyDraw(fun: (arg: Transform, arg2: WebGLRenderingContext) => void) {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].addEarlyDrawFunc(fun);
      }
    }
  }

  cleanEarlyDraw() {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].cleanEarlyDrawFunc();
      }
    }
  }

  setLateDraw(fun: (arg: Transform, arg2: WebGLRenderingContext) => void) {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].addLateDrawFunc(fun);
      }
    }
  }

  cleanLateDraw() {
    for (let key in this.Tranforms) {
      if (this.Tranforms[key] as Transform) {
        this.Tranforms[key].cleanLateDrawFunc();
      }
    }
  }
}
