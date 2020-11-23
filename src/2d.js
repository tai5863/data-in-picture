
let count = 0;
const duration = 10;
const vibWidth = 10;

let loopID = 0;

const video = document.getElementById('video');
const width = video.width;
const height = video.height;

const canvasWidth = width;
const canvasHeight = 10;

let canvas;

const button = document.getElementById('button');


button.addEventListener('click', function() {
    ++count;

    if (count % 2 == 1) {
        button.innerHTML = 'stop'; 

        canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.display = 'block';
        document.body.appendChild(canvas);

        video.play();
        render();
    } else {
        document.body.removeChild(canvas);
        button.innerHTML = 'draw'; 
        canvas.style.display = 'block';
        window.cancelAnimationFrame(loopID);
    }

    function render() {
        const c2d = canvas.getContext('2d');

        function control(src) {
            let data = src.data;
            let ave = 0;
            let dst = data;
            for (let i = 0; i < data.length; i = i + 4) {
                dst[i] = data[i] / 255; 
                dst[i + 1] = data[i + 1] / 255; 
                dst[i + 2] = data[i + 2] / 255; 
                ave += dst[i] + dst[i + 1] + dst[i + 2];
            }
            ave /= data.length * 0.75;
            ave = Math.round(ave);
            return ave;
        }

        loop();

        function loop() {
            c2d.drawImage(video, 0, 0, canvasWidth, canvasHeight);
            let src =  c2d.getImageData(0, 0, vibWidth, canvasHeight);
            let average = control(src);
            if (average == 1) {
                let isVibrated = window.navigator.vibrate(duration);
                console.log('vibrated');
            }
            loopID = requestAnimationFrame(loop);
        } 
    }
});
