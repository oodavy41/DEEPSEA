attribute vec3 position;

uniform mat4 mvpMatrix;
uniform mat4 modelMatrix;


varying vec3 fcoord;

void main(void){
    vec4 P = mvpMatrix * modelMatrix* vec4(position,1.0);
    gl_Position=P.xyww;
    fcoord=position;
}
