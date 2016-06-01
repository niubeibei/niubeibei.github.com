
//全图
function doWhenMaxMap(){
	closeDrawingManager();
	baiduMap.setZoom(3);
}
// 清除面积
function clearDrawingManagers(){
	if(typeof myDrawingManagerOverlays == "undefined"){
		return false;
	}
	for(var _i=0; _i<myDrawingManagerOverlays.length; _i++){
		this.baiduMap.removeOverlay(myDrawingManagerOverlays[_i]);
		this.myDrawingManagerLabels[_i].remove();
	}
	this.myDrawingManagerOverlays.splice(0,myDrawingManagerOverlays.length);
	this.myDrawingManagerLabels.splice(0,myDrawingManagerLabels.length);
}

function closeDrawingManager(){
	if(typeof myDrawingManagerObject != "undefined"){
		myDrawingManagerObject.close();
	}
	if(typeof drawingManager != "undefined"){
		drawingManager.close();
	}
}

// 清除测距
function clearDistances(){
	$("span[title='清除本次测距']").click();
}

function closeDistance(){
	if(myDis != undefined){
		// this.myDis.close();
	}
}

//清除非人员标记
function clearPositionMarkers(){
	targetMarkerMap.each(function(key, data) {
		baiduMap.removeOverlay(data);
	 });
	targetMarkerMap.Clear();
}

// 清除标记
function clearMarkers(mapLayout){
	$("#gis-map-info img.del").click();
	$("#gis-map-info").empty();
	$("#gis-map-info").html("");
	mapLayout.close("east");
	if(this.baiduMarkers != undefined){
		this.baiduMarkers.splice(0,baiduMarkers.length);
	}
}

// 清除
function doWhenClear(){
	closeDrawingManager();
	clearDrawingManagers();
	clearPositionMarkers();
	$("#gis-action-tip").text("");
	//map.disableDragging();
}

// 标记
function doWhenMarker(){
	var mapLayout=$("map");
	// var _this = this;
	// closeDistance();
	closeDrawingManager();
	var tableCss = "table table-striped table-bordered table-condensed";
	var infoPannel = $("#gis-map-info"); // 右侧窗口
	$("#gis-action-tip").text("在地图上要标记的位置点击标记。");

	var marker1 = new BMap.Marker(map.getCenter(),
			{icon:new BMap.Icon("./image/unchecked.png", new BMap.Size(25,25))});  // 创建标注
	marker1.enableDragging();
	marker1.setLabel(new BMap.Label("初始值",{offset:new BMap.Size(-2,20)}));
	map.addOverlay(marker1);
	if(typeof baiduMarkers == "undefined"){
		baiduMarkers = [];
	}
	baiduMarkers.push(marker1);

	var tempPoiTable = $("<table class='" + tableCss + "'><thead></thead><tbody></tbody></table>");
	$("thead", tempPoiTable).append("<tr><th colspan='2'>标记</th><th colspan='2'><img title='删除所有' class='delAll' src='./image/dept.gif'></th></tr>");
	$("thead", tempPoiTable).append("<tr><th>名称</th><th>保存</th><th>删除</th></tr>");
	$("img.delAll",tempPoiTable).click(function(){
		clearMarkers(mapLayout);
	});
	infoPannel.empty();
	// mapLayout.open("east");

	$.each(baiduMarkers, function(i, obj) {
		var tr = [ "<tr><td><input class='name' style='width:90px;'></td>" ];
		tr.push("<td><img class='save' src='./image/dept.gif'></td>");
		tr.push("<td><img class='del' src='./image/dept.gif'></td>");
		tr = $(tr.join(""));
		$("input.name", tr).val(obj.getLabel().content);
		$("input.name", tr).focus(function() {
			map.setCenter(obj.getPosition());// 定位标注
		});
		$("img.save", tr).click(function() {
			var name = Validation.verifyString($("input.name", tr).val(), 0, 8);
			if (name === false) {
				alert("标记名称不能超过8个字。");
				return;
			}
			obj.getLabel().setContent(name);
		});
		$("img.del", tr).click(function() {
			map.removeOverlay(obj);
			baiduMarkers.splice(i,1);
			tr.remove();
		});
		$("thead", tempPoiTable).append(tr);
	});
	$("<div style='padding:5px;'></div>").appendTo(infoPannel).append(tempPoiTable);
}

function getGoodArea(n){
	if(n/1000000 < 1){
		return n+"平方米";
	}else{
		return Math.round(n/1000000*10)/10+"平方公里";
	}
}

// 测面积
function doWhenAreafinder(){
	// var _this = this;
	// _this.closeDistance();
	if(typeof myDrawingManagerObject == "undefined"){
		myDrawingManagerObject = new BMapLib.DrawingManager(baiduMap);
		myDrawingManagerLabels = [];
		myDrawingManagerOverlays = [];

	}
	if(myDrawingManagerObject.getDrawingMode() != BMAP_DRAWING_POLYGON){
		myDrawingManagerObject.setDrawingMode(BMAP_DRAWING_POLYGON);
		myDrawingManagerObject.addEventListener("overlaycomplete", function(e) {
			var tip = "当前面积："+getGoodArea(e.calculate);
			$("#gis-action-tip").text(tip);
			this.close();
			this.disableCalculate();
			var label = e.label;
			label.setContent(tip);
			myDrawingManagerLabels.push(label);
			myDrawingManagerOverlays.push(e.overlay);
		});
	}
	var tip = "双击结束测面积。";
	$("#gis-action-tip").text(tip);
	myDrawingManagerObject.enableCalculate();
	myDrawingManagerObject.open();
}

function getGoodDistance(n){
	if(n/1000 < 1){
		return n+"米(m)";
	}else{
		return Math.round(n/1000*10)/10+"公里(km)";
	}
}

// 测距
function doWhenRangefinder(){
	// var _this = this;
	if(typeof myDrawingManagerObject == "undefined"){
		myDrawingManagerObject = new BMapLib.DrawingManager(baiduMap);
		myDrawingManagerLabels = [];
		myDrawingManagerOverlays = [];
	}
	if(myDrawingManagerObject.getDrawingMode() != BMAP_DRAWING_POLYLINE){
		myDrawingManagerObject.setDrawingMode(BMAP_DRAWING_POLYLINE);
		myDrawingManagerObject.addEventListener("overlaycomplete", function(e) {
			var tip = "当前距离："+getGoodDistance(e.calculate);
			$("#gis-action-tip").text(tip);
			this.close();
			this.disableCalculate();
			var label = e.label;
			label.setContent(tip);
			myDrawingManagerLabels.push(label);
			myDrawingManagerOverlays.push(e.overlay);
		});
	}
	var tip = "双击结束测距。";
	$("#gis-action-tip").text(tip);
	myDrawingManagerObject.enableCalculate();
	myDrawingManagerObject.open();
}

// 平移
function doWhenTranslation(){
	// this.closeDistance();
	closeDrawingManager();
	baiduMap.enableDragging();
}

// 缩小
function doWhenZoomOut(){
	// closeDistance();
	closeDrawingManager();
	baiduMap.zoomOut();
}

// 放大
function doWhenZoomIn(){
	// closeDistance();
	closeDrawingManager();
	baiduMap.zoomIn();
}

// 全屏
function fullscreen(){
	closeDrawingManager();
	if (document.getElementById('deptGroup').style.display!='none') {
		document.getElementById('deptGroup').style.display='none';
		document.getElementById('map_function').style.left='0';
		document.getElementById('map-toolbar-fullscreen').style.display='none';
		document.getElementById('map-toolbar-exitfullscreen').style.display='';
	}else if(document.getElementById('deptGroup').style.display=='none'){
		document.getElementById('deptGroup').style.display='';
		document.getElementById('map_function').style.left='277px';
		document.getElementById('map-toolbar-fullscreen').style.display='';
		document.getElementById('map-toolbar-exitfullscreen').style.display='none';
	}
}
