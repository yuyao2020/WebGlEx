var SOLID_VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Normal;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'uniform mat4 u_NormalMatrix;\n' +
'varying vec4 v_Color;\n' +
'void main(){\n' +
' vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n' +//漫反射光线方向
' vec4 color = vec4(0.0, 1.0, 1.0, 1.0);\n' + //表面基底色
' gl_Position = u_MvpMatrix * a_Position;\n' +
' vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
' float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
' v_Color = vec4(color.rgb * nDotL, color.a);\n' +
'}\n';

var SOLID_FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'varying vec4 v_Color;\n' +
'void main(){\n' +
' gl_FragColor = v_Color;\n' +
'}\n';

var TEXTURE_VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Normal;\n' +
'attribute vec2 a_TexCoord;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'uniform mat4 u_NormalMatrix;\n' +
'varying float v_NdotL;\n' +
'varying vec2 v_TexCoord;\n' +
'void main(){\n' +
' vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n' +
' gl_Position = u_MvpMatrix * a_Position;\n' +
' vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
' v_NdotL = max(dot(normal, lightDirection), 0.0);\n' +
' v_TexCoord = a_TexCoord;\n' +
'}\n';

var TEXTURE_FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'uniform sampler2D u_Sampler;\n' +
'varying vec2 v_TexCoord;\n' +
'varying float v_NdotL;\n' +
'void main(){\n' +
' vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
' gl_FragColor = vec4(color.rgb * v_NdotL, color.a);\n' +
'}\n';

function main(){
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed1');
    return;
  }

  var solidProgram = createProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE);//创建solid着色器程序对象
  var texProgram = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);//创建tex着色器程序对象
  if(!solidProgram || !texProgram){
    console.log('Failed2');
    return;
  }

  solidProgram.a_Position = gl.getAttribLocation(solidProgram, 'a_Position');
  solidProgram.a_Normal = gl.getAttribLocation(solidProgram, 'a_Normal');
  solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, 'u_MvpMatrix');
  solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, 'u_NormalMatrix');

  texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
  texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
  texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
  texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
  texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
  texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');

  var cube = initVertexBuffers(gl); //设置顶点信息
  if(!cube){
    console.log('Failed3');
    return;
  }

  var texture = initTextures(gl, texProgram);//设置纹理
  if(!texture){
    console.log('Failed4');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var currentAngle = 0.0;
  var tick = function(){
    currentAngle = animate(currentAngle);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSolidCube(gl, solidProgram, cube, -2.0, currentAngle, viewProjMatrix);
    drawTexCube(gl, texProgram, cube, texture, 2.0, currentAngle, viewProjMatrix);
    window.requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl){
    // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
 ]);

 var normals = new Float32Array([   // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
 ]);

 var texCoords = new Float32Array([   // Texture coordinates
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
 ]);

 var indices = new Uint8Array([        // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
 ]);

 var o = new Object();
 o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
 o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
 o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
 o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
 if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer) return null; 

 o.numIndices = indices.length;

 gl.bindBuffer(gl.ARRAY_BUFFER, null);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

 return o;
}

function initArrayBufferForLaterUse(gl, data, num, type){
  var buffer = gl.createBuffer();
  if(!buffer){
    console.log('Failed5');
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
    console.log('Failed5');
    return null;
  }
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;
  return buffer;
}

function initTextures(gl, program){
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed6');
    return null;
  }

  var image = new Image();
  if(!image){
    console.log('Failed7');
    return null;
  }

  image.onload = function(){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  image.src = '../resources/orange.jpg';
  return texture;
}

function drawSolidCube(gl, program, o, x, angle, viewProjMatrix){
  gl.useProgram(program);
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

  drawCube(gl, program, o, x, angle, viewProjMatrix);
}

function drawTexCube(gl, program, o, texture, x, angle, viewProjMatrix){
  gl.useProgram(program);
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);
  initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  drawCube(gl, program, o, x, angle, viewProjMatrix);
}

function initAttributeVariable(gl, a_attribute, buffer){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

function drawCube(gl, program, o, x, angle, viewProjMatrix){
  g_modelMatrix.setTranslate(x, 0.0, 0.0);
  g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);//画！！
}

var ANGLE_STEP = 30;

var last = Date.now();
function animate(angle){
  var now = Date.now();
  var elapsed = now  - last;
  last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}




