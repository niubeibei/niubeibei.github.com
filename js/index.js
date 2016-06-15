$(document).ready(function(){
	goTopEx();
	initMap();
});

function goTopEx() {
	var obj = document.getElementById("goTopBtn");
	function getScrollTop() {
		return document.documentElement.scrollTop + document.body.scrollTop;
	}
	function setScrollTop(value) {
		if (document.documentElement.scrollTop) {
		    document.documentElement.scrollTop = value;
		} else {
		    document.body.scrollTop = value;
		}
	}
	window.onscroll = function() {
		getScrollTop() > 0 ? $("#goTopBtn").css("display","") : $("#goTopBtn").css("display","none");
	}
	$("#goTopBtn").bind("click",function(){
		var goTop = setInterval(scrollMove, 10);
		function scrollMove() {
		    setScrollTop(getScrollTop() / 1.1);
		    if (getScrollTop() < 1) clearInterval(goTop);
		}
	});
	$("#goTopBtn").bind("mouseover",function(){
		$("#goTopBtn").css("background-position","35px 0px");
	});
	$("#goTopBtn").bind("mouseout",function(){
		$("#goTopBtn").css("background-position","0px 0px");
	});
	$("#goTopBtn").bind("touchstart",function(){
		$("#goTopBtn").css("background-position","35px 0px");
	});
	$("#goTopBtn").bind("touchend",function(){
		$("#goTopBtn").css("background-position","0px 0px");
	});
}

function initMap(){
	var map = new BMap.Map("map");//在container容器中创建一个地图,参数container为div的id属性;
    var point = new BMap.Point(116.300195, 40.025952);//定位
    //map.centerAndZoom('北京');//根据参数定义显示城市
    map.addControl(new BMap.NavigationControl());//缩放地图的控件，默认在左上角；
    map.addControl(new BMap.MapTypeControl());//地图类型控件，默认在右上方
    map.addControl(new BMap.ScaleControl());//地图显示比例的控件，默认在左下方；
    map.addControl(new BMap.OverviewMapControl());//地图的缩略图的控件，默认在右下方
    var marker = new BMap.Marker(point);  // 创建标注
	map.addOverlay(marker);              // 将标注添加到地图中
	map.centerAndZoom(point, 17);//将point移到浏览器中心，并且地图大小调整为15;
	var opts = {
		width : 200,     // 信息窗口宽度
		height: 100,     // 信息窗口高度
		title : "厢黄旗" , // 信息窗口标题
		enableMessage:true,//设置允许信息窗发送短息
		message:"我的地址噢~"
	}
	var infoWindow = new BMap.InfoWindow("地址：北京市海淀区厢黄旗", opts);  // 创建信息窗口对象
	marker.addEventListener("click", function(){
		map.openInfoWindow(infoWindow,point); //开启信息窗口
	});
}