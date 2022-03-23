precision mediump float;

varying vec3 fnormal;
varying vec4 fpos;

uniform mat3 normalMatrix;

uniform vec3 cameraPos;
uniform samplerCube tex;



void main(void)
{
    //mvp坐标下的顶点法线
    vec3 Mnormal=normalize(normalMatrix*fnormal);
    //视线
    vec3 camDir=normalize(vec3(fpos)-cameraPos);
    //反射视线
    vec3 reflect=reflect(camDir,Mnormal);

    gl_FragColor = textureCube(tex,reflect)*0.8;
}
