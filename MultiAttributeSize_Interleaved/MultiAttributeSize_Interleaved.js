var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute float a_PointSize;\n' +
'void main(){\n' +
'gl_Position = a_Position;\n' +
'gl_PointSize = a_PointSize;\n' + 
'}\n';

var FSHADER_SOURCE =
'void main(){\n' +
'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';

function main(){
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed 1');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed 2');
    return;
  }
  
  var n = initVertexBuffers(gl);
  if(n < 0){
    console.log('Failed 3');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl){
  var verticesSizes = new Float32Array([
     0.0,  0.5, 10.0,
    -0.5, -0.5, 20.0,
     0.5, -0.5, 30.0 
  ]);

  var n = 3;

  var vertexSizeBuffer = gl.createBuffer();
  if(!vertexSizeBuffer){
    console.log('Failed 4');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

  var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
  
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*3, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_PointSize =  gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE*3, FSIZE*2);
  gl.enableVertexAttribArray(a_PointSize);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return n;
}