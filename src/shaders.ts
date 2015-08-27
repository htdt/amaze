export var spaceVertexShader = `
  varying vec2 vUV;
  void main(void){
    gl_Position = projectionMatrix *modelViewMatrix  * vec4(position,1.0);
    vUV = gl_Position.xy / gl_Position.w;
  }
`;

export var spaceFragmentShader = `
  // Star Nest by Pablo Román Andrioli

  // This content is under the MIT License.

  #define iterations 17
  #define formuparam 0.53

  #define volsteps 5
  #define stepsize 0.33

  #define zoom   0.800
  #define tile   0.850
  #define speed  0.004 

  #define brightness 0.0015
  #define darkmatter 0.300
  #define distfading 0.730
  #define saturation 0.850

  varying vec2 vUV;
  uniform float iGlobalTime;
  uniform vec2 iResolution;
  uniform float fogDensity;
  uniform vec3 fogColor;

  void main(void)
  {
    vec2 uv=vUV;//fragCoord.xy/iResolution.xy-.5;
    uv.y*=iResolution.y/iResolution.x;
    vec3 dir=vec3(uv*zoom,1.);
    float time=iGlobalTime*speed+.25;

    //mouse rotation
    float a1=.5+.1;
    float a2=.8+.1;
    mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
    mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
    dir.xz*=rot1;
    dir.xy*=rot2;
    vec3 from=vec3(1.,.5,0.5);
    from+=vec3(time*2.,time,-2.);
    from.xz*=rot1;
    from.xy*=rot2;
    
    //volumetric rendering
    float s=0.1,fade=1.;
    vec3 v=vec3(0.);
    for (int r=0; r<volsteps; r++) {
      vec3 p=from+s*dir*.5;
      p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
      float pa,a=pa=0.;
      for (int i=0; i<iterations; i++) { 
        p=abs(p)/dot(p,p)-formuparam; // the magic formula
        a+=abs(length(p)-pa); // absolute sum of average change
        pa=length(p);
      }
      float dm=max(0.,darkmatter-a*a*.001); //dark matter
      a*=a*a; // add contrast
      if (r>6) fade*=1.-dm; // dark matter, don't render near
      //v+=vec3(dm,dm*.5,0.);
      v+=fade;
      v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
      fade*=distfading; // distance fading
      s+=stepsize;
    }
    v=mix(vec3(length(v)),v,saturation); //color adjust
    gl_FragColor = vec4(v*.01,1.);
    
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;    
    float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
    fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
    gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
  }
`;