
//Live video
document.getElementById("snap").addEventListener('click', () => {

  let video = document.getElementById('video');
  const mediaStream = new MediaStream();

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      this.video.srcObject = stream;
      return this.video.play();
    });
    

  let canvas = document.getElementById('canvas');
  let context = canvas.getContext('2d');

  document.getElementById("snap").addEventListener("click", function() {
      context.drawImage(video, 0, 0, 480, 360);
  });
});



//scanner module
let scanRequest = {
    "use_asprise_dialog": true, // Whether to use Asprise Scanning Dialog
    "show_scanner_ui": false, // Whether scanner UI should be shown
    "twain_cap_setting": { 
        "ICAP_PIXELTYPE": "TWPT_RGB" 
    },
    "output_settings": [{
        "type": "return-base64",
        "format": "jpg"
    }]
};

function scan() {
    scanner.scan(displayImagesOnPage, scanRequest);
}

/** Обробка результату сканування */
function displayImagesOnPage(successful, mesg, response) {
    if (!successful) { // On error
        console.error('Failed: ' + mesg);
        return;
    }
    if (successful && mesg != null && mesg.toLowerCase().indexOf('user cancel') >= 0) { // User cancelled.
        console.info('User cancelled');
        return;
    }
    let scannedImages = scanner.getScannedImages(response, true, false); // returns an array of ScannedImage
    for (let i = 0; (scannedImages instanceof Array) && i < scannedImages.length; i++) {
        let scannedImage = scannedImages[i];
        let elementImg = scanner.createDomElementFromModel({
            'name': 'img',
            'attributes': {
                'class': 'scanned',
                'src': scannedImage.src
            }
        });
        (document.getElementById('images') ? document.getElementById('images') : document.body).appendChild(elementImg);
    }
}

function saveImage() {
var photo = canvas.toDataURL('image/jpeg');                
$.ajax({
  method: 'POST',
  url: '/upload-canvas',
  data: {
    photo: photo
  }
});
}

document.getElementById("screen").addEventListener("click", saveImage);