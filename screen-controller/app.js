const socket = io('http://130.237.14.63:3000');
const synth = new Tone.Synth().toMaster();

var clock = new THREE.Clock();
var scene, stats;
var cliff, sun;
var boxes = [];
var notes = [];

const WIDTH = 100;
const HEIGHT = 10;
const MARGIN = 40;

var time = Date.now();

// SOCKET LISTENERS

socket.on('boxOnScreen',function(data){
	for (var c in data){
		if (data.hasOwnProperty(c) && data[c].duration > 0){
			let box = new Box(c, data[c].duration, data[c].id);
			scene.add(box.mesh);
			boxes.push(box);
		}
	}
});

socket.on('noteOnScreen',function(data){
	for (var i = 0; i < data.length; i++) {
		note = data[i];
		if (note.ok) {
			var mesh = scene.getObjectByName(note.boxId);
			if (mesh){
				mesh.material.opacity = 0.5;
				synth.triggerAttackRelease(note.name, note.duration);
			}
		} else {
			synth.triggerAttackRelease('C0', note.duration);
		}
	}
});

// 3D

window.onload = function(){

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x6622ff,0.0004);

	camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,10000);
	camera.position.set(0,600,-1300);
	camera.lookAt(scene.position);

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
	let cliffMaterial = new THREE.MeshPhongMaterial({
		color:0x000000,
		specular:0xff0000
	});
	cliff = new THREE.Mesh(cliffGeometry,cliffMaterial);
	cliff.position.y = -510;
	cliff.position.z = 1000;
	scene.add(cliff);
	// edge
	let edgeGeometry = new THREE.CubeGeometry(1000,10,200);
	let edgeMaterial = new THREE.MeshBasicMaterial({
		color:0x00ff00,
		transparent:true,
		opacity:0.9
	})
	edge = new THREE.Mesh(edgeGeometry,edgeMaterial);
	edge.position.y = 0;
	edge.position.z = 100;
	scene.add(edge);
	// world
	let worldGeometry = new THREE.SphereGeometry(3000,50,50);
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
	stats.end();
}

// CREATE BOX

function Box(color, duration, id){

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

	this.geometry = new THREE.CubeGeometry(WIDTH,HEIGHT,duration*200);
	this.material = new THREE.MeshBasicMaterial({
		color:this.color,
		side:THREE.DoubleSide,
	});

	this.mesh = new THREE.Mesh(this.geometry,this.material);
	this.mesh.name = id;
	this.mesh.position.x = this.offset*WIDTH + (this.offset * MARGIN);
	this.mesh.position.x -= WIDTH*2;
	this.mesh.position.y = 0;
	this.mesh.position.z = 1000;

	this.move = function(){
		this.mesh.position.z -= 5;
	}

	this.destroy = function(){
		this.mesh.position.y = this.mesh.position.y - 20;
		var _this = this;
		setTimeout(function(){
			scene.remove(_this.mesh);
			//boxes.shift();
		},400);
	}
}