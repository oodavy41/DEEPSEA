import { mat4, vec3 } from "gl-matrix";

import { Transform } from "../object/Transform";
import { ResManager } from "../ResManager";

export function initgl(glc: HTMLCanvasElement) {
  const gl: WebGLRenderingContext | null = glc.getContext("webgl");
  if (!gl) {
    alert("no support for Webgl in this browser\nWEBGL无法在此浏览器初始化");
    return;
  }
  const ext = gl.getExtension("WEBGL_depth_texture");
  if (!ext) {
    alert("no support for Webgl shadow \nWEBGL无法在此浏览器使用阴影");
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  return gl;
}

export function glclear(gl: WebGLRenderingContext) {
  // tslint:disable-next-line:no-bitwise
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export function create_shader(
  source: string,
  gl: WebGLRenderingContext,
  type: number,
  res: ResManager
) {
  let shader;
  shader = gl.createShader(type);
  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      console.error(type.toString() + ":" + gl.getShaderInfoLog(shader));
    }
  }
}

export function create_program(
  vs: WebGLShader,
  fs: WebGLShader,
  gl: WebGLRenderingContext
) {
  const program = gl.createProgram();
  if (program) {
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    } else {
      console.error("pro:" + gl.getProgramInfoLog(program));
    }
  }
}

export function create_vbo(data: number[], gl: WebGLRenderingContext) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

export function create_ibo(data: number[], gl: WebGLRenderingContext) {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
}

export function makeMvp(view3v: vec3[], pers4f: number[]) {
  const vMat = mat4.create();
  const pMat = mat4.create();
  const mvp = mat4.create();

  mat4.lookAt(vMat, view3v[0], view3v[1], view3v[2]);

  if (pers4f.length === 4) {
    mat4.perspective(pMat, pers4f[0], pers4f[1], pers4f[2], pers4f[3]);
  } else {
    mat4.ortho(
      pMat,
      pers4f[0],
      pers4f[1],
      pers4f[2],
      pers4f[3],
      pers4f[4],
      pers4f[5]
    );
  }

  mat4.multiply(mvp, pMat, vMat);
  return mvp;
}

export function upload_array_att(
  array: number[],
  att_name: string,
  program: WebGLProgram,
  gl: WebGLRenderingContext
) {
  const att = gl.getAttribLocation(program, att_name);
  if (att === -1) {
    console.log("no attribute called:" + att_name);
    return null;
  }
  const vbo = create_vbo(array, gl);
  gl.enableVertexAttribArray(att);
  return { att: att, vbo: vbo };
}
