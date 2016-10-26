let backgroundSkin = new Skin({ fill : ["#202020", "#7DBF2E"] });
let textStyle = new Style({ font: "bold 20px", color: "black" });
let smallTextStyle = new Style({font: '15px', color: 'black'});
let feedingStatusStyle = new Style({font: 'bold 15px', color: 'black'});
let feedingStatusTitleStyle = new Style({font: 'bold 20px', color: 'black'});
let homeButtonSkin = new Skin ({borders:{left: 1, right: 1, bottom: 1, top: 1}, stroke: "black"});


var Pins = require("pins");
let remotePins;

var feedingStatus = "Inactive";
var currentSong = "Currently No Music";
var day = 0;
var amount = 0;
var automatedMusic = 0;

class AppBehavior extends Behavior{
	onLaunch(application){
		loadHome();
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
		if (remotePins) {
			// remotePins.invoke("/led/read", val => {
			// 	trace("Companion LED Value: " + val + "\n");
			// });
			remotePins.invoke("/led/write", value);

		} 
	}
}
application.behavior = new AppBehavior();

function loadHome(){
	application.empty();
	application.add(new homeScreen({name: 'home'}));	
	let homeImage = new Picture({url: "assets/home.png"});
	application.home.add(homeImage);
	application.home.add(new homeScreenButton());

}

function loadMain(){
	application.empty();
	application.add(new MainContainer());
	let dogImage = new Picture({url: "assets/dog.png"})
	dogImage.aspect = 'fill';
	application.main.maincolumn.status.dogInfo.image.add(dogImage);
	application.main.maincolumn.status.feedingStatus.col.food.string += feedingStatus;
	application.main.maincolumn.status.feedingStatus.col.song.string += currentSong;
	application.main.maincolumn.currFeedingSchedule.col1.col2.lst.day.string += String(day);
	application.main.maincolumn.currFeedingSchedule.col1.col2.lst.amount.string += String(amount);
	application.main.maincolumn.currFeedingSchedule.col1.col2.lst.music.string += String(automatedMusic);
}
function loadSchedule(){
	application.empty();

}

var homeScreen = Container.template($ => ({
	name: $.name, top: 0, bottom: 0, left: 0, right: 0,
	contents:[
	]
}));

var homeScreenButton = Container.template($ => ({
	height: 50, left: 20, right: 20, bottom: 10, active: true, exclusiveTouch: true,
	contents: [
		new Label({hidden: false, width: 200, skin: homeButtonSkin, string: "Proceed", style: textStyle})
	],
	behavior: Behavior ({
		onTouchEnded: function(container, data){
			loadMain();
		}
	})
}));

var backButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchEnded: function(container, data){
			loadHome();
		}
	})
}));
var scheduleButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchEnded: function(container, data){
			loadSchedule();
		}
	})
}));
var feedDogButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
		}
	})
}));
var playMusicButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
		}
	})
}));

let blueSkin = new Skin({fill: "#004489"});
let creamSkin = new Skin({fill: "#E1E1D6"});
let greyBlueSkin = new Skin({fill: "#D3D9DF"});
let greySkin = new Skin({fill: "#989898"});
let darkGreySkin = new Skin({fill: "#565656"});
let creamGreySkin = new Skin({fill: "#DBDBCE"});
let whiteSkin = new Skin ({fill: 'white'});

let headlineStyle = new Style({font: 'bold 50px', color: 'black'});


let dogSkin = new Skin ({fill: "#white", borders:{left: 1, right: 1, bottom: 1, top: 1}, stroke: "black"});

let MainContainer = Container.template($ => ({
    name: "main",
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: greyBlueSkin, state: 0,
    contents: [
    	new Column({
    		name: "maincolumn",
    		top: 0, bottom: 0, left: 0, right: 0,
    		skin: whiteSkin,
    		contents: [
    			new backButton({string: 'Back'}),
    			new Line({
		    		name: 'status',
		    		height: 200,
		    		skin: greyBlueSkin,
		    		contents:[
		    			new Column({
		    				name: 'dogInfo',
		    				width: 160,
		    				contents: [
		    					new Container({
				    				name: 'image',
				    				skin: dogSkin,
				    				height: 167, width: 137,
				    				contents: []
		    					}),
		    					new Label({name: 'dogName',style: textStyle,string: 'Max'})
		    				]
		    			}),
		    			new Container({
		    				name: 'feedingStatus',
		    				top: 5, bottom: 5, left: 5, right: 5,
		    				contents: [
		    					new Column({ 
		    						name: 'col',
		    						top: 0, bottom: 0, left: 0, right: 0,
		    						contents: [
		    							new Label({left: 5, style: feedingStatusTitleStyle, string: 'Feeding Status: \n'}),
		    							new Label({name: 'food', left: 5, style: feedingStatusStyle, string: ''}),
		    							new Label({left: 5, style: feedingStatusTitleStyle, string: 'Song: \n'}),
		    							new Label({name: 'song', left: 5, style: feedingStatusStyle, string: ''}),
		    						]
		    					})
		    				]
		    			})
		    		]
    			}),
		    	new Line({
		    		name: 'currFeedingSchedule',
		    		top: 5, height: 140, left: 5, right: 5,
		    		skin: creamSkin,
		    		contents:[
		    			new Column({
		    				name: 'col1', top: 0, bottom: 0, left: 0, right: 0,
		    				contents:[
		    					new Label({left: 0, right: 0, style: textStyle ,string: "Current Feeding Schedule"}),
		    					new Column({
		    						name: 'col2', left: 0, right: 0, top: 0, bottom: 0,
		    						contents: [
		    							new Column({
		    								name: 'lst',top: 0, left: 0, right: 0, bottom: 0,
		    								contents: [
		    									new Label({name: 'day', left: 0, right: 0, style: smallTextStyle ,string: "Times Per Day: "}),
		    									new Label({name: 'amount', left: 0, right: 0, style: smallTextStyle ,string: "Amount Per Feeding: "}),
		    									new Label({name: 'music', left: 0, right: 0, style: smallTextStyle ,string: "Automated Music: "})
		    								]
		    							}),
		    							new scheduleButton({string: "Set Feeding Schedule"})
		    						]
		    					})
		    				]
		    			})
		    		]
		    	}),
		    	new Column({
		    		name: 'buttons',
		    		top: 5, height: 140, left: 5, right: 5,
		    		skin: darkGreySkin,
		    		contents:[
		    			new feedDogButton({string: "Feed Dog"}),
		    			new playMusicButton({string: "Play Music"})
		    		]
		    	})
    		]
    	})
    ],
    // contents: [
    //     Label($, { name: "statusString", top: 0, bottom: 0, left: 0, right: 0, style: textStyle, string: "OFF" }),
    // ],
    // Behavior: class extends Behavior {
    //     onTouchBegan(container) {
    //         container.state = 1;
    //         application.distribute("onToggleLight", 1);
    //     }
    //     onTouchEnded(container) {
    //         container.state = 0;
    //         application.distribute("onToggleLight", 0);
    //     }
    //     // onToggleLight(container, value) {
    //     //     container.statusString.string = (value) ? "ON" : "OFF";
    //     // }
    // }
}));

let scheduleScreen = Container.template($ => ({
    name: "main",
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: greyBlueSkin, state: 0,
    contents: [
    ]
}));