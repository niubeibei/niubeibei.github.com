var drawingManager;// 画图工具
var timer; //定时器
//var isTimer=0;//用于判断是否是定时刷新
var timertime=20000;//定时器的间隔时间，单位 毫秒

var mapUserGps = new HashMap(); // 记录人员gps的map
var realTimeGpsWebPage=new WebPageFether();//抓取实时GPS的

function queryGps(sipnums) {// GPS位置信息抓取
	var gpsurl = "http://"+globalIpPort+"/api/userapi/gps?action=apiBaidu&sipnum=";
	gpsurl=gpsurl+sipnums; // url 后拼接上要查询的sip的号码
	realTimeGpsWebPage.callOtherDomain(gpsurl,0,retlGpsparsePageResult);
}

function retlGpsparsePageResult(result,refData,response) {
	if(result == 1) {
		convertDataGps($.parseJSON(response));// 将从网页捕捉到的数据进行转换 转换为json数据
		isGps(deptTreeAllUser);
	}else{
		alert(response);
	}
}

function convertDataGps(list) {// 转换从页面捕捉回来的人员Gps数据
	$.each(list, function(i, obj) {// 循环抓取回来的数据，将数据放到mapUserGps 中
		mapUserGps.Set(obj.user.toString(), obj);
	});
}

function isGps(map) {//根据选中的数据和查询的gps信息 进行打点或者给用户提示无gps信息
	var noGps;// 记录没有gps位置信息
	map.each(function(key, checkdata){
		var data = deptTreeAllUser.Get(key);

		if(mapUserGps.Contains(data.sipAccount)){// 如果抓取的结果中有该号码的gps位置信息
			var obj=mapUserGps.Get(data.sipAccount)// 得到该号码的位置信息
			data.lon = obj.lon; data.lat = obj.lat;
			if(data.isReal == 0){//定时刷新gps坐标
				addToMap(obj, data, 1 == 0);// 将位置信息显示到地图上 不居中
			}else if(data.isReal == 1){//查询实时轨迹
				addToMapWhenRealTime(data);
			}
		}
		else{// 如果没有位置信息 那么将没有位置信息的sip号码记录 提示用户没有位置信息
//			if(typeof(noGps) != "undefined"){
//				noGps=noGps+','+data.deptName;
//			}else{
//				noGps=data.deptName;
//			}
			if(data.isReal == 0){//定时刷新gps坐标
				var temp = getPersonPositionMarker(data);// 是否存在存储的人员位置对象
				if(temp != -1){// 存在
					baiduMap.removeOverlay(temp.marker);//删除点
					deletePersonPositionMarker(data);//删除人员标记
					setTreeCheck(data.deptId,'uncheck_node');//修改树取消选中
					if(checkUser.Contains(data.sipAccount)){// 如果人员在地图上的图标被选中了
						checkUser.Remove(data.sipAccount);// 因为该人员已经不查询gps 图标已经不再显示 所以将人员从选中的map 中删除。
					}
				}
			}
		}
	});
//	if(isTimer==0){
//	if(typeof(noGps) != "undefined"){
//	alert("没有 [" + noGps + "] 的定位信息。");
//	}
//	}
}

function doWhenCheck (dTCheckUser){// 根据得到的节点数据 拼接得到要查询Gps数据的sip
	var sipnum;
	dTCheckUser.each(function(key, obj){
		var data = obj;
		if(typeof(sipnum) != "undefined"){
			sipnum=sipnum+','+data.sipAccount;
		}else{
			sipnum=data.sipAccount;
		}
	});
	queryGps(sipnum);// 将要查询的sip号码作为参数传给后台 抓取数据
}

function addToMap(gps, data, center){// 将得到的对象和坐标数据显示的地图上。
	var point = new BMap.Point(data.lon,data.lat);
	var _temp = getPersonPositionMarker(data);// 是否存在存储的人员位置对象

	if(_temp != -1){// 存在
		//waitForAddtoMap(data);
		if(point.lng==0 || point.lat==0){
			return;
		}
		if(!deptTreeAllUser.Contains(data.sipAccount)){
		return;
		}
		var marker=_temp.marker;
		if(checkUser.Contains(data.sipAccount)){// 如果人员已经选中
			marker.setIcon(new BMap.Icon("./image/checked.png", new BMap.Size(27,33)));
		}
		else{// 如果没有选中
			marker.setIcon(new BMap.Icon("./image/unchecked.png", new BMap.Size(27,33)));
		}
		marker.setPosition(point);
		var label= creatLabel(data);
		marker.setLabel(label);
		baiduMap.addOverlay(marker);

		_temp.marker=marker;
		_temp.point=point;
		_temp.data=data;
		_temp.isShow = 1;
		if (center) {
			setCenter(point);
		}
	}
	else{// 生成新的人员位置对象
		//waitForAddtoMap(data);
		if(!deptTreeAllUser.Contains(data.sipAccount)){
		return;
		}
		if(point.lng==0 || point.lat==0){
			return;
		}
		if(checkUser.Contains(data.sipAccount)){// 如果人员已经选中 定时刷新后仍然选中
			var marker1 = new BMap.Marker(point,
					{icon:new BMap.Icon("./image/checked.png", new BMap.Size(27,33))});  // 创建标注
		}else{
			var marker1 = new BMap.Marker(point,
					{icon:new BMap.Icon("./image/unchecked.png", new BMap.Size(27,33))});  // 创建标注
		}
		marker1.setTop(true);

		var label= creatLabel(data);
		marker1.setLabel(label);
		baiduMap.addOverlay(marker1);
		savePersonPositionMarker(
				{   id : data.sipAccount,
					data : data,
					marker : marker1,
					point : point,
					isShow : 1
				});
		if (center) {
			setCenter(point);
		}
		addVAMMenu(data,marker1,point);
	}
}

function creatLabel(data){
	var label = new BMap.Label(data.deptName,{offset:new BMap.Size(-10,-20)});
	label.setStyle({
		textAlign:"center",
		width:"auto"
	});
	return label;
}

function get5bitNum(n){
	return Math.round(n*100000)/100000;
}

//设置中心点
function setCenter (point){
	baiduMap.setCenter(new BMap.Point(point.lng,point.lat));
}

//获取人员位置标记{id,marker,label}
function getPersonPositionMarker(data){
	if(typeof personPositionMarkers == "undefined"){// 如果没有标记
		return -1;
	}
	for(var _i=0; _i < personPositionMarkers.length; _i++){// 如果有标记 那么循环查看是否有该号码的标记
		if(personPositionMarkers[_i].id == data.sipAccount){
			return personPositionMarkers[_i];
		}
	}
	return -1;
}

//删除人员位置标记
function deletePersonPositionMarker(data){
	if(typeof personPositionMarkers == "undefined"){
		return false;
	}
	for(var _i=0; _i < personPositionMarkers.length; _i++){
		if(personPositionMarkers[_i].id == data.sipAccount){
			personPositionMarkers.splice(_i,1);
		}
	}
}

//保存人员位置标记
function savePersonPositionMarker(obj){
	if(typeof personPositionMarkers == "undefined"){
		personPositionMarkers = [];
	}
	personPositionMarkers.push(obj);
}

function addVAMMenu(data,marker1,point){
	var sip = data.sipAccount;
	marker1.addEventListener("click",function(e){
		var va = $("input[name='checkUser']:checked").val();// 获得选择的方式
		if(va==0){// 如果是单选

			if(checkUser.Contains(sip)){// 如果人员已经选中
				checkUser.Remove(sip);// 再次点击时将该人员设定为未选中 从map中删除
				this.setIcon(new BMap.Icon("./image/unchecked.png", new BMap.Size(27,33)));

				setTreeCheck(data.deptId,'uncheck_node');//修改树取消选中
			}
			else{// 如果没有选中
				checkUser.Set(sip, data);// 将人员设定选中 加入map
				this.setIcon(new BMap.Icon("./image/checked.png", new BMap.Size(27,33)));

				setTreeCheck(data.deptId,'check_node');//修改树选中
			}
		}
	});
}

function radiocheck() {// 如果选定点选
	closeDrawingManager(); // 关闭图形工具
}

function enclosecheck(){// 如果选定圈选
	if(typeof drawingManager == "undefined"){
		drawingManager = new BMapLib.DrawingManager(baiduMap, {
			isOpen: true, // 是否开启绘制模式
			// enableDrawingTool: true, //是否显示工具栏
			drawingToolOptions: {
				anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
				offset: new BMap.Size(5, 50), // 偏离值
				scale: 0.8, // 工具栏缩放比例
				drawingModes : [
				                BMAP_DRAWING_RECTANGLE
				                ]
			}
		});
	}
	drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
	drawingManager.addEventListener('rectanglecomplete', function(polygon) {
		var bounds=polygon.getBounds();
		if(typeof personPositionMarkers != "undefined"){// 如果没有标记
			for(var i=0; i < personPositionMarkers.length; i++){// 如果有标记 那么循环查看是否有该号码的标记
				var obj=personPositionMarkers[i];
				if(isPonint(obj.point,bounds)){
					var tempData=obj.data;
					var sip = tempData.sipAccount;
					var marker=obj.marker;

					if(!(checkUser.Contains(sip))){// 如果人员没有选中
						checkUser.Set(sip, tempData);// 将人员设定选中 加入map
						marker.setIcon(new BMap.Icon("./image/checked.png", new BMap.Size(27,33)));

						setTreeCheck(tempData.deptId,'check_node');//修改树选中
					}
				}
			}
		}
		baiduMap.removeOverlay(polygon);
	});
	drawingManager.open();
}

function allcheck(){// 如果选定全选
	closeDrawingManager(); // 关闭图形工具
	if(typeof personPositionMarkers != "undefined"){// 如果没有标记
		for(var i=0; i < personPositionMarkers.length; i++){// 如果有标记 那么循环查看是否有该号码的标记
			var obj=personPositionMarkers[i];
			var tempData=obj.data;
			var sip = tempData.sipAccount;
			var marker=obj.marker;

			if(!(checkUser.Contains(sip))){// 如果人员没有选中
				checkUser.Set(sip, tempData);// 将人员设定选中 加入map
				marker.setIcon(new BMap.Icon("./image/checked.png", new BMap.Size(27,33)));
			}
			setTreeCheck(tempData.deptId,'check_node');//修改树选中
		}
	}
}

function clearcheck(){// 全取消
	closeDrawingManager(); // 关闭图形工具
	if(typeof personPositionMarkers != "undefined"){// 如果没有标记
		for(var i=0; i < personPositionMarkers.length; i++){// 如果有标记 那么循环查看是否有该号码的标记
			var obj=personPositionMarkers[i];
			var tempData=obj.data;
			var sip = tempData.sipAccount;
			var marker=obj.marker;

			if(checkUser.Contains(sip)){// 如果人员选中
				checkUser.Remove(sip);
				marker.setIcon(new BMap.Icon("./image/unchecked.png", new BMap.Size(27,33)));
			}
			setTreeCheck(tempData.deptId,'uncheck_node');//修改树取消选中
		}
	}else{
		//取消通讯录中选中成员
		checkUser.each(function(key, data) {
			var node = $("#dept-tree" + " li[deptId='" + data.sipAccount + "']");
			$("#dept-tree").jstree("uncheck_node", node);
		});
	}
}

function setTreeCheck(deptId,options){ // 操作树选中或取消选中
	var node = $( "#dept-tree" + " li[deptId='" + deptId + "']");
	$( "#dept-tree").jstree(options,node);
}

function isPonint(point,bounds) {// 判读某个点是否在矩形内
	var resule=BMapLib.GeoUtils.isPointInRect(point, bounds);
	return resule;
}

function timetimer() {//定时器 坐标和实时轨迹使用
	if(typeof(timer) == "undefined"){
		//clearInterval(timer);//清除定时器
		timer = setInterval("timedTask()", timertime);
	}
}

function timedTask() {//定时任务
//	isTimer=1;//这个是定时任务 在刷新时如果没有gps 信息不在弹出alert

	mapUserGps.Clear();
	doWhenCheck(deptTreeAllUser);
}

//右键，居中显示位置
function centerShowAction(sipAccount){
	var deptData=deptTreeAllUser.Get(sipAccount);
	var _temp = getPersonPositionMarker(deptData);

	if(_temp != -1){//如果地图上有位置信息
		var point = new BMap.Point(deptData.lon,deptData.lat);
		setCenter (point);
	}else{
		alert(deptData.deptName + "不在地图上，不能居中显示。");
	}
}


//右键，实时轨迹
function trackAction(sipAccount){
	var deptData=deptTreeAllUser.Get(sipAccount);

	if (deptData.isReal == 1) {
		deptData.isReal = 0; //结束实时轨迹，查询gps坐标
		clearRealTime(deptData);
		addToMap({
			lon : deptData.lon,
			lat : deptData.lat
		}, deptData, false);
		return;
	}

	if (isShowPersonPositionMarker(deptData) != 0) {
		alert("开始对" + deptData.deptName + "实时轨迹跟踪。");
		deptData.isReal = 1;
	} else {
		alert(deptData.deptName + "不在地图上，不能进行实时轨迹跟踪。");
		return false;
	}
	addToMapWhenRealTime(deptData);
}


//实时轨迹时添加标记到地图
function addToMapWhenRealTime(deptData){
	//由于实时轨迹的信息被传递进来需要时间，下面代码是为了避免影响停止实时轨迹的操作。
	//当已结束实时轨迹则结束
	if (deptData.isReal != 1) {
		return false;
	}
	hidePersonPositionMarker(deptData);//隐藏gps 图标

	var point = new BMap.Point(deptData.lon,deptData.lat);
	if(point.lng==0 || point.lat==0){
		return;
	}

	//只标记实时人员位置，经过的位置使用线表示
	if(typeof deptData.baidu_realTimeMarker == "undefined"){
		var _temp = getPersonPositionMarker(deptData);// 是否存在存储的人员位置对象
		var marker=_temp.marker;
		marker.setPosition(point);

		var label= creatLabel(deptData);
		label.setStyle({color :getColor()});
		marker.setLabel(label);

		baiduMap.addOverlay(marker);
		deptData.baidu_realTimeMarker = marker;

		saveOrUpdataMarker(deptData,marker,point);
	}else{
		var marker=deptData.baidu_realTimeMarker;
		marker.setPosition(point);
		var label= creatLabel(deptData);
		label.setStyle({color :getColor()});
		marker.setLabel(label);

		baiduMap.addOverlay(marker);
		saveOrUpdataMarker(deptData,marker,point);
	}


	//保存百度地图实现 实时轨迹的轨迹线
	if(typeof deptData.baidu_realTimeLine == "undefined"){
		var polyline = new BMap.Polyline([point], {strokeColor:getColor(), strokeWeight:3});
		baiduMap.addOverlay(polyline);
		deptData.baidu_realTimeLine = polyline;
	}else{
		var pathTemp = deptData.baidu_realTimeLine.getPath();
		pathTemp.push(point);
		deptData.baidu_realTimeLine.setPath(pathTemp);
	}
}

function saveOrUpdataMarker(data,newMarker,point){
	var _temp = getPersonPositionMarker(data);// 是否存在存储的人员位置对象
	if(_temp != -1){// 存在
		_temp.marker=newMarker;
		_temp.point=point;
		_temp.data=data;
		_temp.isShow = 1;
	}else{
		alert(data.deptName + "不在地图上，不能进行实时轨迹跟踪。");
		return false;
	}
}


//隐藏位置
function hidePersonPositionMarker(data){
	var m = getPersonPositionMarker(data);
	if(m != -1){
		baiduMap.removeOverlay(m.marker);
		baiduMap.removeOverlay(m.label);
		baiduMap.removeOverlay(m.marker.menuLabel);
		m.isShow = 0;
		//deletePersonPositionMarker(data);
	}
}

//清除实时轨迹相关
function clearRealTime(data){
	if(typeof data.baidu_realTimeMarker != "undefined"){
		baiduMap.removeOverlay(data.baidu_realTimeMarker);
		delete data.baidu_realTimeMarker;
		baiduMap.removeOverlay(data.realLabel);
		delete data.realLabel;
	}
	if(typeof data.baidu_realTimeLine != "undefined"){
		baiduMap.removeOverlay(data.baidu_realTimeLine);
		delete data.baidu_realTimeLine;
	}
}

//位置是否显示
function isShowPersonPositionMarker(data){
	var _temp = getPersonPositionMarker(data);
	if(_temp != -1){
		return _temp.isShow;
	}
	return 0;
}

function getColor() {
	return "#0000FF";
}