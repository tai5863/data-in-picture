
let button_count = 0; // ボタンが何回押されたか
const duration = [50, 125, 150, 175, 200]; // vibrationさせる時間 (5frame分)
const tone = [50, 101, 153, 204, 255]; // 諧調
const cropWidth = 50; // クロップする範囲 (元動画の解像度)
const resolution = { w: 1970, h: 1080 }; // 元動画の解像度

let loopID = 0; // requestAnimationFrameで返されるID (テスト用)

// canvasの解像度 (大きすぎると重くなる)
const canvasWidth = 50;
const canvasHeight = 1;

let canvas; // canvas用の変数

let container = [0, 0, 0, 0, 0]; // 5frame分のvibrationの情報

const video = document.getElementById('video');
const button = document.getElementById('button');
const crop = document.getElementById('crop');
const wrapper = document.getElementById('wrapper');

// リサイズ処理
const resize = () => {
    const wrapperWidth = window.innerWidth * 0.8;
    const newCropWidth = wrapperWidth * cropWidth / resolution.w;
    crop.style.width = Math.round(newCropWidth) + 1 + 'px';
    crop.style.height = Math.round(wrapperWidth * resolution.h / resolution.w + 1) + 'px';
    wrapper.style.left = Math.round((window.innerWidth - wrapperWidth) * 0.5 - newCropWidth * 0.5) + 'px';
}
window.addEventListener('resize', resize);
resize();

button.addEventListener('click', function() {
    ++button_count;

    if (button_count % 2 == 1) {
        button.innerHTML = 'stop'; 

        // canvasの作成
        canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        document.body.appendChild(canvas);

        video.play();
        render();
    } else {
        // canvasを削除
        document.body.removeChild(canvas);
        button.innerHTML = 'draw'; 
        canvas.style.display = 'block';
        window.cancelAnimationFrame(loopID);
    }

    function render() {
        const c2d = canvas.getContext('2d');

        // 色情報を取り出す関数
        function control(src) {
            let data = src.data;
            let ave = 0;
            let dst = data;
            for (let i = 0; i < data.length; i = i + 4) {
                dst[i] = data[i]; 
                dst[i + 1] = data[i + 1]; 
                dst[i + 2] = data[i + 2];
                ave += dst[i] + dst[i + 1] + dst[i + 2];
            }
            ave /= data.length * 0.75;
            return ave;
        }

        loop();

        function loop() {
            c2d.drawImage(video, 0, 0, canvasWidth, canvasHeight); // レンダリング

            let src =  c2d.getImageData(0, 0, 1, canvasHeight); // 一番左のピクセルの色情報を取りだす
            let value = control(src); // current frameのvibrationの情報を取りだす
            // vibrationの情報を更新
            container.shift();
            container.push(value); 

            if (container[0] === 0 && container[1] === 0 && container[2] === 0 && container[3] === 0 && container[4] !== 0) {
                // 一致するtoneのduration分vibrationさせる
                for (let i = 0; i < tone.length; i++) {
                    if (tone[i] === container[4]) {
                        // vibrate
                        let isVibrated = window.navigator.vibrate(duration[i]);
                        console.log('vibrated');
                        console.log('duration: ' + duration[i]);
                    }
                }
            }

            loopID = requestAnimationFrame(loop);
        } 
    }
});
