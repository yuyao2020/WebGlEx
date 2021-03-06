//cao
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec2 a_TexCoord;\n' +
'varying vec2 v_TexCoord;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'void main(){\n' +
' gl_Position = u_MvpMatrix * a_Position;\n' +
' v_TexCoord = a_TexCoord;\n' +
'}\n';

var FSHADER_SOURCE = 
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'uniform sampler2D u_Sampler;\n' +
'varying vec2 v_TexCoord;\n' +
'void main(){\n' +
' gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
'}\n';

var OFFSCREEN_WIDTH = 256;
var OFFSCREEN_HEIGHT = 256;

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

  var program = gl.program;
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
  program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
  if(program.a_Position < 0 || program.a_TexCoord < 0 || !program.u_MvpMatrix){
    console.log('Failed3');
    return;
  }

  var cube = initVertexBuffersForCube(gl);
  var plane = initVertexBuffersForPlane(gl);
  if(!cube || !plane){
    console.log('Failed4');
    return;
  }

  var texture = initTextures(gl); 
  if(!texture){
    console.log('Failed5');
    return;
  }

  var fbo = initFramebufferObject(gl);
  if(!fbo){
    console.log('Failed1_1');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var viewProjMatrixFBO = new Matrix4();
  viewProjMatrixFBO.setPerspective(30.0, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1.0, 100.0);
  viewProjMatrixFBO.lookAt(0.0,  2.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var currentAngle = 0.0; //开始画画
  var tick = function(){
    currentAngle = animate(currentAngle);
    draw(gl, canvas, fbo, plane, cube, currentAngle, texture, viewProjMatrix, viewProjMatrixFBO);
    window.requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffersForCube(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  // Vertex coordinates
  var vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  // Texture coordinates
  var texCoords = new Float32Array([
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ])

  var o = new Object();  // Create the "Object" object to return multiple objects.

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForPlane(gl){//初始化矩形
  // Create face
  //  v1------v0
  //  |        | 
  //  |        |
  //  |        |
  //  v2------v3

  // Vertex coordinates
  var vertices = new Float32Array([
    1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0    // v0-v1-v2-v3
  ]);

  // Texture coordinates
  var texCoords = new Float32Array([1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0]);

  // Indices of the vertices
  var indices = new Uint8Array([0, 1, 2,   0, 2, 3]);

  var o = new Object(); // Create the "Object" object to return multiple objects.
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer) return null; 
  o.numIndices = indices.length;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return o;
}

function initArrayBufferForLaterUse(gl, data, num, type){
  var buffer = gl.createBuffer();
  if(!buffer){
    console.log('Failed6');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.num = num;
  buffer.type = type;
  
  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type){
  var buffer = gl.createBuffer();
  if(!buffer){
    console.log('Failed7');
    return null;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

function initTextures(gl){
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed8');
    return null;
  }

  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if(!u_Sampler){
    console.log('Failed9');
    return null;
  }

  var image =  new Image();
  if(!image){
    console.log('Failed10');
    return null;
  }

  image.onload = function(){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // Pass the texure unit 0 to u_Sampler
    gl.uniform1i(u_Sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind the texture object
  };

  image.src = '../resources/sky_cloud.jpg';
  return texture;
}

function initFramebufferObject(gl){
  var framebuffer, texture, depthBuffer;
  var error = function(){
    if(framebuffer) gl.deleteFramebuffer(framebuffer);
    if(texture) gl.deleteTexture(texture);
    if(depthBuffer) gl.deleteRenderbuffer(depthBuffer);
    return null;
  }

  framebuffer = gl.createFramebuffer();
  if(!framebuffer){
    console.log('Failed1_2');
    return error();
  }

  texture = gl.createTexture();
  if(!texture){
    console.log('Failed1_3');
    return error();
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  framebuffer.texture = texture;

  depthBuffer = gl.createRenderbuffer();
  if(!depthBuffer){
    console.log('Failed1_4');
    return error();
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('Frame buffer object is incomplete: ' + e.toString());
    return error();
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return framebuffer;
}

function draw(gl, canvas, fbo, plane, cube, angle, texture, viewProjMatrix, viewProjMatrixFBO){
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
  gl.clearColor(0.2, 0.2, 0.4, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawTexturedCube(gl, gl.program, cube, angle, texture, viewProjMatrixFBO);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawTexturedPlane(gl, gl.program, plane, angle, fbo.texture, viewProjMatrix);
}

var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();

function drawTexturedCube(gl, program, o, angle, texture, viewProjMatrix){
  g_modelMatrix.setRotate(20.0, 1.0, 0.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  drawTexturedObject(gl, program, o, texture);
}

function drawTexturedPlane(gl, program, o, angle, texture, viewProjMatrix){
  g_modelMatrix.setTranslate(0, 0, 1);
  g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  drawTexturedObject(gl, program, o, texture);
}

function drawTexturedObject(gl, program, o, texture){
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
  initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
  gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

function initAttributeVariable(gl, a_attribute, buffer){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}


var ANGLE_STEP = 30;
var last = Date.now();
function animate(angle){
  var now = Date.now();
  var elapsed = now - last;
  last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

