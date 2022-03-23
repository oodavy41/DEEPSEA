attribute vec3 position;
attribute vec3 normal;

uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;

varying vec3 fnormal;
varying vec4 fpos;

void main(void){
    fpos = mvpMatrix * modelMatrix* vec4(position,1.0);
    gl_Position =  fpos;
    fnormal=normal;
}
