//沿y轴横向旋转
var rotateYDivId,rotateXDivId,scaleYDivId,rotYTimeout,rotXTimeout,scaleYTimeout,angleY=0,angleX=0,scaleYAngle=0;
function rotateYDIV(id){
	var jqId = "#"+id;
	rotateYDivId = $(jqId);
	rotYTimeout = setTimeout("startYRotate()",5);
}
function startYRotate(){
	++angleY;
	rotateYDivId.css("transform","rotateY(" + angleY + "deg)");
	rotateYDivId.css("-webkit-transform","rotateY(" + angleY + "deg)");
	rotateYDivId.css("-moz-transform","rotateY(" + angleY + "deg)");
	if (angleY == 180 || angleY >= 360){
		if (angleY >= 360){angleY = 0}
	}
	rotYTimeout = setTimeout("startYRotate()",5);
}
//清除定时器
function clearYTimeout(){
	clearTimeout(rotYTimeout);
	rotateYDivId.css("transform","rotateY(0deg)");
	rotateYDivId.css("-webkit-transform","rotateY(0deg)");
	rotateYDivId.css("-moz-transform","rotateY(0deg)");
}
//沿X轴横向旋转
function rotateXDIV(id){
	var jqId = "#"+id;
	rotateXDivId = $(jqId);
	rotXTimeout = setTimeout("startXRotate()",5);
}
function startXRotate(){
	++angleX;
	rotateXDivId.css("transform","rotateX(" + angleX + "deg)");
	rotateXDivId.css("-webkit-transform","rotateX(" + angleX + "deg)");
	rotateXDivId.css("-moz-transform","rotateX(" + angleX + "deg)");
	if (angleX == 180 || angleX >= 360){
		if (angleX >= 360){angleX = 0}
	}
	rotXTimeout = setTimeout("startXRotate()",5);
}
//清除定时器
function clearXTimeout(){
	clearTimeout(rotXTimeout);
	rotateXDivId.css("transform","rotateX(0deg)");
	rotateXDivId.css("-webkit-transform","rotateX(0deg)");
	rotateXDivId.css("-moz-transform","rotateX(0deg)");
}

//沿y轴横向缩放旋转
function scaleYDIV(id){
	var jqId = "#"+id;
	scaleYDivId = $(jqId);
	scaleYTimeout = setTimeout("startYscale()",5);
}
function startYscale(){
	++scaleYAngle;
	scaleYDivId.css("transform","scaleY(" + scaleYAngle + ")");
	scaleYDivId.css("-webkit-transform","scaleY(" + scaleYAngle + ")");
	scaleYDivId.css("-moz-transform","scaleY(" + scaleYAngle + ")");
	if (scaleYAngle == 180 || scaleYAngle >= 360){
		if (scaleYAngle >= 360){scaleYAngle = 0}
	}
	//scaleYTimeout = setTimeout("startYscale()",10);
}
//清除定时器
function clearScaleYTimeout(){
	clearTimeout(scaleYTimeout);
	scaleYDivId.css("transform","scaleY(0)");
	scaleYDivId.css("-webkit-transform","scaleY(0)");
	scaleYDivId.css("-moz-transform","scaleY(0)");
}