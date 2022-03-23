import { AMaterial } from "./Material";
import { upload_array_att, create_ibo } from "../GLCore/glfuncs";

export class Mesh {
  arrs: Array<Array<any>>;
  material: AMaterial | null = null;
  arr_bkup: any = {};
  index_buffer: WebGLBuffer | null = null;
  index_length: number;

  //
  // arr格式 [[name,[arr],length],[name1,[arr1],len]...,[index_arr]]
  constructor() {
    this.arrs = Array<Array<any>>();
    this.index_length = 0;
  }

  set_mesh(arr: Array<Array<any>>) {
    this.arrs = arr;
  }
  set_mat(mat: AMaterial) {
    this.material = mat;
  }

  init(gl: WebGLRenderingContext) {
    const program = this.material?.prog;
    if (!program) {
      console.log("no Program Binded!");
    }

    for (let i = 0, l = this.arrs.length; i < l; i++) {
      const arr = this.arrs[i];
      if (i < l - 1) {
        this.arr_bkup[arr[0]] = upload_array_att(arr[1], arr[0], program!, gl);
      } else {
        this.index_buffer = create_ibo(arr, gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        this.index_length = arr.length;
      }
    }
  }

  draw(gl: WebGLRenderingContext) {
    for (let i = 0, l = this.arrs.length - 1; i < l; i++) {
      const arr = this.arrs[i];
      if (this.arr_bkup[arr[0]]) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.arr_bkup[arr[0]].vbo);
        gl.vertexAttribPointer(
          this.arr_bkup[arr[0]].att,
          arr[2],
          gl.FLOAT,
          false,
          0,
          0
        );
      }
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    gl.drawElements(gl.TRIANGLES, this.index_length, gl.UNSIGNED_SHORT, 0);
  }
}
