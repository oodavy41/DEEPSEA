precision mediump float;

varying vec3 fcoord;

uniform bool usetex;
uniform samplerCube tex;

void main(void)
{
    vec4 color=usetex?
        textureCube(tex,fcoord):
        vec4(1.0,1.0,1.0,1.0);

    gl_FragColor = color;
}
