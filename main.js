let backgroundSkin = new Skin({ fill : ["#202020", "#7DBF2E"] });
let textStyle = new Style({ font: "bold 50px", color: "white" });

var Pins = require("pins");
let remotePins;
class AppBehavior extends Behavior{
	onLaunch(application){
		application.add(new MainContainer());
		let discoveryInstance = Pins.discover(
			connectionDesc => {
				if (connectionDesc.name == 'pins-share-led'){
					trace('Connection to remote pins\n');
					remotePins = Pins.connect(connectionDesc);
				}
			},
			connectionDesc => {
				if (connectionDesc.name == 'pins-share-led'){
					trace('Disconnected from remote pins\n');
					remotePins = undefined;
				}
			});
	}
	onToggleLight(application, value){
		trace(remotePins + "\n");
		trace(value + "\n");
		if (remotePins) remotePins.invoke("/ledBLL/write", value);
		trace("toggled\n");
	}
}
application.behavior = new AppBehavior();

let MainContainer = Container.template($ => ({
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: backgroundSkin, state: 0,
    contents: [
        Label($, { name: "statusString", top: 0, bottom: 0, left: 0, right: 0, style: textStyle, string: "OFF" }),
    ],
    Behavior: class extends Behavior {
        onTouchBegan(container) {
            container.state = 1;
            application.distribute("onToggleLight", 1);
        }
        onTouchEnded(container) {
            container.state = 0;
            application.distribute("onToggleLight", 0);
        }
        onToggleLight(container, value) {
            container.statusString.string = (value) ? "ON" : "OFF";
        }
    }
}));