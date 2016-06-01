//右键菜单 历史轨迹
function historyTrackAction(sipAccount) {
	var deptData=deptTreeAllUser.Get(sipAccount);

	if (deptData.isHis == 1) {
		clearHisRor(deptData);//清除历史轨迹
		deptData.isHis = 0;
		return false;
	}

	var html = [ "<div class='user_history_track'>" ];

	html.push("<p><span>开始时间：</span>");
	html.push("<input name='startDate' id ='startDate' class='inp_txt' readonly style='width:100px;height:18px;'>");
	html.push("<select name='startHours' style='width:50px;'>");
	for ( var i = 0; i < 24; i++) {
		html.push("<option value='" + i + "'>" + i + "</option>");
	}
	html.push("</select><span>时</span><select name='startMinutes' style='width:50px;'>");
	for ( var i = 0; i < 60; i++) {
		html.push("<option value='" + i + "'>" + i + "</option>");
	}
	html.push("</select><span>分</span><select name='startSeconds' style='width:50px;'>");
	for ( var i = 0; i < 60; i++) {
		html.push("<option value='" + i + "'>" + i + "</option>");
	}
	html.push("</select><span>秒</span></p>");
	html.push("<p><span>结束时间：</span>");
	html.push("<input name='endDate' id='endDate' class='inp_txt' readonly style='width:100px;height:18px;'>");
	html.push("<select name='endHours' style='width:50px;'>");
	for ( var i = 0; i < 24; i++) {
		html.push("<option value='" + i + "'>" + i + "</option>");
	}
	html.push("</select><span>时</span><select name='endMinutes' style='width:50px;'>");
	for ( var i = 0; i < 60; i++) {
		html.push("<option value='" + i + "'>" + i + "</option>");
	}
	html.push("</select><span>分</span><select name='endSeconds' style='width:50px;'>");
	for ( var i = 0; i < 60; i++) {
		html.push("<option value='" + i + "'>" + i + "</option>");
	}
	html.push("</select><span>秒</span></p>");

	html.push("<p><span>查询间隔时间(秒)：</span>");
	html.push("<input name='intervalTime' id='intervalTime' class='inp_txt' maxlength='4' style='width:90px;height:18px;'>");

	html.push("<p><span>回放间隔时间(秒)：</span>");
	html.push("<input name='playbackIntervalTime' class='inp_txt' maxlength='3' style='width:90px;height:18px;'>");

	html = $(html.join(""));

	html.find("input[name=startDate], input[name=endDate]").datepicker({
		//dateFormat : 'yy-mm-dd';
		onSelect: function (dateText, inst) {
			if(inst.id == "startDate"){
				html.find("select[name=startHours]").focus();
			}else if(inst.id == "endDate"){
				html.find("select[name=endHours]").focus();
			}
		}
	});

	var title = deptData.deptName + "的历史轨迹";
	openDialogPage(null, title, html, {
		"开始" : function() {
			var startTime = html.find("input[name=startDate]").datepicker("getDate");
			if (!startTime) {
				alert("请选择开始时间。");
				return;
			}
			var endTime = html.find("input[name=endDate]").datepicker("getDate");
			if (!endTime) {
				alert("请选择结束时间。");
				return;
			}
			var intervalTime = html.find("input[name=intervalTime]").val();//查询间隔时间
			if (!intervalTime) {
				alert("请填写查询间隔时间。");
				return;
			}

			var re = /^[1-9]+[0-9]*]*$/;
			if (!re.test(intervalTime))
			{
				alert("查询间隔时间只能为正整数");
				return;
			}
			if(parseInt(intervalTime) > 9999){
				alert("查询间隔时间只能小于9999。");
				return;
			}

			var playbackIntervalTime = html.find("input[name=playbackIntervalTime]").val();//回放间隔时间
			if (!playbackIntervalTime) {
				alert("请填写回放间隔时间。");
				return;
			}
			var pre = /^(?:0|[1-9][0-9]*)$/;
			if (!pre.test(playbackIntervalTime))
			{
				alert("回放间隔时间只能为大于等于0的整数。");
				return;
			}
			if(parseInt(playbackIntervalTime) > 999){
				alert("回放间隔时间只能小于999。");
				return;
			}


			deptData.playbackIntervalTime=playbackIntervalTime;//将回放间隔时间放入人员信息object 中

			startTime.setHours(html.find("select[name=startHours]").val());
			startTime.setMinutes(html.find("select[name=startMinutes]").val());
			startTime.setSeconds(html.find("select[name=startSeconds]").val());
			endTime.setHours(html.find("select[name=endHours]").val());
			endTime.setMinutes(html.find("select[name=endMinutes]").val());
			endTime.setSeconds(html.find("select[name=endSeconds]").val());
			if (startTime > endTime) {
				alert("开始时间不能大于结束时间。");
				return;
			}
			if (startTime == endTime) {
				alert("开始时间不能等于结束时间。");
				return;
			}
			if ((endTime - startTime) > 86400000) {
				alert("时间跨度不能超过24小时。");
				return;
			}
			var dialog = this;

			//node.addClass("htrack");// 标记为正在进行历史轨迹
			deptData.isHis = 1;
			$(dialog).dialog("close");
			var userHisRou=new HistoryGps();//查询历史GPS的方法，百度打点划线
			userHisRou.recordedData(deptData,startTime,endTime,intervalTime);
		}
	}, true, {
		width : 450,
		height : 330
	});
}

//清除历史记录
function clearHisRor(deptData){
	if(typeof deptData.baidu_hisMarkers != "undefined" && deptData.baidu_hisMarkers.length != 0){
		for(var i=0; i<deptData.baidu_hisMarkers.length; i++  ){
			baiduMap.removeOverlay(deptData.baidu_hisMarkers[i]);
			//map.removeOverlay(data.hisLabels[i]);
		}
		delete deptData.baidu_hisMarkers;
		delete deptData.hisLabels;
	}
	if(typeof deptData.baidu_hisLine != "undefined"){
		baiduMap.removeOverlay(deptData.baidu_hisLine);
		delete deptData.baidu_hisLine;
	}
}