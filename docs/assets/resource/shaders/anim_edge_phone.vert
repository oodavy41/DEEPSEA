attribute vec3 position;
attribute vec2 coord;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;

varying vec4 fpos;
varying vec2 fcoord;
varying vec3 fnormal;

void main(void) {
  gl_Position = mvpMatrix * modelMatrix * vec4(position + normal * 0.015, 1.0);
  fpos = modelMatrix * vec4(position, 1.0);
  fcoord = coord;
  fnormal = normal;
}
