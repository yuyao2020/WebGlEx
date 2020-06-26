//预览：https://yuyao2020.github.io/WebGlEx/HelloCanvas/HelloCanvas.html
function main(){
  //获取canvas元素
  var canvas = document.getElementById('webgl');
  //获取WebGl绘图上下文
  var gl = getWebGLContext(canvas);
  if(!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 //指定清空canvas的颜色
 gl.clearColor(0.5, 0.5, 0.5, 1.0);

 //清空canvas
gl.clear(gl.COLOR_BUFFER_BIT);
}
