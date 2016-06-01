function HistoryGps(){
	var historyGpsWebPage=new WebPageFether();//抓取历史轨迹的方法
	var hisUserData;
	var hisTimer; //定时器

	this.recordedData = function (deptData,startTime,endTime,intervalTime){
		hisUserData=deptData;
		sipnumTime=deptData.sipAccount +"&startTime="+ startTime.getTime() +"&endTime="+ endTime.getTime() +"&intervalTime="+ intervalTime;
		queryHistoryGps(sipnumTime,deptData.sipAccount);// 将要查询的sip号码作为参数传给后台 抓取数据
	}

	function queryHistoryGps(sipNumTim,sipNum) {// GPS位置信息抓取
		var gpsurl = "http://"+ serverIp +"/api/userapi/gps?action=hisApiBaidu&sipNum=";
		gpsurl=gpsurl+sipNumTim; // url 后拼接上要查询的sip的号码
		historyGpsWebPage.callOtherDomain(gpsurl,sipNum ,historyGpsparsePageResult);
	}

	function historyGpsparsePageResult(result,sipNum, response) {
		if(result == 1) {
			historyGps(sipNum,$.parseJSON(response)); // 将从网页捕捉到的数据进行转换 转换为json数据,然后根据返回的数据进行处理
		}else{
			alert(response);
		}
	}

	function historyGps(sipNum,list) {// 转换从页面捕捉回来的人员Gps数据
		if(typeof(hisUserData) != "undefined"){
			if(list.length>0){// 如果抓取的结果中有该号码的gps位置信息
				addToMapWhenHisTime(list,hisUserData,0);//划历史轨迹线
			}else{
				alert(hisUserData.deptName+"在该时段没有GPS 信息");
				var deptData=deptTreeAllUser.Get(sipNum);
				deptData.isHis = 0;
			}
		}
	}

//	添加历史轨迹位置
	function addToMapWhenHisTime(list,deptData,i){
		//由于历史轨迹的信息被传递进来需要时间，下面代码是为了避免影响停止历史轨迹的操作。
		//当已结束历史轨迹则结束
		if(deptData.isHis != 1){
			clearInterval(hisTimer);//清除定时器
			clearHisRor(deptData);//清楚历史记录
			return false;
		}
		if(typeof(hisTimer) != "undefined"){
			clearInterval(hisTimer);//清除定时器
		}

		var gps=list[i];
		var point = new BMap.Point(gps.lon,gps.lat);
		//保存百度地图实现 历史轨迹的每个点
		if(typeof deptData.baidu_hisMarkers == "undefined" || deptData.baidu_hisMarkers.length == 0){
			var marker2 = new BMap.Marker(point,
					{icon:new BMap.Icon("./image/blue.png", new BMap.Size(16,16))});  // 创建标注
			marker2.setLabel(creatHisLabel(deptData,gps));
			marker2.setTop(true);
			baiduMap.addOverlay(marker2);
			deptData.baidu_hisMarkers = [marker2];
		}else{
			var marker2 = new BMap.Marker(point,
					{icon:new BMap.Icon("./image/blue.png", new BMap.Size(16,16))});  // 创建标注
			deptData.baidu_hisMarkers.push(marker2);
			marker2.setTop(false);
			baiduMap.addOverlay(marker2);
			marker2.addEventListener("mouseover", function () {
				this.setLabel(creatHisLabel(deptData,gps));
				this.setTop(true);
			});

			marker2.addEventListener("mouseout", function () {
				baiduMap.removeOverlay(marker2.getLabel());
				this.setTop(false);
			});
		}

		//保存百度地图实现 历史轨迹的轨迹线
		if(typeof deptData.baidu_hisLine == "undefined"){
			var polyline = new BMap.Polyline([point], {strokeColor:getColor(), strokeWeight:2});
			baiduMap.addOverlay(polyline);
			deptData.baidu_hisLine = polyline;
		}else{
			var pathTemp = deptData.baidu_hisLine.getPath();
			pathTemp.push(point);
			deptData.baidu_hisLine.setPath(pathTemp);
		}
		if(i+1 < list.length){//如果还有点没有打点 继续调用进行打点划线
			if(deptData.playbackIntervalTime > 0){
				hisTimer = window.setInterval(addToMapWhenHisTime,(deptData.playbackIntervalTime)*1000,list,deptData,i+1);
			}else{
				addToMapWhenHisTime(list,deptData,i+1);
			}
		}else{
			alert(deptData.deptName+"的历史轨迹划线结束！");
		}
	}

	function creatHisLabel(deptData,gps){
		var label = new BMap.Label(deptData.deptName+"的历史轨迹"+getFormatDateByLong(gps.time),{offset:new BMap.Size(-10,20)});
		label.setStyle({color :getColor()});
		return label;
	}

	var _sto = setInterval;
	window.setInterval = function(callback,timeout,param)//参数   函数名   时间    条件
	{
		var args = Array.prototype.slice.call(arguments,2);
		var _cb = function()
		{
			callback.apply(null,args);
		}
		var sto= _sto(_cb,timeout);
		return sto;
	}
}