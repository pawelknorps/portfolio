




AOS.init({
  duration: 1200
});



$('.hero__scroll').on('click', function(e) {
    $('html, body').animate({
        scrollTop: $(window).height()
    }, 1200);
    audio.play();
});

var constraints = {
  audio: false,
  video: true
}; 
var recordedVideo = document.querySelector('video#recorded');
const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const audio = document.getElementById("audio")
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
trackButton.disabled = true;
let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: false,  // flip e.g for video  
    imageScaleFactor: 0.4,   
    maxNumBoxes: 3,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.63,    // confidence threshold for predictions.
}





function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Startuję wideo..."
        audio.pause();
        getMedia();
    } else {
        updateNote.innerText = "Stopuję..."
        handTrack.stopVideo(video)
        
        isVideo = false;
        updateNote.innerText = "Zastopowane..."
       	window.stop();
      
        audio.play();
        
        play();
        download();

        
        

        
       
    }
};



function runDetection() {
    model.detect(video).then(predictions => {
        //console.log("Predictions: ", predictions);
        model.setModelParameters(modelParams)
        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
            if(predictions.length > 0){
              audio.play();
              
            }
            else{
              audio.pause();

          }
        }
        
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    //toggleVideo()
    updateNote.innerText = "Model załadowany (ML)"
    trackButton.disabled = false
});

async function getMedia(pc) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);

    /* use the stream */
    function startVideo() {
      handTrack.startVideo(video).then(function (status) {
          console.log("video started", status);
          if (status) {
              updateNote.innerText = "Wideo ruszyło! Poszukuję dłoni."
              isVideo = true
              
              setInterval(runDetection(), 2800);
              
          }
  
                
  
             else {
              updateNote.innerText = "Proszę włącz obraz..."
              
          }
      });
    }
    startVideo()
    
    
   	try{
        var options = {mimeType: 'video/webm; codecs=vp9', bitsPerSecond: 900000};
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          options = {mimeType: 'video/webm; codecs=vp9'};
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          options = {mimeType: 'video/webm; codecs=vp8'};
        } else {
          // ...
        };
  	    mediaRecorder = new MediaRecorder(stream, options);    
  	    mediaRecorder.ondataavailable = handleDataAvailable;
  	    mediaRecorder.start(8);
		}catch(err) {
        console.log(err)
		   	return;
		};
    window.stop = function(){
    	mediaRecorder.stop();
    };
    
  } catch(err) {
      console.log(err)
    	return;
  }
}
var recordedChunks = [];
function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  } else {
    // ...
  }
}
function play() {
  var superBuffer = new Blob(recordedChunks);
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
}

function download() {
  var ref = firebase.storage().ref();
  var blob = new Blob(recordedChunks, {type: 'video/webm'});
  
 
  
  const name = (Date.now()) + '-' + 'blob.webm';
  const metadata = {
    contentType: blob.type
  };
  const task = ref.child(name).put(blob, metadata);
  task
  
}

