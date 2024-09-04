const canvas = document.getElementById('flowers');
let gl = canvas.getContext('webgl', {antialias: true});
if(!gl) {
    gl = canvas.getContext('experimental-webgl', {antialias: true});
    if(!gl)
        alert("Your browser does not support WebGL!");
}

const scale = 0.5;
canvas.width = canvas.clientWidth * scale;
canvas.height = canvas.clientHeight * scale;

const lineLength = 0.1;
const angle = Math.PI / 6; // 30 deg

const rules = {
    "3": "[[-F0]F[F2]+FX]+F[F1]+FX",
    "2": "[-F[F0]+F1]+FX",
    "1": "[-F[[-F[-B]+B]F[FY]+FY]+F0]+B",
    "0": "[-F[-FZ]+F[-Fz]F[B]+B]+B",
    "F": "F",
    "X": "X",
    "Y": "Y",
    "Z": "Z",
    "B": "B"
};

function generateLSystem(currentString) {
    let nextString = "";
    console.log(currentString);

    for(const char of currentString)
        nextString += rules[char] || char;

    if(nextString !== currentString)
        return generateLSystem(nextString);
    return currentString
}

function interpretLSystem(lSystem) {
    const vertices = [];
    const purpleFlowers = [];
    const yellowFlowers = [];
    const pinkFlowers = [];
    const leaves = [];
    let x = 0, y = -0.5;
    let currentAngle = Math.PI / 2; // 90 deg (north)

    const savedPositions = [];

    (function recursive(string) {
        if(string.length > 0) {
            switch(string.charAt(0)) {
                case "F":
                    const newX = x + Math.cos(currentAngle) * lineLength;
                    const newY = y + Math.sin(currentAngle) * lineLength;
                    vertices.push(x, y, newX, newY);
                    x = newX;
                    y = newY;
                    break;
                case "+": // turn right
                    currentAngle -= angle;
                    break;
                case "-": // turn left
                    currentAngle += angle;
                    break;
                case "[": // save current state
                    savedPositions.push({x, y, currentAngle});
                    break;
                case "]": // restore last state
                    ({x, y, currentAngle} = savedPositions.pop());
                    break;
                case "X": // purple flowers
                    purpleFlowers.push(x, y);
                    break;
                case "Y": // yellow flowers
                    yellowFlowers.push(x, y);
                    break;
                case "Z": // pink flowers
                    pinkFlowers.push(x, y);
                    break;
                case "B":
                    leaves.push(x, y, currentAngle);
                    break;
            }
            recursive(string.slice(1));
        }
    })(lSystem);

    return {
        vertices: new Float32Array(vertices),
        purpleFlowers: new Float32Array(purpleFlowers),
        pinkFlowers: new Float32Array(pinkFlowers),
        yellowFlowers: new Float32Array(yellowFlowers),
        leaves: new Float32Array(leaves)
    };
}

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('SHADER COMPILE FAILED:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("PROGRAM LINK FAILED:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const lineVertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`
const lineFragmentShaderSource = `
    precision highp float;
    void main() {
        gl_FragColor = vec4(0.0, 0.8, 0.3, 1.0); // green color for lines (stems)
    }
`
const lineVertexShader = createShader(gl.VERTEX_SHADER, lineVertexShaderSource);
const lineFragmentShader = createShader(gl.FRAGMENT_SHADER, lineFragmentShaderSource);
const lineProgram = createProgram(lineVertexShader, lineFragmentShader);

function renderLines(vertices) {
    gl.useProgram(lineProgram);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(lineProgram, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, vertices.length / 2);
}

const purpleFlowerVertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_PointSize = 15.0;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`
const purpleFlowerFragmentShaderSource = `
    precision highp float;
    uniform vec2 u_offsets[5];

    float petalShape(vec2 uv, vec2 offset, float radius) {
        uv -= offset;
        float dist = length(uv);
        return smoothstep(radius, radius - 0.1, dist);
    }

    void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);

        float petalRadius = 0.3;

        vec2 offsets[5];
        offsets[0] = vec2(0.3, 0.0);
        offsets[1] = vec2(-0.3, 0.0);
        offsets[2] = vec2(0.0, 0.3);
        offsets[3] = vec2(0.2, -0.2);
        offsets[4] = vec2(-0.2, -0.2);

        vec4 color = vec4(0.0);
        for(int i = 0; i < 5; i++) {
            vec2 offset = offsets[i];
            float petal = petalShape(uv, offset, petalRadius);
            color += vec4(0.7, 0.2, 0.8, 1.0) * petal;
        }

        float center = smoothstep(0.2, 0.0, length(uv));
        color += vec4(0.9, 0.6, 1.0, 1.0) * center;

        if(color.a < 0.1) {
            discard;
        }
        gl_FragColor = color;
    }
`

const purpleFlowerVertexShader = createShader(gl.VERTEX_SHADER, purpleFlowerVertexShaderSource);
const purpleFlowerFragmentShader = createShader(gl.FRAGMENT_SHADER, purpleFlowerFragmentShaderSource);
const purpleFlowerProgram = createProgram(purpleFlowerVertexShader, purpleFlowerFragmentShader);

const purpleFlowerOffsets = [
    0.3, 0.0,
    -0.3, 0.0,
    0.0, 0.3,
    0.2, -0.2
    -0.2, -0.2
]

const yellowFlowerVertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_PointSize = 15.0;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`
const yellowFlowerFragmentShaderSource = `
    precision highp float;
    uniform vec2 u_offsets[6];

    float petalShape(vec2 uv, vec2 offset, float radius) {
        uv -= offset;
        float dist = length(uv);
        return smoothstep(radius, radius - 0.1, dist);
    }

    void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);

        float petalRadius = 0.20;

        vec2 offsets[6];
        offsets[0] = vec2(0.3, 0.15);
        offsets[1] = vec2(-0.3, 0.15);
        offsets[2] = vec2(0.0, 0.3);
        offsets[3] = vec2(0.3, -0.15);
        offsets[4] = vec2(-0.3, -0.15);
        offsets[5] = vec2(0.0, -0.3);

        vec4 color = vec4(0.0);
        for(int i = 0; i < 6; i++) {
            vec2 offset = offsets[i];
            float petal = petalShape(uv, offset, petalRadius);
            color += vec4(0.8, 0.9, 0.3, 1.0) * petal;
        }

        float center = smoothstep(0.2, 0.0, length(uv));
        color += vec4(0.5, 0.4, 0.0, 1.0) * center;

        if(color.a < 0.1) {
            discard;
        }
        gl_FragColor = color;
    }
`

const yellowFlowerVertexShader = createShader(gl.VERTEX_SHADER, yellowFlowerVertexShaderSource);
const yelloweFlowerFragmentShader = createShader(gl.FRAGMENT_SHADER, yellowFlowerFragmentShaderSource);
const yellowFlowerProgram = createProgram(yellowFlowerVertexShader, yelloweFlowerFragmentShader);

const pinkFlowerVertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_PointSize = 20.0;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`
const pinkFlowerFragmentShaderSource = `
    precision highp float;

    float petalShape(vec2 uv, vec2 offset, float radius) {
        uv -= offset;
        float dist = length(uv);
        return smoothstep(radius, radius - 0.1, dist);
    }

    void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);

        float petalRadius = 0.2;

        vec2 offsets[5];
        offsets[0] = vec2(0.3, 0.1);
        offsets[1] = vec2(-0.3, 0.1);
        offsets[2] = vec2(0.0, 0.3);
        offsets[3] = vec2(0.2, -0.2);
        offsets[4] = vec2(-0.2, -0.2);

        vec4 color = vec4(0.0);
        for(int i = 0; i < 5; i++) {
            vec2 offset = offsets[i];
            float petal = petalShape(uv, offset, petalRadius);
            color += vec4(0.8, 0.5, 0.6, 1.0) * petal;
        }

        float center = smoothstep(0.2, 0.0, length(uv));
        color += vec4(0.5, 0.2, 0.2, 1.0) * center;

        if(color.a < 0.1) {
            discard;
        }
        gl_FragColor = color;
    }
`

const pinkFlowerVertexShader = createShader(gl.VERTEX_SHADER, pinkFlowerVertexShaderSource);
const pinkFlowerFragmentShader = createShader(gl.FRAGMENT_SHADER, pinkFlowerFragmentShaderSource);
const pinkFlowerProgram = createProgram(pinkFlowerVertexShader, pinkFlowerFragmentShader);

function renderFlowers(flowers, type) {
    let positionLocation;
    switch(type) {
        case "X":
            gl.useProgram(purpleFlowerProgram);
            positionLocation = gl.getAttribLocation(purpleFlowerProgram, "aPosition");
            break;
        case "Y":
            gl.useProgram(yellowFlowerProgram);
            positionLocation = gl.getAttribLocation(yellowFlowerProgram, "aPosition");
            break;
        case "Z":
            gl.useProgram(pinkFlowerProgram);
            positionLocation = gl.getAttribLocation(pinkFlowerProgram, "aPosition");
            break;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flowers, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, flowers.length / 2);
}

// const leafVertexShaderSource = `
//     attribute vec2 aPosition;
//     attribute float aRotation;
//     attribute vec2 aTranslation;
//     void main() {
//         vec2 rotatedPosition = vec2(
//             aPosition.x * sin(aRotation) + aPosition.y * cos(aRotation),
//             aPosition.y * sin(aRotation) + aPosition.x * cos(aRotation),
//         );

//         vec2 position = rotatedPosition + aTranslation;

//         gl_Position = vec4(position, 0.0, 1.0);
//     }
// `
// const leafFragmentShaderSource = `
//     precision highp float;
//     void main() {
//         gl_FragColor = vec4(0.0, 0.8, 0.3, 1.0); // green color for leaves
//     }
// `

// const leavesVertexShader = createShader(gl.VERTEX_SHADER, leafVertexShaderSource);
// const leavesFragmentShader = createShader(gl.FRAGMENT_SHADER, leafVertexShaderSource);
// const leavesProgram = createProgram(leavesVertexShader, leavesFragmentShader);

// const leavesVertices = new Float32Array([
//     0.0, 0.0,
//     0.0, 0.1,
//     0.02, 0.04,

//     0.0, 0.0,
//     0.0, 0.1,
//     -0.02, 0.04
// ]);

// function renderLeaves(leaves) {
//     gl.useProgram(leavesProgram);



//     const verticesBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, )
// }

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.5, 0.5, 0.7, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const birthday = prompt("Type in your birthday to see what kinda of flowers you get!", "Format: MMDD");

const conversion = {
    "0": "2",
    "1": "2",
    "2": "2",
    "3": "3",
    "4": "1",
    "5": "1",
    "6": "+",
    "7": "-",
    "8": "0",
    "9": "0",

}

let axiom = "";
for(const char of birthday)
    axiom += conversion[char];

const lSystem = generateLSystem(axiom);
console.log(lSystem);
const {vertices, purpleFlowers, yellowFlowers, pinkFlowers} = interpretLSystem(lSystem);

console.log(vertices, purpleFlowers, yellowFlowers, pinkFlowers);

renderLines(vertices);
renderFlowers(purpleFlowers, "X");
renderFlowers(yellowFlowers, "Y");
renderFlowers(pinkFlowers, "Z");
