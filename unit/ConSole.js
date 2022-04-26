var Dream = {};
Dream.ConSole = function () {
    let resource = context.getResources();
    MShow_hide = threads.start(Dream.Show_hide);
    ConSole = floaty.rawWindow(
        <relative id="consoles">
            <vertical w="*">
                <card id="indx2" w="*" margin="0 0 0 1" h="30" background="#161824" cardCornerRadius="3" cardElevation="2dp" gravity="center_vertical" alpha="0.8"  >
                    <horizontal gravity="center_vertical" w="*" >
                        <text w="auto" h="auto" textSize="14" margin="8 0 20 0" id="Dream ALOS" textColor="#00ffd8" text="森小吉" />
                        <text w="auto" h="auto" textSize="14" margin="8 0 20 0" id="time" textColor="#00ffd8" />
                    </horizontal>
                </card>
                <vertical w="*" h="500">
                    <com.stardust.autojs.core.console.ConsoleView id="console" background="#000000" h="260" alpha="0.8" />
                </vertical>
            </vertical>
        </relative>
    );
    ConSole.setTouchable(false);
    ConSole.setPosition(16, 100);
    ConSole.setSize(device.width * 3 / 5 + 20, device.height * 1 / 3 + 200);
    ConSole.console.setConsole(runtime.console);
    try {
        let c = new android.util.SparseArray();
        let Log = android.util.Log;
        c.put(Log.VERBOSE, new java.lang.Integer(colors.parseColor("#55deee")));
        c.put(Log.DEBUG, new java.lang.Integer(colors.parseColor("#ffffff")));
        c.put(Log.INFO, new java.lang.Integer(colors.parseColor("#64dd17")));
        c.put(Log.WARN, new java.lang.Integer(colors.parseColor("#2962ff")));
        c.put(Log.ERROR, new java.lang.Integer(colors.parseColor("#d50000")));
        c.put(Log.ASSERT, new java.lang.Integer(colors.parseColor("#ff534e")));
        ConSole.console.setColors(c);
    } catch (error) { }
    try {
        ui.run(function () {
            input_container = ConSole.console.findViewById(getResourceID("input_container", "id"));
            input_container.attr("visibility", "gone");
        })
    } catch (error) { }
    function getResourceID(name, defType) {
        return resource.getIdentifier(name, defType, context.getPackageName());
    };
    setInterval(function () {
        let Dream_time = runTime();
        if (Dream_time) {
            try {
                if (Dream_time) ui.run(() => ConSole.time.text(Dream_time));
            } catch (error) { }
        }
    }, 1000);


}
Dream.Show_hide = function () {
    var Show_hide = floaty.rawWindow(
        <vertical>
            <img id="action" src="@drawable/ic_visibility_black_48dp" text="显示" tint="#161824" alpha="0.8" h="20"></img>
            <text id="show" text="显示"></text>
        </vertical>
    );
    Show_hide.show.setVisibility(8);
    Show_hide.setPosition(device.width - 100, 100);
    Show_hide.action.on("click", function () {
        if (Show_hide.show.getText() == "显示") {
            Show_hide.show.setText("隐藏");
            ConSole.consoles.setVisibility(8);
            Show_hide.action.setSource("@drawable/ic_visibility_off_black_48dp");
        } else if (Show_hide.show.getText() == "隐藏") {
            Show_hide.show.setText("显示");
            ConSole.consoles.setVisibility(0);
            Show_hide.action.setSource("@drawable/ic_visibility_black_48dp");
        }

    })
}

Dream.Logss = function (msg) {
    console.verbose("[" + format(new Date().getTime(), 'hh:ii:ss') + "] " + msg);//自定义带时间log
}
Dream.setPosition = function (p_x, p_y) {
    ConSole.setPosition(p_x, p_y);
}
Dream.close = function () {
    floaty.closeAll();//关闭控制台
}
Dream.clear = function () {
    console.clear();//清空控制台
}

function format(time, format) {
    let d = time ? new Date(time) : new Date();
    let t = function (i) { return (i < 10 ? '0' : '') + i };

    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    let weekday = d.getDay();

    return format.replace(/(yy){1,2}|m{1,2}|d{1,2}|h{1,2}|i{1,2}|s{1,2}|w{1,2}/gi, function (r) {
        switch (r.toUpperCase()) {
            case 'YY':
                return ('' + year).substr(2);
            case 'YYYY':
                return year;
            case 'M':
                return month;
            case 'MM':
                return t(month);
            case 'D':
                return day;
            case 'DD':
                return t(day);
            case 'H':
                return hour;
            case 'HH':
                return t(hour);
            case 'I':
                return minutes;
            case 'II':
                return t(minutes);
            case 'S':
                return seconds;
            case 'SS':
                return t(seconds);
            case 'WW':
                return ['Sunday', 'Monday', 'TuesDay', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday];
        }
    });
}

var runTime = function () {
    var startTime = new Date().getTime()
    return function () {
        var endTime = new Date().getTime()
        var spendTime = Math.floor((endTime - startTime) / 1000)
        let mok = util.format('%d', spendTime)
        return parseInt(mok / 60 / 60) + " : " + parseInt(mok / 60) % 60 + " : " + mok % 60
    }
}()

module.exports = Dream;