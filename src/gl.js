
let count = 0;
const duration = 10;
const vibWidth = 10;

const video = document.getElementById('video');
const width = video.width;
const height = video.height;

let canvas;

const button = document.getElementById('button');

button.addEventListener('click', function() {
    ++count;

    if (count % 2 == 1) {
        button.innerHTML = 'stop'; 

        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = 'block';
        document.body.appendChild(canvas);

        video.play();
        render();
    } else {
        document.body.removeChild(canvas);
        button.innerHTML = 'draw'; 
        canvas.style.display = 'block';
    }

    function render() {
        let gl = canvas.getContext('webgl');

        let vs = createShader('vs');
        let fs = createShader('fs');
        let prg = createProgram(vs, fs);

        let attLocation = new Array();
        attLocation[0] = gl.getAttribLocation(prg, 'position');
        attLocation[1] = gl.getAttribLocation(prg, 'color');
        attLocation[2] = gl.getAttribLocation(prg, 'texCoord');

        let attStride = new Array();
        attStride[0] = 3;
        attStride[1] = 4;
        attStride[2] = 2;

        let position = [
            -1.0,  1.0,  0.0,
            1.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0
        ];
        
        let color = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];
        
        let texCoord = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];
        
        let index = [
            0, 1, 2,
            3, 2, 1
        ];
        
        let vPosition = createVBO(position);
        let vColor = createVBO(color);
        let vTextureCoord = createVBO(texCoord);
        let VBOList = [vPosition, vColor, vTextureCoord];
        let iIndex = createIBO(index);
        
        setAttribute(VBOList, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);

        let uniLocation = new Array();
        uniLocation[0] = gl.getUniformLocation(prg, 'texture');

        let videoTexture = gl.createTexture(gl.TEXTURE_2D);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        let dataSize = vibWidth * height * 4;
        let data = new Uint8Array(dataSize);

        function control(data) {
            let ave = 0;
            let dst = data;
            for (let i = 0; i < dataSize; i = i + 4) {
                dst[i] = data[i] / 255; 
                dst[i + 1] = data[i + 1] / 255; 
                dst[i + 2] = data[i + 2] / 255; 
                ave += dst[i] + dst[i + 1] + dst[i + 2];
            }
            ave /= data.length * 0.75;
            ave = Math.round(ave);
            return ave;
        }

        let time = 0;

        loop();

        function loop() {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, video);

            ++time;

            gl.useProgram(prg);
            gl.uniform1i(uniLocation[0], 0);
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

            gl.flush();

            gl.readPixels(0, 0, vibWidth, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

            let average = control(data);
            if (average == 1) {
                let isVibrated = window.navigator.vibrate(10);
                console.log('vibrated');
            }

            setTimeout(loop, 1000 / 60);
        }

        function createShader(id) {
            let shader;
            
            let scriptElement = document.getElementById(id);
            
            if(!scriptElement){return;}
            
            switch(scriptElement.type){
                
                case 'x-shader/x-vertex':
                    shader = gl.createShader(gl.VERTEX_SHADER);
                    break;
                    
                case 'x-shader/x-fragment':
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                    break;
                default :
                    return;
            }
            
            gl.shaderSource(shader, scriptElement.text);
            
            gl.compileShader(shader);
            
            if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                
                return shader;
            }else{
                
                alert(gl.getShaderInfoLog(shader));
            }
        }

        function createProgram(vs, fs) {
            let program = gl.createProgram();
            
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            
            gl.linkProgram(program);
            
            if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            
                gl.useProgram(program);
                
                return program;
            }else{
                
                alert(gl.getProgramInfoLog(program));
            }
        }

        function createVBO(data) {
            let vbo = gl.createBuffer();
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            return vbo;
        }

        function setAttribute(vbo, attL, attS) {
            for(let i in vbo){
                gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
                
                gl.enableVertexAttribArray(attL[i]);
                
                gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
            }
        }

        function createIBO(data) {
            let ibo = gl.createBuffer();
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
            
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            
            return ibo;
        }
    }
}, true);
