'use strict';

const image = '/images/large-sticker.webp';
const container = document.body;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('error', reject);
    xhr.addEventListener('load', () => resolve(xhr.response));

    xhr.open('GET', src);
    xhr.send();
  });
}

function binaryToArray(data) {
  const binary = data.split('').map(function (e) {
    return String.fromCharCode(e.charCodeAt(0) & 0xff);
  }).join('');

  const result = new Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    result.push(binary.charCodeAt(i));
  }

  return result;
}

loadImage(image).then((data) => {
  const buff = binaryToArray(data);

  const decoder = new WebPDecoder();
  const config = decoder.WebPDecoderConfig;
  const output_buffer = config.j;
  const bitstream = config.input;

  if (!decoder.WebPInitDecoderConfig(config)) {
    throw new Error('Library version mismatch!');
  }

  let status = decoder.WebPGetFeatures(buff, buff.length, bitstream);
  if (status !== 0) {
    throw new Error('Unable to decode webp image!', status);
  }

  output_buffer.J = 4;
  status = decoder.WebPDecode(buff, buff.length, config);

  if (status != 0) {
    throw new Error('WebP decoding failed.', status);
  }

  const bitmap = output_buffer.c.RGBA.ma;
  return bitmap;
}).then((result) => {
  console.log(result);
});
