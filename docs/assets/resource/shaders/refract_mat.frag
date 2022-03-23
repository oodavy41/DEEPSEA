precision mediump float;

varying vec3 fnormal;
varying vec4 fpos;

uniform mat3 normalMatrix;

uniform vec3 cameraPos;
uniform samplerCube tex;
uniform float ratio;



void main(void)
{
    //mvp坐标下的顶点法线
    vec3 Mnormal=normalize(normalMatrix*fnormal);
    //视线
    vec3 camDir=normalize(vec3(fpos)-cameraPos);
    //折射视线
    vec3 refract=refract(camDir,Mnormal,ratio);

    gl_FragColor = textureCube(tex,refract)*0.8;
}
