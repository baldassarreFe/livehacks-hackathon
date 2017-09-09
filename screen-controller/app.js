const socket = io('http://130.237.14.66:3000');
const synth = new Tone.Synth().toMaster();

var notes 	= [];

socket.on('noteOnScreen',function(data){
	console.log(data);
	data.forEach(playNote);
});

window.addEventListener("keydown",function(){
	let data = {
		name:"C#4",
		duration:"8n"
	}
	playNote(data);
});

/*setInterval(function(){
	let data = {
		name:"C#4",
		duration:"8n"
	}
	playNote(data);
},400);*/

// 3D

var clock = new THREE.Clock();
var scene;

window.onload = function(){

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x00ffff,0.0004);

	camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,20000);
	camera.position.set(0,400,-900);
	camera.lookAt(scene.position);

	controls = new THREE.TrackballControls(camera);
		
	renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
	renderer.setSize(window.innerWidth,window.innerHeight);
	document.body.appendChild(renderer.domElement);

	addEnvironment();
	render();
}

function addEnvironment(){
	sunMaterial = new THREE.MeshLambertMaterial({
		color:0xffffff,
		side:THREE.DoubleSide
	});
	sunGeometry = new THREE.SphereGeometry(20,20,20);
	sun = new THREE.Mesh(new THREE.SphereGeometry(20,20,20),sunMaterial);
	sun.add(new THREE.PointLight(0xff5300,10,1500));
	scene.add(sun);

    worldMaterial = new THREE.MeshPhongMaterial({
    	side:THREE.DoubleSide,
    	color:0x0000ff
    });
    world = new THREE.Mesh(new THREE.SphereGeometry(1000,50,50),worldMaterial);
    scene.add(world);
}

function render(){
    delta = (new Date).getTime()*0.001;
	angle = delta*0.05;
	time = clock.getElapsedTime();
	sun.position.set(0, -200 + 800*Math.cos(angle), 800*Math.sin(angle));
	for (let i = 0; i < notes.length; i++){
		note = notes[i];
		if (note.alive){
			note.move();
		}
		if (note.mesh.position.z < 0){
			note.destroy();
		}
	}
	requestAnimationFrame(render,renderer.domElement);
	renderer.render(scene,camera);
	controls.update();
}

// DRAW

/*var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function draw() {
	requestAnimationFrame(draw,canvas);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.save();
	for (let i = 0; i < notes.length; i++){
		note = notes[i];
		if (note.alive){
			note.move();
			ctx.fillStyle = note.color;
			ctx.fillRect(note.x,note.y,canvas.width/4,note.height);
		}
		if (note.y > window.height){
			note.alive = true;
		}
	}
	ctx.restore();
	ctx.fillRect(0,canvas.height-1,canvas.width,1);
}

draw();*/

// NOTE FUNCTIONS

function Note(){
	let rand = getRandomValue(4);

	this.alive = true;
	this.geometry = new THREE.CubeGeometry(canvas.width/4,10,200);

	this.material = new THREE.MeshPhongMaterial({
		color:0x550000,
		specular:0xff5300,
		combine:THREE.MixOperation,
		reflectivity:0.6,
		refractionRatio:0.1,
		side:THREE.DoubleSide,
	});

	this.mesh = new THREE.Mesh(this.geometry,this.material);
	this.mesh.position.x = (canvas.width/4 + 40) * rand - (canvas.width/2);
	this.mesh.position.y = 0;
	this.mesh.position.z = 1000;
	this.move = function(){
		this.mesh.position.z = this.mesh.position.z - 10;
	}
	this.destroy = function(){
		this.alive = false;
		//this.mesh.material.opacity = 0.1;
		this.mesh.position.y = this.mesh.position.y - 10;
		setTimeout(function(){
			scene.remove(this.mesh)
		},500);

	}
	this.success = function(){

	}
}

function playNote(data){
	let note = new Note();
	scene.add(note.mesh);
	notes.push(note);
	synth.triggerAttackRelease(data.name,data.duration);
}

// HELPERS

function getRandomValue(max){
	let val = Math.round(Math.random()*(max-1));
	console.log("Random value: "+val);
	return val;
}

// LISTENERS

window.addEventListener('resize',function(event){
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth,window.innerHeight);
},false);