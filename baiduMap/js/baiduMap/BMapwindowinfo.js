function getWindowInfo(address,lng,lat){
	var html =[];
	var userlist="";
	var content = "<table id=\"infocontent\" style=\"width: 100%;height: 100%;display: block;\">"+
	"<tr><td>描述:</td>"+
	"<td><input type=\"text\" style=\"width:220px\" id=\"target_address\" value=\""+address+"\"/></td>"+
	"<td style=\"3px\"><a href = \'javascript:void(0)\' onclick=\"changeIcon()\"><img id=\"add\" src=\"./image/marker/mark.png\" /></a></td></tr>"+
	"<tr><td valign=\"top\">目标:</td>"+
	"<td><textarea rows=\"7\" id=\"usersiplist\" cols=\"25\" id=\"receivers\">"+userlist+"</textarea>"+
	"</td><td style=\"3px\"><img id=\"add\" src=\"./image/add.png\" onclick=\"openUserList()\" /></td></tr>"+
	"<tr><td colspan=\"3\" valign=\"top\" align=\"right\"><input type=\"button\" value=\"发送\" onclick=\"sendGroupMsg(document.getElementById(\'target_address\').value,document.getElementsByName(\'grouplist\'),"+lng+","+lat+")\"/> "+
	"<input type=\"button\" value=\"保存\" onclick=\"saveAddress(document.getElementById(\'target_address\').value,"+lng+","+lat+")\"/> "+
	"<input type=\"button\" value=\"删除\" onclick=\"clearCurrentMarker("+lng+","+lat+")\"/></td></tr>"+
	"</table>";
	html.push(content);
	html.push(getImgList(lng,lat));
	return html;
}
function getImgList(lng,lat){
	var html = "<div id=\"imglist\" style=\"display:none\"><div id=\"divStyle\" ><ul><li>";
	var position_x =0;
	var position_y=0;
	var y=0;
	var width =13;
	var height =21;
	for(var i=1;i<=18;i++){
		html += "<a onclick=\"selectStyle("+(i-1)+","+lng+","+lat+")\" href = \'javascript:void(0)\'><img src=\"./image/marker/transparent.gif\" style=\"width:"+width+"px;height:"+height+"px;background-position: "+position_x+"px "+position_y+"px\" /></a>";
		position_x -= 23;
		if(i%6 ==0){
			position_x = 0;
			y++;
			position_y = 4-y*25;
			if(height == 21){
				height =24;
			}else{
				height = 21;
			}
			if(y==1){
				width=12+8-y;
			}else{
				width=12+8-y-1;
			}
		}
	}
	html += "</li></ul></div><div><a onclick=\"backToInfocontent()\" href = \'javascript:void(0)\'>返回</a></div><div>";
	return html;
}
//打开备选区
function openUserList(){
	userSelection=1;
	showAlternativePeople();
}
//保存地址信息
function saveAddress(address,lng,lat){
	var tm = targetMarkerMap.Get(lng+"-"+lat); //获取标注点
	var old_label = tm.getLabel();
	if(old_label != address){
		var label = new BMap.Label(address,{offset:new BMap.Size(20,-10)});//添加文字标签
		document.getElementById("target_address").value=address;
		map.removeOverlay(tm); //删除点
		tm.setLabel(label);
		map.addOverlay(tm); //更新点
		markerAddressMap.Set(lng+"-"+lat,address);
	}
}
//写入选中成员信息
function insertWindowInfo(){
	var content = "";
	var selectedEmpSip = $("#selectedUser option");
	for(var i=0;i<selectedEmpSip.length;i++){
		content += selectedEmpSip[i].text + ";\n";
	}
	document.getElementById("usersiplist").innerText=content;
}