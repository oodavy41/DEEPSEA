precision mediump float;

void main(void) {
  float z=gl_FragCoord.z;
  gl_FragColor = vec4(z,z,z,1.0);
}
