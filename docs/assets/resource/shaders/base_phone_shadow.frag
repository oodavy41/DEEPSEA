precision mediump float;

varying vec4 fcolor;
varying vec3 fnormal;
varying vec4 fpos;
varying vec4 flight;

uniform vec4 lightColor;

uniform float smoothness; //光滑系数

varying vec4 lpos;
uniform sampler2D shadowMap;

void main(void) {
  vec4 lcolor = vec4(fcolor.xyz, 1.0);

  //阴影处理
  float underShadow = 0.0;

  vec3 coodFromLight = (lpos.xyz / lpos.w) * 0.5 + 0.5;
  for(float i = -2.5; i < 2.6; i += 1.0) {
    for(float j = -2.5; j < 2.6; j += 1.0) {
      float x = coodFromLight.x;
      float y = coodFromLight.y;
      if(x > 0.0 && x < 1.0 && y > 0.0 && y < 1.0 &&
        coodFromLight.z >
        (texture2D(shadowMap, vec2(x + i / 512.0, y + j / 512.0)).x + 0.005))
        underShadow += 1.0;
    }
  }
  underShadow /= 16.0;
  underShadow = 1.0 - underShadow;

  //反射光线
  vec3 mvpLD = normalize(-flight.xyz);
  vec3 camDir = normalize(-fpos.xyz);
  //漫反射光照                      环境光系数 ↓
  float bright = clamp(dot(fnormal, mvpLD) * underShadow, 0.3, 1.0);

  //高光光照                                                   镜面次幂 ↓
  float hlight = (dot(mvpLD, fnormal) > 0.0 ? pow(dot(fnormal, normalize(mvpLD + camDir)), smoothness) : 0.0) *
    underShadow; //                     反射与视线中线 ↑

  vec3 specular = vec3(1.0, 1.0, 1.0);
  vec3 cubecolor = vec3(1.0);

  gl_FragColor = lcolor * vec4(lightColor.xyz * (bright +
    hlight) / 2.0, lightColor.w);
  // gl_FragColor =vec4(vec3(bright),1.0);
}
