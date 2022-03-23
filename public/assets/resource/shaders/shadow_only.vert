attribute vec3 position;

uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;

void main(void) {
  gl_Position = mvpMatrix * modelMatrix * vec4(position, 1.0);
}
