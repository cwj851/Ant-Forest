//获取安卓版本
let Android_version=device.release
//文件路径
if(parseInt(Android_version)>=11){
    var path = "/storage/emulated/0/pansong291.xposed.quickenergy/config.json";
}else{
    var path = "/storage/emulated/0/Android/data/pansong291.xposed.quickenergy/config.json";
}
//打开文件
var file = open(path);
//读取文件的所有内容
var text = file.read();
//转换成json对象
var config_json=eval('(' + text+ ')');
//检测时间
config_json.checkInterval=3600000;
//线程数
config_json.threadCount=1;
config_json.queryThreadCount=1;
//写入文件
files.write(path, JSON.stringify(config_json))
//关闭文件
file.close();
toastLog("XQ_Crystal配置修改省电模式完成")