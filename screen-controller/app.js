const socket = io('http://130.237.14.63:3000');
const synth = new Tone.Synth().toMaster();

var clock = new THREE.Clock();
var scene, stats;
var cliff;
var boxes = [];
var notes = [];

const WIDTH = 100;
const HEIGHT = 10;
const MARGIN = 40;

var time = Date.now();

// SOCKET LISTENERS

socket.on('boxOnScreen',function(data){
	console.log(data);
	for (var c in data){
		if (data.hasOwnProperty(c) && data[c] > 0){
			let box = new Box(c, data[c].duration, data[c].boxId);
			scene.add(box.mesh);
			boxes.push(box);
		}
	}
});

socket.on('noteOnScreen',function(data){
	//var object = scene.getObjectByName(data.id);
	//object.success();
	//synth.triggerAttackRelease(data[i].name,data[i].duration);
});

// 3D

window.onload = function(){

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x0000ff,0.0005);

	camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,10000);
	camera.position.set(0,400,-900);
	camera.lookAt(scene.position);

	controls = new THREE.TrackballControls(camera);
	
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);
		
	renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
	renderer.setSize(window.innerWidth,window.innerHeight);
	document.body.appendChild(renderer.domElement);

	environment();
	render();
}

function environment(){
	// cliff 
	let cliffGeometry = new THREE.CubeGeometry(1000,1000,2000);
	let cliffMaterial = new THREE.MeshBasicMaterial({
		color:0x000000
	});
	cliff = new THREE.Mesh(cliffGeometry,cliffMaterial);
	cliff.position.y = -510;
	cliff.position.z = 1000;
	scene.add(cliff);
	// world
	let worldGeometry = new THREE.SphereGeometry(1000,50,50);
    let worldMaterial = new THREE.MeshPhongMaterial({
    	side:THREE.DoubleSide,
    	color:0x0000ff
    });
    world = new THREE.Mesh(worldGeometry,worldMaterial);
    scene.add(world);
}

function render(){
	stats.begin();
	for (let i = 0; i < boxes.length; i++){
		let box = boxes[i];
		box.move();
		if (box.mesh.position.z < 0){
			box.destroy();
		}
	}
	requestAnimationFrame(render,renderer.domElement);
	renderer.render(scene,camera);
	controls.update();
	stats.end();
}

// NOTE FUNCTIONS

function Box(color,duration,id){

	//let char = name.charAt(0);

	switch (color){
		case 'red': 
		this.color = 0xff0000;
		this.offset = 0;
		break;
		case 'green':
		this.color = 0x00ff00;
		this.offset = 1;
		break;
		case 'blue':
		this.color = 0x0000ff;
		this.offset = 2;
		break;
		case 'yellow':
		this.color = 0xffff00;
		this.offset = 3;
		break;
	}

	this.name = id;

	this.geometry = new THREE.CubeGeometry(WIDTH,HEIGHT,duration*200);

	this.material = new THREE.MeshBasicMaterial({
		color:this.color,
		side:THREE.DoubleSide,
	});

	this.mesh = new THREE.Mesh(this.geometry,this.material);
	this.mesh.position.x = this.offset*WIDTH + (this.offset * MARGIN);
	this.mesh.position.x -= WIDTH*2;
	this.mesh.position.y = 0;
	this.mesh.position.z = 1000;

	this.move = function(timeElapsed){
		//this.mesh.position.z = this.mesh.position.z - ((cliff.geometry.parameters.depth / 4000) * timeElapsed);
		this.mesh.position.z += 10;
	}

	this.success = function(){
		this.mesh.material.color = 0x000000;
	}
	
	this.destroy = function(){
		this.mesh.position.y = this.mesh.position.y - 20;
		var _this = this;
		setTimeout(function(){
			scene.remove(_this.mesh);
			boxes.shift();
		},400);
	}

}

function drawBox(data){
	for (var color in data){
		if (data.hasOwnProperty(color) && data.color > 0){
			let box = new Box(color, data.color);
			scene.add(box.mesh);
			boxes.push(box);
		}
	} 
}

/*function playNote(data){
	let note = new Note(data.name,data.duration);
	scene.add(note.mesh);
	notes.push(note);
	//synth.triggerAttackRelease(data.name,data.duration);
}*/