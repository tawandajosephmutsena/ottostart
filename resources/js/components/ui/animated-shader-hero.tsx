"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';

// Types for component props
interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform vec3 u_color1;
uniform vec3 u_color2;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}

void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=vec3(0);
	float bg=clouds(vec2(st.x+T*.5,-st.y));
	uv*=1.-.3*(sin(T*.2)*.5+.5);
	
	for (float i=1.; i<12.; i++) {
		uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		
		// Use dynamic branding colors
		vec3 brandCol = mix(u_color1, u_color2, sin(i + T*0.2)*0.5+0.5);
		col+=.00125/d * (brandCol + 0.5);
		
		float b=noise(i+p+bg*1.731);
		col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
		col=mix(col, brandCol * bg * 0.4, d);
	}
	O=vec4(col,1);
}`;

// WebGL Renderer class
class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private scale: number;
  private shaderSource: string;
  private mouseMove = [0, 0];
  private mouseCoords = [0, 0];
  private pointerCoords = [0, 0];
  private nbrOfPointers = 0;
  private color1: number[] = [0.8, 0.4, 0.2]; // Fallback colors
  private color2: number[] = [0.2, 0.5, 0.8];

  private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2')!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.shaderSource = defaultShaderSource;
  }

  updateShader(source: string) {
    this.reset();
    this.shaderSource = source;
    this.setup();
    this.init();
  }

  updateColors(c1: number[], c2: number[]) {
    this.color1 = c1;
    this.color2 = c2;
  }

  updateMove(deltas: number[]) {
    this.mouseMove = deltas;
  }

  updateMouse(coords: number[]) {
    this.mouseCoords = coords;
  }

  updatePointerCoords(coords: number[]) {
    this.pointerCoords = coords;
  }

  updatePointerCount(nbr: number) {
    this.nbrOfPointers = nbr;
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', error);
    }
  }

  test(source: string) {
    let result = null;
    const gl = this.gl;
    const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      result = gl.getShaderInfoLog(shader);
    }
    gl.deleteShader(shader);
    return result;
  }

  reset() {
    const gl = this.gl;
    if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      if (this.vs) {
        gl.detachShader(this.program, this.vs);
        gl.deleteShader(this.vs);
      }
      if (this.fs) {
        gl.detachShader(this.program, this.fs);
        gl.deleteShader(this.fs);
      }
      gl.deleteProgram(this.program);
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER)!;
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.shaderSource);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    const program = this.program!;
    
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    (program as any).resolution = gl.getUniformLocation(program, 'resolution');
    (program as any).time = gl.getUniformLocation(program, 'time');
    (program as any).move = gl.getUniformLocation(program, 'move');
    (program as any).touch = gl.getUniformLocation(program, 'touch');
    (program as any).pointerCount = gl.getUniformLocation(program, 'pointerCount');
    (program as any).pointers = gl.getUniformLocation(program, 'pointers');
    (program as any).u_color1 = gl.getUniformLocation(program, 'u_color1');
    (program as any).u_color2 = gl.getUniformLocation(program, 'u_color2');
  }

  render(now = 0) {
    const gl = this.gl;
    const program = this.program;
    
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
    const p = program as any;
    gl.uniform2f(p.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(p.time, now * 1e-3);
    gl.uniform2f(p.move, this.mouseMove[0], this.mouseMove[1]);
    gl.uniform2f(p.touch, this.mouseCoords[0], this.mouseCoords[1]);
    gl.uniform1i(p.pointerCount, this.nbrOfPointers);
    gl.uniform2fv(p.pointers, this.pointerCoords);
    gl.uniform3fv(p.u_color1, new Float32Array(this.color1));
    gl.uniform3fv(p.u_color2, new Float32Array(this.color2));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

// Pointer Handler class... (unchanged)
class PointerHandler {
  private scale: number;
  private active = false;
  private pointers = new Map<number, number[]>();
  private lastCoords = [0, 0];
  private moves = [0, 0];
  private element: HTMLCanvasElement;

  constructor(element: HTMLCanvasElement, scale: number) {
    this.element = element;
    this.scale = scale;
    
    const map = (el: HTMLCanvasElement, s: number, x: number, y: number) => 
      [x * s, el.height - y * s];

    element.addEventListener('pointerdown', (e) => {
      this.active = true;
      this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
    });

    element.addEventListener('pointerup', (e) => {
      if (this.count === 1) {
        this.lastCoords = this.first;
      }
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });

    element.addEventListener('pointerleave', (e) => {
      if (this.count === 1) {
        this.lastCoords = this.first;
      }
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });

    element.addEventListener('pointermove', (e) => {
      if (!this.active) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.lastCoords = [x * this.scale, element.height - y * this.scale];
      this.pointers.set(e.pointerId, [x * this.scale, element.height - y * this.scale]);
      this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
    });
  }

  getScale() {
    return this.scale;
  }

  updateScale(scale: number) {
    this.scale = scale;
  }

  get count() {
    return this.pointers.size;
  }

  get move() {
    return this.moves;
  }

  get coords() {
    return this.pointers.size > 0 
      ? Array.from(this.pointers.values()).flat() 
      : [0, 0];
  }

  get first(): number[] {
    return this.pointers.values().next().value || this.lastCoords;
  }
}

// Reusable Shader Background Hook
const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const pointersRef = useRef<PointerHandler | null>(null);
  const { appearance } = useAppearance();

  // Helper to convert hex/rgb to normalized 0-1 range for WebGL
  const normalizeColor = (colorStr: string): number[] => {
    // Hidden element to let browser parse the color
    const div = document.createElement('div');
    div.style.color = colorStr;
    document.body.appendChild(div);
    const resolved = getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const match = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return [
        parseInt(match[1]) / 255,
        parseInt(match[2]) / 255,
        parseInt(match[3]) / 255
      ];
    }
    return [0.8, 0.4, 0.2]; // Default
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    
    rendererRef.current.setup();
    rendererRef.current.init();
    
    const updateBrandingColors = () => {
      if (!rendererRef.current) return;
      const rootStyle = getComputedStyle(document.documentElement);
      const accent = rootStyle.getPropertyValue('--agency-accent').trim() || '#C25E2E';
      const accentSoft = rootStyle.getPropertyValue('--agency-accent-soft').trim() || '#FF8C00';
      
      rendererRef.current.updateColors(
        normalizeColor(accent),
        normalizeColor(accentSoft)
      );
    };

    const resize = () => {
      if (!canvasRef.current) return;
      const c = canvasRef.current;
      const devicePixelRatio = Math.max(1, 0.5 * window.devicePixelRatio);
      c.width = window.innerWidth * devicePixelRatio;
      c.height = window.innerHeight * devicePixelRatio;
      if (rendererRef.current) {
        rendererRef.current.updateScale(devicePixelRatio);
      }
    };
    
    resize();
    updateBrandingColors();
    
    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }
    
    const loop = (now: number) => {
      if (!rendererRef.current || !pointersRef.current) return;
      rendererRef.current.updateMouse(pointersRef.current.first);
      rendererRef.current.updatePointerCount(pointersRef.current.count);
      rendererRef.current.updatePointerCoords(pointersRef.current.coords);
      rendererRef.current.updateMove(pointersRef.current.move);
      rendererRef.current.render(now);
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    
    loop(0);
    
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) rendererRef.current.reset();
    };
  }, [appearance]);

  return canvasRef;
};

const AnimatedShaderHero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = ""
}) => {
  const canvasRef = useShaderBackground();

  return (
    <div className={cn("relative w-full h-screen overflow-hidden bg-black font-sans", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain touch-none bg-black"
      />
      
      {/* Hero Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-6">
        {/* Trust Badge */}
        {trustBadge && (
          <div className="mb-8 animate-shader-fade-in-down">
            <div className="flex items-center gap-2 px-6 py-3 bg-agency-accent/10 backdrop-blur-md border border-agency-accent/30 rounded-full text-sm">
              {trustBadge.icons && (
                <div className="flex gap-1">
                  {trustBadge.icons.map((icon, index) => (
                    <span key={index} className="text-agency-accent drop-shadow-sm">
                      {icon}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-white/80 font-medium tracking-wide">{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-6 max-w-5xl mx-auto px-4">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-none animate-shader-fade-in-up shader-delay-200">
              <span className="block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {headline.line1}
              </span>
              <span className="block italic text-agency-accent drop-shadow-[0_0_50px_var(--agency-accent)]">
                {headline.line2}
              </span>
            </h1>
          </div>
          
          <div className="max-w-2xl mx-auto animate-shader-fade-in-up shader-delay-600">
            <p className="text-lg md:text-xl lg:text-2xl text-white/60 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
          
          {buttons && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 animate-shader-fade-in-up shader-delay-800">
              {buttons.primary && (
                <button 
                  onClick={buttons.primary.onClick}
                  className="group relative px-10 py-5 bg-agency-accent text-white rounded-full font-black text-xs uppercase tracking-widest transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_var(--agency-accent)] overflow-hidden"
                >
                  <span className="relative z-10">{buttons.primary.text}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              )}
              {buttons.secondary && (
                <button 
                  onClick={buttons.secondary.onClick}
                  className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-agency-accent/50 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all duration-500 hover:scale-105 backdrop-blur-sm"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedShaderHero;
