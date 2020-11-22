
let count = 0;
let intervalID = 0;
const duration = 10;
const vibWidth = 10;

const canvas = document.getElementById('canvas');
const c2d = canvas.getContext('2d');

const video = document.getElementById('video');
const width = video.width;
const height = video.height;

const button = document.getElementById('button');

button.addEventListener('click', function() {
    ++count;

    if (count % 2 == 1) {
        intervalID = setInterval(drawImage, 1000 / 60);
        button.innerHTML = 'stop'; 
        canvas.style.display = 'block';
    } else {
        window.clearInterval(intervalID);
        button.innerHTML = 'draw'; 
        canvas.style.display = 'block';
    }
});

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

function drawImage() {
    canvas.width = width;
    canvas.height = height;
    c2d.drawImage(video, 0, 0, width, height);
    let src =  c2d.getImageData(0, 0, width, height);
    let average = control(src);
    let isVibrated = false;
    if (average == 1) {
        isVibrated = window.navigator.vibrate(duration);
        console.log('vibrated');
    }
} 