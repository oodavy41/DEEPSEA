precision mediump float;

varying vec4 fpos;
varying vec2 fcoord;
varying vec3 fnormal;

uniform mat3 normalMatrix;

uniform vec4 lightDirection;
uniform vec3 lightColor;
uniform vec3 cameraPos;


uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;
uniform float powup;


uniform bool usetex;
uniform sampler2D tex;

void main(void)
{
    vec3 mvpLD=lightDirection.xyz;

    //法线
    vec3 Mnormal=normalize(normalMatrix*fnormal);

    //漫反射光照                        环境光系数 ↓
    float bright=clamp(dot(Mnormal, mvpLD),0.1,1.0);

    //blinn phone
    vec3 camDir=normalize(cameraPos-vec3(fpos));
    //高光光照
    float hlight=dot(mvpLD,Mnormal)>0.0?
        pow(max(dot(Mnormal, normalize(-mvpLD+camDir)),0.0), powup)
        :0.0;//               反射与视线中线 ↑            镜面次幂 ↑

    vec4 color=usetex?
        texture2D(tex,vec2(fcoord.s,fcoord.t)):
        vec4(diffuse,1.0);
    gl_FragColor = color*vec4(lightColor*bright,1.0)+
        vec4(specular*hlight,1.0)+
        color*vec4(ambient+vec3(0.1),1.0);
}
