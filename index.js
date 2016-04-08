'use strict';

var image = '/images/large-sticker.webp';
var container = document.body;

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
    } else {
      xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
    }

    xhr.addEventListener('error', reject);
    xhr.addEventListener('load', function () {
      var binary = xhr.responseText.split('').map(function (e) {
        return String.fromCharCode(e.charCodeAt(0) & 0xff);
      }).join('');
      resolve(binary);
    });

    xhr.open('GET', src);
    xhr.send();
  });
}

function binaryToArray(binary) {
  var result = new Array();
  for (var i = 0; i < binary.length; i++) {
    result.push(binary.charCodeAt(i));
  }

  return result;
}

console.time('all');
loadImage(image).then(function (data) {
  console.time('convert');
  var buff = binaryToArray(data);

  var decoder = new WebPDecoder();
  var config = decoder.WebPDecoderConfig;
  var output_buffer = config.j;
  var bitstream = config.input;

  if (!decoder.WebPInitDecoderConfig(config)) {
    throw new Error('Library version mismatch!');
  }

  var status = decoder.WebPGetFeatures(buff, buff.length, bitstream);
  if (status !== 0) {
    throw new Error('Unable to decode webp image!', status);
  }

  output_buffer.J = 4;
  status = decoder.WebPDecode(buff, buff.length, config);

  if (status != 0) {
    throw new Error('WebP decoding failed.', status);
  }

  var bitmap = output_buffer.c.RGBA.ma;
  var biHeight = output_buffer.height;
  var biWidth = output_buffer.width;

  console.timeEnd('convert');

  console.time('draw');
  var canvas = document.createElement('canvas');

  canvas.height = biHeight;
  canvas.width = biWidth;

  var context = canvas.getContext('2d');
  var output = context.createImageData(canvas.width, canvas.height);
  var outputData = output.data;

  for (var h = 0; h < biHeight; h++) {
    for (var w = 0; w < biWidth; w++) {
      outputData[0 + w * 4 + biWidth * 4 * h] = bitmap[1 + w * 4 + biWidth * 4 * h];
      outputData[1 + w * 4 + biWidth * 4 * h] = bitmap[2 + w * 4 + biWidth * 4 * h];
      outputData[2 + w * 4 + biWidth * 4 * h] = bitmap[3 + w * 4 + biWidth * 4 * h];
      outputData[3 + w * 4 + biWidth * 4 * h] = bitmap[0 + w * 4 + biWidth * 4 * h];
    };
  }

  context.putImageData(output, 0, 0);

  console.timeEnd('draw');

  console.time('base64');
  var base64 = canvas.toDataURL();
  console.timeEnd('base64');
  return base64;
}).then(function (result) {
  var img = document.createElement('img');
  img.src = result;
  document.body.appendChild(img);
  console.timeEnd('all');
});
