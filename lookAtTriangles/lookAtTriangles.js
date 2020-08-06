var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'uniform mat4 u_ViewMatrix;\n' +
'varying vec4 v_Color;\n' +
' void main(){\n' +
' gl_Position = u_ViewMatrix * a_Position;\n' +
' v_Color = a_Color;\n' +
'}\n';

var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'varying vec4 v_Color;\n' +
'void main(){\n' +
' gl_FragColor = v_Color;\n' +
'}\n';

function main(){
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed1');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed2');
    return;
  }

  var n = initVertexBuffers(gl);
  if(n < 0){
    console.log('Failed3');
    return;
  }

  gl.clearColor(0, 0, 0, 1);

  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('Failed4');
    return;
  }

  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);//设置视点、视线、上方向

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl){
  var verticesColors = new Float32Array([
     0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ]);

  var n = 9;

  var vertexColorbuffer = gl.createBuffer();
  if(!vertexColorbuffer){
    console.log('Failed5');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    console.log('Failed6');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0){
    console.log('Failed7');
    return -1;
  }

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}