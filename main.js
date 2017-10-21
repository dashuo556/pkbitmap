
var BITMAP_WIDTH = 16;
var BITMAP_SIZE = (BITMAP_WIDTH * BITMAP_WIDTH);
var BITMAP_MAX_INDEX = (BITMAP_SIZE - 1);
var BITMAP_BYTES = Math.floor(BITMAP_SIZE/8);
var SCALE_OFFSET_X = 64;
var SCALE_OFFSET_Y = 0;
var SCALE_VALUE = 20;

// var DEFKEY_HEX_STR = 'bc03cebffdd73b670a29fe9fdf66582031280ee38eecd448b652df63ae9448d3';
var DEFKEY_HEX_STR = '000000000fc01020231010200fc00300030003c0038003000380030000000000';

var strBin = ''
var textPrivatekey = null;
// var bs = new BitSet(BITMAP_SIZE);
var bs = BitSet.fromHexString(DEFKEY_HEX_STR);

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}


function draw(keystr) {
  var x, y;
  var randbit = 0;
  var offsetX, offsetY;

  if (keystr.length !== 256) {
    throw new Error("keystr length must be equal to 256.")
  }

  var canvas = document.getElementById("bitmapCanvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var i, j;
    var index;
    var keylen = keystr.length;
    var bitval;

    offsetX = 16;
    offsetY = 130;

    ctx.font="12px Arial";

    var fieldstr;
    var cntWords = Math.floor(keylen / BITMAP_WIDTH);

    for (i = 0; i < cntWords; i++) {
      index = i * BITMAP_WIDTH;
      fieldstr = keystr.substring(index, index + BITMAP_WIDTH);

      var ctext = fieldstr.split("").join(' ')
      ctx.fillText(ctext, 405, 78 + (i * 16));
    }
    ctx.save();
    ctx.font="96px Arial";
    ctx.translate(455,26);
    ctx.rotate(Math.PI/180*90);
    ctx.fillText("}", 0, 0);
    ctx.restore();

    ctx.font="20px Arial";
    ctx.fillText("256 bits", 450, 24);
    

    ctx.font="22px Arial";
    ctx.fillText(SCALE_VALUE + "x", SCALE_OFFSET_X + ((BITMAP_WIDTH * SCALE_VALUE) / 2) - 22,  SCALE_OFFSET_Y + (BITMAP_WIDTH * SCALE_VALUE) + 32);
    
    ctx.font="14px Arial";
    ctx.fillText("1x", offsetX - 2, offsetY+32);

    ctx.strokeStyle='rgb(128,128,128)';
    ctx.lineWidth=1;
    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";

    ctx.strokeRect(offsetX-1, offsetY-1, BITMAP_WIDTH, BITMAP_WIDTH);

    ctx.fillStyle = "rgb(0, 0, 0)";
    
    for (i = 0; i < keylen; i++) {
      x = i % BITMAP_WIDTH;
      y = Math.floor(i / BITMAP_WIDTH);
      bitval = keystr[i];
      if (bitval === '1') {
        ctx.fillRect(offsetX+x, offsetY+y, 1, 1);
      }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.strokeRect(SCALE_OFFSET_X, SCALE_OFFSET_Y, BITMAP_WIDTH * SCALE_VALUE,  BITMAP_WIDTH *  SCALE_VALUE);
    
    ctx.fillStyle = "rgb(0, 0, 0)";
    
    for (i = 0; i < keylen; i++) {
      x = i % BITMAP_WIDTH;
      y = Math.floor(i / BITMAP_WIDTH);
      bitval = keystr[i];
      if (bitval === '1') {
        ctx.fillRect(SCALE_OFFSET_X+(x*SCALE_VALUE), SCALE_OFFSET_Y+(y*SCALE_VALUE), SCALE_VALUE, SCALE_VALUE);
      }
    }
  }
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function keyUpdate() {
  strNew = bs.toString();
  if (strNew.length !== BITMAP_SIZE) {
    str = new Array((BITMAP_SIZE - strNew.length)+1).join('0');
  } else {
    str = "";
  }

  strBin = str + strNew
  strHex = bs.toString(16);
  cntBytes = BITMAP_SIZE/8;

  hexStrBytes = Math.floor(strHex.length/2);
  hexLen = (cntBytes - hexStrBytes);

  halfBytes = strHex.length % 2;

  if (halfBytes) {
    hexLen -= 1;
  }

  if (strHex.length !== cntBytes) {
    strZero = new Array(hexLen + 1).join('00');
    if (halfBytes) {
      strZero += '0';
    }
    textPrivatekey.value = strZero + strHex;
  } 
  else {
    textPrivatekey.value = strHex;
  }


}

window.onload = function() {

  strBin = bs.toString();

  textPrivatekey = document.getElementById("textPrivatekey");
  var btnSet = document.getElementById("btnSet");
  var btnClear = document.getElementById("btnClear");
  var btnRandom = document.getElementById("btnRandom");
  
  var canvas = document.getElementById("bitmapCanvas");
  var context = canvas.getContext('2d');
  
  canvas.addEventListener("mousedown", function (evt) {
    var mousePos = getMousePos(canvas, evt);

    var pt = mousePos;

    var px, py;
    var tx, ty;
    var index;
    var offset_scale_endx = (SCALE_OFFSET_X+(BITMAP_WIDTH*SCALE_VALUE));
    var offset_scale_endy = (SCALE_OFFSET_Y+(BITMAP_WIDTH*SCALE_VALUE));
    if ((pt.x >= SCALE_OFFSET_X && pt.y >= SCALE_OFFSET_Y) &&
        (pt.x < offset_scale_endx && pt.y < offset_scale_endy))
    {
      px =  (pt.x - SCALE_OFFSET_X);
      py =  (pt.y - SCALE_OFFSET_Y);

      tx = Math.floor(px / SCALE_VALUE);
      ty = Math.floor(py / SCALE_VALUE);

      index = ty * BITMAP_WIDTH + tx;

      var vb = bs.get(BITMAP_MAX_INDEX - index);
      bs.set(BITMAP_MAX_INDEX - index, !vb);
    }

    keyUpdate();

    draw(strBin);
    
  }, false);

  keyUpdate();
  draw(strBin);

  btnSet.onclick = function (evt) {
    bs.clear();
    textKey = textPrivatekey.value;

    textKey.toLowerCase();
    console.log(textKey);

    var result = /^[0-9a-f]{64}/.test(textKey);
    console.log(result);
    if (!result) {
      alert('hex string, length 32.');
    }

    bs = BitSet.fromHexString(textKey);

    keyUpdate();
    draw(strBin);
  };

  btnClear.onclick = function (evt) {
    bs = new BitSet(BITMAP_SIZE);
    bs.clear();
    
    keyUpdate();
    draw(strBin);
  };

  btnRandom.onclick = function (evt) {
    var i;
    bs = new BitSet(BITMAP_SIZE);
    bs.clear();
    
    var bitval;
    for (i = 0; i < BITMAP_SIZE; i++) {
      bitval = Math.floor(Math.random()*2);
      bs.set(i, bitval);
    }
    keyUpdate();
    draw(strBin);
  };


}