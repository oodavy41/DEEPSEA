attribute vec3 position;
attribute vec2 coord;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;

uniform vec4 lightVector;

varying vec2 fcoord;
varying vec3 fnormal;
varying vec4 fpos;
varying vec4 flight;

void main(void) {
  fpos = modelMatrix * vec4(position, 1.0);
  flight = mvpMatrix * lightVector;
  gl_Position = mvpMatrix * fpos;
  fcoord = coord;
  fnormal = normal;
}
