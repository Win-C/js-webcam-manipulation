const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');  // context 
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

/** Function gets video streaming from webcam and displays */
function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false }) // returns a promise 
    .then(localMediaStream => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream;  // convert into element that video player can understand
      video.play();
    })
    .catch(err => {
      console.error('Denied webcam access', err);
    })
}

/** Function grabs video data and paints to canvas */
function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {  // also can try request animation
    ctx.drawImage(video, 0, 0, width, height); // start at top left corner and paint
    // Take pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // Mess with pixels
    // pixels = redEffect(pixels);
    pixels = rgbSplit(pixels);
    ctx.globalAlpha = 0.1; // put a transparency of current image on top - stacking
    // Put pixels back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

/** Function plays audio for taking a picture and creates
 *  a link with the image for downloading
 */
function takePhoto() {
  // Play sound for taking a picture
  snap.currentTime = 0;
  snap.play();

  // Take data out of canvas
  const data = canvas.toDataURL('image/jpeg'); // text base representation of picture
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'webcam-snap');
  link.innerHTML = `<img src="${data}" alt="webcam-snap" />`
  strip.insertBefore(link, strip.firstChild); // like jQuery prepend
}

function redEffect(pixels) { // pixels.data is an array but does not have all the array methods
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5 // blue
  }

  return pixels;
}

function rgbSplit(pixels){
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 550] = pixels.data[i + 0] + 200; // red
    pixels.data[i + 100] = pixels.data[i + 1] - 50; // green
    pixels.data[i + 550] = pixels.data[i + 2] * 0.5 // blue
  }

  return pixels;
}

function greenScreen(pixels){
  const levels = {}; // hold minimum and maximum 'green'

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0; // 4th input is the transparency value
    }
  }

  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas); // once video is playing, emit event 'canplay'
