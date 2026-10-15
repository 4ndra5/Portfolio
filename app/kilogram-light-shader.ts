/*
 * Light field adapted from @kilogram · OpenShaders
 * https://openshaders.com/@kilogram
 * The supplied fragment shader is used without the demo's text or audio.
 */

const vertexSource = `#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uLightMode;
uniform vec3 uDarkBackground;
uniform vec3 uLightBackground;
out vec4 fragColor;

const float HUE = 0.752043724;
const float HUE_SPREAD = 0.0378805064;
const float HUE_TRAVEL = 1.4325037;
const float CHROMA = 0.128958896;
const float LIGHTNESS = 0.601573348;
const float COLOUR_CYCLE = 0.145176128;
const float THETA = 2.1091249;
const float SHEAR = 0.958078027;
const float SHRINK = 0.94729352;
const float LAYERS = 79.0;
const float WARP_FREQ_X = 0.539533138;
const float WARP_FREQ_Y = 2.17205215;
const float WARP_AMP_X = 0.148749575;
const float WARP_AMP_Y = 0.0305007119;
const float ASPECT_X = 2.07888436;
const float ASPECT_Y = 0.159805536;
const float OFFSET_X = 0.362921625;
const float OFFSET_Y = 0.0453170389;
const float TILT = 0.988690376;
const float ZOOM = 1.07031608;
const float CENTRE_X = 0.225728095;
const float CENTRE_Y = 0.469466686;
const float GLOW_SIZE = 0.00132607028;
const float FALLOFF = 0.252465129;
const float VIGNETTE = 0.139108315;
const float FLOW_SPEED = 0.470689297;
const float FLOW_DIRECTION = 1.0;
const float BREATH_RATE = 0.550638378;
const float BREATH_AMOUNT = 0.0928965956;
const float PHASE = 28.4976501;
const float ECHO = 0.0;
const float ECHO_SHIFT = -0.143684164;
const float SOFTNESS = 0.00147855573;
const float LIGHT_SWING = 0.281192094;

const float TAU = 6.28318530718;

vec3 oklchToLinear(float L, float C, float h) {
  float a = C * cos(h), b = C * sin(h);
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  vec3 lms = vec3(l_, m_, s_);
  lms = lms * lms * lms;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863,
              -3.3077115913, 2.6097574011, -0.7034186147,
              0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

float blueNoise(vec2 p, float frame) {
  p += 5.588238 * mod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y));
}

void main() {
  vec2 R = iResolution.xy;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;
  float t = iTime * FLOW_SPEED * FLOW_DIRECTION + PHASE;
  float breath = (-sin(iTime * BREATH_RATE * 1.5) + sin(iTime * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  vec2 u = (pos - vec2(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  float ct = cos(TILT), st = sin(TILT);
  u = mat2(ct, st, -st, ct) * u;

  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  float hue0 = HUE * TAU;
  float hue1 = hue0 + HUE_SPREAD * TAU;
  vec3 color = vec3(0.0);

  for (float i = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) break;
    u.x += -sin(u.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    u.y += -sin(u.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    u = fold * u * SHRINK;

    vec2 q = u - vec2(OFFSET_X + breath * 0.1, OFFSET_Y);
    vec2 s = vec2(q.x * ASPECT_X, q.y * ASPECT_Y);
    float glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
#ifndef SKIP_ECHO
    vec2 e = vec2((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
    glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
#endif
    glow *= 0.25 + breath * 0.4;

    float r = length(u);
    float k = sin(i * COLOUR_CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    vec3 tint = clamp(oklchToLinear(LIGHTNESS + LIGHT_SWING * k, CHROMA * (0.75 + 0.35 * k), mix(hue0, hue1, k)), 0.0, 1.0);
    color += glow * tint * exp2(-r * FALLOFF);
  }

  vec3 x = max(color, 0.0);
  color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  color = pow(clamp(color, 0.0, 1.0), vec3(0.85, 0.92, 0.98));

  float edge = smoothstep(0.5, 1.6, length(pos));
  color *= 1.0 - edge * VIGNETTE;

  vec3 dark = uDarkBackground + color * (1.0 - uDarkBackground);
  float strength = max(color.r, max(color.g, color.b));
  vec3 light = uLightBackground * (1.0 - strength) + color * 0.96;
  color = mix(dark, light, uLightMode);

  color += (blueNoise(gl_FragCoord.xy, floor(iTime * 24.0)) - 0.5) / 255.0;
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

function attach(gl: WebGL2RenderingContext, program: WebGLProgram, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL2 could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Light shader compilation failed: ${message}`);
  }
  gl.attachShader(program, shader);
  gl.deleteShader(shader);
}

export function createKilogramLight(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL2 could not create a program.");
  try {
    attach(gl, program, gl.VERTEX_SHADER, vertexSource);
    attach(gl, program, gl.FRAGMENT_SHADER, fragmentSource);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Light shader link failed: ${gl.getProgramInfoLog(program)}`);
    }
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
  const resolution = gl.getUniformLocation(program, "iResolution");
  const time = gl.getUniformLocation(program, "iTime");
  const lightMode = gl.getUniformLocation(program, "uLightMode");
  const darkBackground = gl.getUniformLocation(program, "uDarkBackground");
  const lightBackground = gl.getUniformLocation(program, "uLightBackground");

  return {
    draw(width: number, height: number, seconds: number) {
      gl.viewport(0, 0, width, height);
      gl.useProgram(program);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, seconds);
      gl.uniform1f(lightMode, 0);
      gl.uniform3f(darkBackground, .0353, .0353, .0353);
      gl.uniform3f(lightBackground, 1, 1, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() { gl.deleteProgram(program); },
  };
}
