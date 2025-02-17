import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

function map(n: number, start: number, stop: number, start2: number, stop2: number) {
    return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

interface AsciiFilterOptions {
    fontSize?: number;
    fontFamily?: string;
    charset?: string;
    invert?: boolean;
}

class AsciiFilter {
    renderer!: THREE.WebGLRenderer;
    domElement: HTMLDivElement;
    pre: HTMLPreElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    deg: number;
    invert: boolean;
    fontSize: number;
    fontFamily: string;
    charset: string;
    width: number = 0;
    height: number = 0;
    center: { x: number; y: number } = { x: 0, y: 0 };
    mouse: { x: number; y: number } = { x: 0, y: 0 };
    cols: number = 0;
    rows: number = 0;

    constructor(renderer: THREE.WebGLRenderer, { fontSize, fontFamily, charset, invert }: AsciiFilterOptions = {}) {
        this.renderer = renderer;
        this.domElement = document.createElement('div');
        this.domElement.style.position = 'absolute';
        this.domElement.style.top = '0';
        this.domElement.style.left = '0';
        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';

        this.pre = document.createElement('pre');
        this.domElement.appendChild(this.pre);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.domElement.appendChild(this.canvas);

        this.deg = 0;
        this.invert = invert ?? true;
        this.fontSize = fontSize ?? 12;
        this.fontFamily = fontFamily ?? "'Courier New', monospace";
        this.charset = charset ?? " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

        if (this.context) {
            this.context.imageSmoothingEnabled = false;
            this.context.imageSmoothingEnabled = false;
        }

        this.onMouseMove = this.onMouseMove.bind(this);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);
        this.reset();

        this.center = { x: width / 2, y: height / 2 };
        this.mouse = { x: this.center.x, y: this.center.y };
    }

    reset() {
        if (this.context) {
            this.context.font = `${this.fontSize}px ${this.fontFamily}`;
            const charWidth = this.context.measureText('A').width;

            this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
            this.rows = Math.floor(this.height / this.fontSize);

            this.canvas.width = this.cols;
            this.canvas.height = this.rows;
            this.pre.style.fontFamily = this.fontFamily;
            this.pre.style.fontSize = `${this.fontSize}px`;
            this.pre.style.margin = '0';
            this.pre.style.padding = '0';
            this.pre.style.lineHeight = '1em';
            this.pre.style.position = 'absolute';
            this.pre.style.left = '50%';
            this.pre.style.top = '50%';
            this.pre.style.transform = 'translate(-50%, -50%)';
            this.pre.style.zIndex = '9';
            this.pre.style.backgroundAttachment = 'fixed';
            this.pre.style.mixBlendMode = 'difference';
        }
    }

    render(scene: THREE.Scene, camera: THREE.Camera) {
        this.renderer.render(scene, camera);

        const w = this.canvas.width;
        const h = this.canvas.height;
        if (this.context) {
            this.context.clearRect(0, 0, w, h);
            this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
            this.asciify(this.context, w, h);
            this.hue();
        }
    }

    onMouseMove(e: MouseEvent) {
        this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
    }

    get dx() {
        return this.mouse.x - this.center.x;
    }

    get dy() {
        return this.mouse.y - this.center.y;
    }

    hue() {
        const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
        this.deg += (deg - this.deg) * 0.075;
        this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
    }

    asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const imgData = ctx.getImageData(0, 0, w, h).data;
        let str = '';
        
        // Loop through each pixel
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;  // Correct pixel index calculation
                const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

                if (a === 0) {
                    str += ' ';  // Transparent pixel, add space
                    continue;
                }

                // Calculate grayscale value with standard luminosity method
                const gray = (0.3 * r + 0.59 * g + 0.11 * b) / 255;  // Luminosity method for more accurate grayscale
                let idx = Math.floor((1 - gray) * (this.charset.length - 1));  // Map to charset

                if (this.invert) idx = this.charset.length - idx - 1;  // Option to invert character set

                str += this.charset[idx];
            }
            str += '\n';  // New line for each row
        }
    
        this.pre.innerHTML = str;  // Set the ASCII string to the pre element
    }

    dispose() {
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}

interface CanvasTxtOptions {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

class CanvasTxt {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    txt: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    font: string;

    constructor(txt: string, { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3' }: CanvasTxtOptions = {}) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.txt = txt;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;

        this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
    }

    resize() {
        if (this.context) {
            this.context.font = this.font;
            const metrics = this.context.measureText(this.txt);

            const textWidth = Math.ceil(metrics.width) + 20;
            const textHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20;

            this.canvas.width = textWidth;
            this.canvas.height = textHeight;
        }
    }

    render() {
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = this.color;
            this.context.font = this.font;

            const metrics = this.context.measureText(this.txt);
            const yPos = 10 + metrics.actualBoundingBoxAscent;

            this.context.fillText(this.txt, 10, yPos);
        }
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }
}

export { AsciiFilter, CanvasTxt };
