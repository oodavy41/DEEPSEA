// @ts-nocheck
import { vec3 } from "gl-matrix";

import { att_n, att_p, att_uv } from "./GLOBAL/GLOBAL";
import { AMaterial, MTL_TYPE } from "./object/Material";
import { ReflectMat } from "./object/materials/ReflectMat";
import { RefractMat } from "./object/materials/RefractMat";
import { TexPhoneMat } from "./object/materials/TexPhoneMat";
import { Mesh } from "./object/Mesh";
import { RObject } from "./object/Object";
import { Texture } from "./object/Texture";
import { Transform } from "./object/Transform";
import { ResManager } from "./ResManager";

export function objLoader(
  objpath: string,
  objname: string,
  mtllib: { [key: string]: AMaterial },
  gl: WebGLRenderingContext,
  mtlflag: string,
  resManager: ResManager
) {
  let obj = "" + resManager.get(objpath + objname);

  const regexp = {
    // v float float float
    vertex_pattern:
      /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    // vn float float float
    normal_pattern:
      /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    // vt float float
    uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    // f vertex vertex vertex
    face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
    // f vertex/uv vertex/uv vertex/uv
    face_vertex_uv:
      /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
    face_vertex_uv_normal:
      /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
    // f vertex//normal vertex//normal vertex//normal
    face_vertex_normal:
      /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
    // o object_name | g group_name
    object_pattern: /^[og]\s*(.+)?/,
    // s boolean
    smoothing_pattern: /^s\s+(\d+|on|off)/,
    // mtllib file_reference
    material_library_pattern: /^mtllib /,
    // usemtl material_name
    material_use_pattern: /^usemtl /,
  };

  let retObjs = new RObject();

  let state: {
    vertices: number[];
    uvs: number[];
    normals: number[];
    indexs: number[];
    size: number;
  };
  let name;
  let vertices: number[] = [];
  let normals: number[] = [];
  let uvs: number[] = [];
  let temphash = {};

  if (obj.indexOf("\r\n") !== -1) {
    // This is faster than String.split with regex that splits on both
    obj = obj.replace(/\r\n/g, "\n");
  }

  if (obj.indexOf("\\\n") !== -1) {
    // join lines separated by a line continuation character (\)
    obj = obj.replace(/\\\n/g, "");
  }

  const lines = obj.split("\n");
  let line = "",
    lineFirstChar = "",
    lineSecondChar = "";
  let lineLength = 0;
  let result = [];

  function addFace(f, v, u, n) {
    v = (parseInt(v, 10) - 1) * 3;
    u = (parseInt(u, 10) - 1) * 2;
    n = (parseInt(n, 10) - 1) * 3;
    let s;
    switch (f) {
      case 0:
        s = v + "/" + u + "/" + n;
        if (!temphash[s]) {
          state.vertices.push(vertices[v], vertices[v + 1], vertices[v + 2]);
          state.uvs.push(uvs[u], uvs[u + 1]);
          state.normals.push(normals[n], normals[n + 1], normals[n + 2]);
          state.indexs.push(state.size);
          state.size++;
        } else {
          state.indexs.push(temphash[s]);
        }
        break;
      case 1:
        s = v + "/" + u;
        if (!temphash[s]) {
          state.vertices.push(vertices[v], vertices[v + 1], vertices[v + 2]);
          state.uvs.push(uvs[u], uvs[u + 1]);
          state.indexs.push(state.size);
          state.size++;
        } else {
          state.indexs.push(temphash[s]);
        }
        break;
      case 2:
        s = v + "/" + "/" + n;
        if (!temphash[s]) {
          state.vertices.push(vertices[v], vertices[v + 1], vertices[v + 2]);
          state.normals.push(normals[n], normals[n + 1], normals[n + 2]);
          state.indexs.push(state.size);
          state.size++;
        } else {
          state.indexs.push(temphash[s]);
        }
        break;
      case 3:
        s = v;
        if (!temphash[s]) {
          state.vertices.push(vertices[v], vertices[v + 1], vertices[v + 2]);
          state.indexs.push(state.size);
          state.size++;
        } else {
          state.indexs.push(temphash[s]);
        }
        break;
    }
  }

  for (let i = 0, l = lines.length; i < l; i++) {
    line = lines[i];

    line = line.trim();

    lineLength = line.length;

    if (lineLength === 0) {
      continue;
    }

    lineFirstChar = line.charAt(0);

    // @todo invoke passed in handler if any
    if (lineFirstChar === "#") {
      continue;
    }

    if (lineFirstChar === "v") {
      lineSecondChar = line.charAt(1);

      if (
        lineSecondChar === " " &&
        (result = regexp.vertex_pattern.exec(line)) !== null
      ) {
        // 0                  1      2      3
        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        vertices.push(
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3])
        );
      } else if (
        lineSecondChar === "n" &&
        (result = regexp.normal_pattern.exec(line)) !== null
      ) {
        // 0                   1      2      3
        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        normals.push(
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3])
        );
      } else if (
        lineSecondChar === "t" &&
        (result = regexp.uv_pattern.exec(line)) !== null
      ) {
        // 0               1      2
        // ["vt 0.1 0.2", "0.1", "0.2"]

        uvs.push(parseFloat(result[1]), parseFloat(result[2]));
      } else {
        throw new Error("Unexpected vertex/normal/uv line: '" + line + "'");
      }
    } else if (lineFirstChar === "f") {
      if ((result = regexp.face_vertex_uv_normal.exec(line)) !== null) {
        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
        // 0                        1    2    3    4    5    6    7    8    9 10
        // 11         12
        // ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3",
        // undefined, undefined, undefined]

        let e;
        if (result[10] === undefined) {
          e = [1, 4, 7];
        } else {
          e = [1, 4, 7, 1, 7, 10];
        }

        e.forEach((element) => {
          addFace(0, result[element], result[element + 1], result[element + 2]);
        });
      } else if ((result = regexp.face_vertex_uv.exec(line)) !== null) {
        // f vertex/uv vertex/uv vertex/uv
        // 0                  1    2    3    4    5    6   7          8
        // ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

        let e;
        if (result[7] === undefined) {
          e = [1, 3, 5];
        } else {
          e = [1, 3, 5, 1, 5, 7];
        }

        e.forEach(function (element) {
          addFace(1, result[element], result[element + 1], undefined);
        });
      } else if ((result = regexp.face_vertex_normal.exec(line)) !== null) {
        // f vertex//normal vertex//normal vertex//normal
        // 0                     1    2    3    4    5    6   7          8
        // ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined,
        // undefined]

        let e;
        if (result[7] === undefined) {
          e = [1, 3, 5];
        } else {
          e = [1, 3, 5, 1, 5, 7];
        }

        e.forEach(function (element) {
          addFace(2, result[element], undefined, result[element + 1]);
        });
      } else if ((result = regexp.face_vertex.exec(line)) !== null) {
        // f vertex vertex vertex
        // 0            1    2    3   4
        // ["f 1 2 3", "1", "2", "3", undefined]

        let e;
        if (result[4] === undefined) {
          e = [1, 2, 3];
        } else {
          e = [1, 2, 3, 1, 3, 4];
        }

        e.forEach(function (element) {
          addFace(3, result[element], undefined, undefined);
        });
      } else {
        throw new Error("Unexpected face line: '" + line + "'");
      }
    } else if (lineFirstChar === "l") {
      /*let lineParts = line.substring(1).trim().split(" ");
       let lineVertices = [],
       lineUVs = [];

       if (line.indexOf("/") === -1) {

       lineVertices = lineParts;

       } else {

       for (let li = 0, llen = lineParts.length; li < llen; li++) {

       let parts = lineParts[li].split("/");

       if (parts[0] !== "") lineVertices.push(parts[0]);
       if (parts[1] !== "") lineUVs.push(parts[1]);

       }

       }
       state.addLineGeometry(lineVertices, lineUVs);*/
    } else if ((result = regexp.object_pattern.exec(line)) !== null) {
      // o object_name
      // or
      // g group_name

      // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
      // let name = result[ 0 ].substr( 1 ).trim();

      if (result[0].substr(1).trim() === "default") {
        continue;
      }

      if (state && name) {
        let m = state.mesh;
        m.set_mesh([
          [att_p, state.vertices, 3],
          [att_uv, state.uvs, 2],
          [att_n, state.normals, 3],
          state.indexs,
        ]);
        retObjs.addmesh(name, m);
      }

      state = {
        mesh: null,
        vertices: [],
        normals: [],
        uvs: [],
        indexs: [],
        size: 0,
      };
      temphash = {};

      name = result[0].substr(1).trim();

      retObjs.newT(name);
    } else if (regexp.material_use_pattern.test(line)) {
      // material

      // state.object.startMaterial(line.substring(7).trim(),
      // state.materialLibraries);

      const matname = line.substring(7).trim() + mtlflag;
      if (state && state.mesh) {
        let m = state.mesh;
        m.set_mesh([
          [att_p, state.vertices, 3],
          [att_uv, state.uvs, 2],
          [att_n, state.normals, 3],
          state.indexs,
        ]);
        retObjs.addmesh(name, m);
      }
      state = {
        mesh: null,
        vertices: [],
        normals: [],
        uvs: [],
        indexs: [],
        size: 0,
      };

      temphash = {};

      state.mesh = new Mesh();
      if (!mtllib[matname]) {
        console.log("no such mtl:" + matname);
      }
      state.mesh.set_mat(mtllib[matname]);
    } else if (regexp.material_library_pattern.test(line)) {
      // mtl file
      mtlLoader(
        objpath,
        line.substring(7).trim(),
        mtllib,
        gl,
        mtlflag,
        resManager
      );
    } else if ((result = regexp.smoothing_pattern.exec(line)) !== null) {
      // smooth shading
      // @todo Handle files that have varying smooth values for a set of faces
      // inside one geometry, but does not define a usemtl for each face set.
      // This should be detected and a dummy material created (later
      // MultiMaterial and geometry groups). This requires some care to not
      // create extra material on each smooth value for "normal" obj files.
      // where explicit usemtl defines geometry groups.
      // Example asset: examples/models/obj/cerberus/Cerberus.obj
      /*let value = result[1].trim().toLowerCase();
       state.object.smooth = (value === '1' || value === 'on');

       let material = state.object.currentMaterial();
       if (material) {

       material.smooth = state.object.smooth;

       }*/
    } else {
      // Handle null terminated files without exception
      if (line === "\0") {
        continue;
      }

      throw new Error("Unexpected line: '" + line + "'");
    }
  }

  // end of file do
  let mesh = state.mesh;
  mesh.set_mesh([
    [att_p, state.vertices, 3],
    [att_uv, state.uvs, 2],
    [att_n, state.normals, 3],
    state.indexs,
  ]);
  retObjs.addmesh(name, mesh);

  return retObjs;
}

function mtlLoader(
  path: string,
  mtlname: string,
  mtllib: { [key: string]: AMaterial },
  gl: WebGLRenderingContext,
  mtlflag: string,
  resManager: ResManager
) {
  let thismtl;
  let mtlhash = {
    text_phone: () => {
      return new TexPhoneMat(gl, resManager);
    },
    reflect_mat: () => {
      return new ReflectMat(gl, resManager);
    },
    refract_mat: () => {
      return new RefractMat(gl, resManager);
    },
  };

  let mtl = "" + resManager.get(path + mtlname);
  let lines = mtl.split("\n");
  let delimiter_pattern = /\s+/;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.trim();

    if (line.length === 0 || line.charAt(0) === "#") {
      // Blank line or comment ignore
      continue;
    }

    let pos = line.indexOf(" ");

    let key = pos >= 0 ? line.substring(0, pos) : line;
    key = key.toLowerCase();

    let value = pos >= 0 ? line.substring(pos + 1) : "";
    value = value.trim();

    if (key === "newmtl") {
      value += mtlflag;
      // New material
      if (mtllib[value]) {
        console.log("same mtl name", value);
      }

      thismtl = mtllib[value] = mtlhash[mtlflag]();
      console.log("mtlload", value);
    } else if (thismtl) {
      if (key === "ka" || key === "kd" || key === "ks") {
        const ss = value.split(delimiter_pattern, 3);
        switch (key) {
          case "ka":
            thismtl.ambient = vec3.fromValues(
              parseFloat(ss[0]),
              parseFloat(ss[1]),
              parseFloat(ss[2])
            );
            break;
          case "kd":
            thismtl.diffuse = vec3.fromValues(
              parseFloat(ss[0]),
              parseFloat(ss[1]),
              parseFloat(ss[2])
            );
            break;
          case "ks":
            thismtl.specular = vec3.fromValues(
              parseFloat(ss[0]),
              parseFloat(ss[1]),
              parseFloat(ss[2])
            );
            break;
        }
      } else if (key === "ns") {
        thismtl.powup = parseFloat(value);
      } else if (key === "map_kd") {
        const tex = new Texture(path + value, gl, resManager);
        thismtl.setTex(tex);
      }
    }
  }
}
