attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

uniform vec4 lightVector;

varying vec4 fcolor;
varying vec3 fnormal;
varying vec4 fpos;
varying vec4 flight;


uniform mat4 lightMVP;

varying vec4 lpos;

void main(void) {
  vec4 modelPos = modelMatrix * vec4(position, 1.0);
  flight = mvpMatrix * lightVector;
  fpos = mvpMatrix * modelPos;

  lpos = lightMVP * modelPos;


  gl_Position = fpos;
  fcolor = color;
  fnormal = normalize(normalMatrix * normal);
}
