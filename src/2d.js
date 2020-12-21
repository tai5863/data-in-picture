
// settings 
let button_count = 0;
const duration = 50;
const cropWidth = 50;
const resolution = { w: 1970, h: 1080 };

let loopID = 0;

const canvasWidth = 50;
const canvasHeight = 1;

let canvas;
let render_count;

let container = [0, 0, 0, 0, 0]; // vibration information

const video = document.getElementById('video');
const button = document.getElementById('button');
const crop = document.getElementById('crop');
const wrapper = document.getElementById('wrapper');

// style settings
const resize = () => {
    const wrapperWidth = window.innerWidth * 0.8;
    const newCropWidth = wrapperWidth * cropWidth / resolution.w;
    crop.style.width = Math.round(newCropWidth) + 1 + 'px';
    crop.style.height = Math.round(wrapperWidth * resolution.h / resolution.w) + 'px';
    wrapper.style.left = Math.round((window.innerWidth - wrapperWidth) * 0.5 - newCropWidth * 0.5) + 'px';
}
window.addEventListener('resize', resize);
resize();

button.addEventListener('click', function() {
    ++button_count;

    if (button_count % 2 == 1) {
        button.innerHTML = 'stop'; 

        canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
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

            let src =  c2d.getImageData(0, 0, 1, canvasHeight);
            let value = control(src);
            container.shift(); // remove the first element
            container.push(value); // add a new element

            if (container[0] == 0 && container[1] == 0 && container[2] == 0 && container[3] == 0 && container[4] == 1) {
                // vibrate
                let isVibrated = window.navigator.vibrate(duration);
                console.log('vibrated');
            }

            loopID = requestAnimationFrame(loop);
        } 
    }
});
