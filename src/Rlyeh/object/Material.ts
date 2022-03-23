// @ts-nocheck
import { create_program, create_shader } from "../GLCore/glfuncs";
import { ResManager } from "../ResManager";
import { Scenes } from "../Scenes";

import { CubeTexture, Texture, FrameTexture } from "./Texture";
import { Transform } from "./Transform";

export enum MTL_TYPE {
  M4f,
  M3f,
  V3f,
  V4f,
  I1i,
  _1f,
  _1b,
}

export abstract class AMaterial {
  vs: WebGLShader | null | undefined;
  fs: WebGLShader | null | undefined;
  uniforms: { [key: string]: any };

  prog: WebGLProgram | null | undefined;

  scene: Scenes | null = null;
  transform: Transform | null = null;

  constructor(
    ver_path: string,
    fra_path: string,
    GL: WebGLRenderingContext,
    res: ResManager
  ) {
    this.vs = create_shader("" + res.get(ver_path), GL, GL.VERTEX_SHADER, res);
    this.fs = create_shader(
      "" + res.get(fra_path),
      GL,
      GL.FRAGMENT_SHADER,
      res
    );
    if (this.vs && this.fs) this.prog = create_program(this.vs, this.fs, GL);

    this.uniforms = {};
  }

  init(scene: Scenes, tran: Transform) {
    this.scene = scene;
    this.transform = tran;
  }
  draw() {
    this.prog && this.scene?.GL.useProgram(this.prog);
  }

  setUniformM4f(name: string, value: Float32Array, gl: WebGLRenderingContext) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }

    gl.uniformMatrix4fv(this.uniforms[name], false, value);
    this.uniforms[name].value = value;
  }
  setUniformM3f(name: string, value: Float32Array, gl: WebGLRenderingContext) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }

    gl.uniformMatrix3fv(this.uniforms[name], false, value);
    this.uniforms[name].value = value;
  }
  setUniformV3f(name: string, value: Float32Array, gl: WebGLRenderingContext) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }

    gl.uniform3fv(this.uniforms[name], value);
    this.uniforms[name].value = value;
  }
  setUniformV4f(name: string, value: Float32Array, gl: WebGLRenderingContext) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }

    gl.uniform4fv(this.uniforms[name], value);
    this.uniforms[name].value = value;
  }
  setUniformI1i(
    name: string,
    value: Texture | CubeTexture | FrameTexture,
    gl: WebGLRenderingContext,
    index: number
  ) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }
    value.bind(gl, index);
    gl.uniform1i(this.uniforms[name], index);
    this.uniforms[name].value = value;
  }
  setUniform_1f(name: string, value: number, gl: WebGLRenderingContext) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }

    gl.uniform1f(this.uniforms[name], value);
    this.uniforms[name].value = value;
  }
  setUniform_1b(name: string, value: boolean, gl: WebGLRenderingContext) {
    if (!this.uniforms[name] && this.prog) {
      let uniform = gl.getUniformLocation(this.prog, name);
      if (!uniform) {
        return;
      }
      this.uniforms[name] = uniform;
    }

    gl.uniform1i(this.uniforms[name], value ? 1 : 0);
    this.uniforms[name].value = value;
  }
}
