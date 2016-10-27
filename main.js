//COMPANION
import { 
    RadioGroup, 
    RadioGroupBehavior,
    LabeledCheckbox
} from 'buttons';

import {
    HorizontalSlider, HorizontalSliderBehavior
} from 'sliders';

let textStyle = new Style({ font: "bold 20px", color: "black" });
let smallTextStyle = new Style({font: '15px', color: 'black'});
let feedingStatusStyle = new Style({font: 'bold 15px', color: 'black'});
let feedingStatusTitleStyle = new Style({font: 'bold 20px', color: 'black'});

let homeButtonSkin = new Skin ({borders:{left: 1, right: 1, bottom: 1, top: 1}, stroke: "black"});
let backgroundSkin = new Skin({ fill : ["#202020", "#7DBF2E"] });

var feedingStatus = "Inactive";
var currentSong = "Currently No Music";
var amount = 0;
var tempAmount = 0;
var automatedMusic = 0;
var automatedMusicTemp = 0;
var automatedMusicTemp = 0;
var dailyFoodAllowance = "Once";
var dailyFoodAllowanceTemp = "Once";
var dailyFoodAllowanceOptions = ["Once", "Twice", "Three Times"];
var checked = false;
var radioChecked = false;

var Pins = require("pins");
let remotePins;
let deviceURL;

Handler.bind("/discover", Behavior({
    onInvoke: function(handler, message){
        trace("Found the device.\n");
        deviceURL = JSON.parse(message.requestText).url;
        // var discovery = JSON.parse(message.requestText);
        handler.invoke(new Message(deviceURL + "respond"), Message.TEXT);    
    },
    onComplete: function(handler, message, text){
        trace("Response was: " + text + "\n");
    }
}));
// Handler.bind("/changeUI", Behavior({
// 	onInvoke: function(handler, message){
// 		handler.invoke(new Message(deviceURL + "updateUI"), Message.TEXT);
// 	},
// 	onComplete: function(handler, message, text){
// 		trace("Updated\n");
// 	}
// }));

class AppBehavior extends Behavior{
	onDisplayed(application){
		application.discover("petfood.device.app");
	}
	onLaunch(application){
		loadHome();
		let discoveryInstance = Pins.discover(
			connectionDesc => {
				if (connectionDesc.name == 'pins-share-led'){
					trace('Connection to remote pins\n');
					remotePins = Pins.connect(connectionDesc);
					trace('remotePins has been set\n');
				}
			},
			connectionDesc => {
				if (connectionDesc.name == 'pins-share-led'){
					trace('Disconnected from remote pins\n');
					remotePins = undefined;
				}
			});
	}
	onQuit(application) {
        application.forget("petfood.device.app");
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
	application.main.maincolumn.currFeedingSchedule.col1.col2.lst.day.string += dailyFoodAllowance;
	application.main.maincolumn.currFeedingSchedule.col1.col2.lst.amount.string += String(amount);
	if (automatedMusic == 1){
		application.main.maincolumn.currFeedingSchedule.col1.col2.lst.music.string += "Yes";
	}else{
		application.main.maincolumn.currFeedingSchedule.col1.col2.lst.music.string += "No";
	}
}
function loadSchedule(){
	application.empty();
	application.add(new scheduleScreen());

}

var homeScreen = Container.template($ => ({
	name: $.name, top: 0, bottom: 0, left: 0, right: 0,
	contents:[
	]
}));

var homeScreenButton = Container.template($ => ({
	height: 50, left: 20, right: 20, bottom: 10, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 200, skin: homeButtonSkin, string: "Proceed", style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
			loadMain();
		}

	})
}));

var backButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = blueSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
			loadHome();
		}
	})
}));
var backButton2 = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label',hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = blueSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
			loadMain();
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
			checked = false;
			radioChecked = false;
		}
	})
}));
var feedDogButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 1, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
			remotePins.invoke("/led/write", 1)
			new Message(deviceURL + "updateUI").invoke(Message.JSON);
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
		}
	})
}));
var playMusicButton = Container.template($ => ({
	height: 30, left: 10, right: 10, bottom: 1, active: true, exclusiveTouch: true,
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

var pauseButton = Container.template($ => ({
	height: 30, left: 10, right: 10, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 200, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
			remotePins.invoke("/led/write", 0);
			new Message(deviceURL + "resetUI").invoke(Message.JSON);
		}
	})
}));

var setScheduleButton = Container.template($ => ({
	height: 30, left: 10, right: 5, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 130, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
			if (checked == false){
				automatedMusic = 0;
			}
			if (radioChecked != false){
				amount = tempAmount;
				dailyFoodAllowance = dailyFoodAllowanceTemp;
				automatedMusic = automatedMusicTemp;
				loadMain();
			}
		}
	})
}));

var resetButton = Container.template($ => ({
	height: 30, left: 5, right: 10, bottom: 5, active: true, exclusiveTouch: true,
	contents: [
		new Label({name: 'label', hidden: false, width: 130, skin: homeButtonSkin, string: $.string, style: textStyle})
	],
	behavior: Behavior ({
		onTouchBegan: function(container, data){
			container.label.skin = creamSkin;
		},
		onTouchEnded: function(container, data){
			container.label.skin = homeButtonSkin;
			checked = false;
			radioChecked = false;
			automatedMusicTemp = 0;
			dailyFoodAllowanceTemp = "Once";
			tempAmount = 0;
			loadSchedule();
		}
	})
}));

let radioButtonTemplate = RadioGroup.template($ => ({
    top: 0, bottom: 0, left: 5,
    style: smallTextStyle,
    Behavior: class extends RadioGroupBehavior {
        onRadioButtonSelected(buttonName) {
            dailyFoodAllowanceTemp = buttonName;
            radioChecked = true;
        }
    }
}));

let checkBoxTemplate = LabeledCheckbox.template($ => ({
    name: $.name, active: true, top: 0, bottom: 0, left: 5,
    behavior: Behavior({
        onSelected: function(checkBox){
            automatedMusicTemp = 1;
            checked = true;
        },
        onUnselected: function(checkBox){
            automatedMusicTemp = 0;
            checked = false;
        }
    })
}));

let sliderTemplate = HorizontalSlider.template($ => ({
    height: 50, left: 50, right: 50,
    Behavior: class extends HorizontalSliderBehavior {
        onValueChanged(container) {
            tempAmount = this.data.value;
        }
    }
}));

let blueSkin = new Skin({fill: "#004489"});
let creamSkin = new Skin({fill: "#E1E1D6"});
let greyBlueSkin = new Skin({fill: "#D3D9DF"});
let greySkin = new Skin({fill: "#989898"});
let darkGreySkin = new Skin({fill: "#565656"});
let creamGreySkin = new Skin({fill: "#DBDBCE"});
let whiteSkin = new Skin ({fill: 'white'});

let headlineStyle = new Style({font: 'bold 25px', color: 'black'});


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
		    		height: 200, left: 5, right: 5,
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
		    		top: 5, height: 140, left: 5, right: 5, bottom: 5,
		    		skin: darkGreySkin,
		    		contents:[
		    			new feedDogButton({string: "Feed Dog"}),
		    			new playMusicButton({string: "Play Music"}),
    					new pauseButton({string: "Pause All"})
		    		]
		    	})
    		]
    	})
    ],
}));

let scheduleScreen = Container.template($ => ({
    name: "main",
    top: 0, bottom: 0, left: 0, right: 0,
    active: true, skin: greyBlueSkin, state: 0,
    contents: [
    	new Column({
    		name: 'maincol', top: 0, bottom: 0, right: 0, left: 0,
    		contents: [
    			new backButton2({string: 'Back'}),
    			new Line({
    				name: 'checkBox',
    				top: 0, bottom: 0, right: 0, left: 0,
    				contents:[
    					new checkBoxTemplate({name: 'Play music @ scheduled feeding?'})
    				]
    			}),
    			new Column({
    				name: 'numberFeedings',
    				skin: blueSkin, top: 0, bottom: 0, right: 0, left: 0,
    				contents:[
    					new Label({style: headlineStyle, string: "Select # of Feedings Per Day:"}),
    					new radioButtonTemplate({buttonNames: dailyFoodAllowanceOptions.join()})
    				]
    			}),
    			new Column({
    				name: 'slider', skin: creamSkin,
    				top: 0, bottom: 0, left: 0, right: 0,
    				contents:[
    					new Label({style: headlineStyle, string: "Input Food Amount:"}),
    					new sliderTemplate({ min: 0, max: 50, value: 0 })
    				]
    			}),
    			new Line({
    				name: 'buttons', skin: blueSkin,
    				top: 0, bottom: 0, left: 0, right: 0,
    				contents:[
    					new setScheduleButton({string: "Set Schedule"}),
    					new resetButton({string: "Reset"})
    				]
    			})
    		]
    	})
    ]
}));