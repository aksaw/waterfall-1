// let brushStrokes
// let numPoints = 20;
let MIDI_MODE = true

//Fonts
let dudler, emeritus;

let points = []
let exciters = []
let floorTiles = []
let trailLifetime = 400
let excLifetime = 20
// let notes = {'D': 120, 'E': 120, 'F': 120, 'G': 120, 'A': 120, 'A#': 120, 'C'}

let oscillators = []
let audioContextStarted = false

let midiOut = null

let hold = false
// let exciter_history;

let clickX, clickY;
let mousePressedDuration = 0;
let reverb;

let notes = [
	// {
	// 	noteName: 'A#',
	// 	val: 46
	// },
	{
		noteName: 'F',
		val: 53
	},
	{
		noteName: 'A',
		val: 57
	},
	{
		noteName: 'A#',
		val: 58
	},
	{
		noteName: 'D',
		val: 62
	},
	// {
	// 	noteName: 'A',
	// 	val: 45
	// },
	// {
	// 	noteName: 'E',
	// 	val: 52
	// },
	// {
	// 	noteName: 'G',
	// 	val: 55
	// },
	// {
	// 	noteName: 'A',
	// 	val: 57
	// },
	// {
	// 	noteName: 'C#',
	// 	val: 61
	// }
]

function preload() {
	dudler = loadFont('assets/Dudler-Regular.woff');
	emeritus = loadFont('assets/Emeritus-Display.woff');
  }

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight)

	let reverb = null
	if (MIDI_MODE) {
		WebMidi
			.enable()
			.then(onMidiEnabled)
 		 	.catch(err => alert(err));
	} else {
		reverb = new p5.Reverb()
	}

	// for (let i = 0; i < 100; i++) {
	// 	exciters.push(new Exciter(width/2, height/2))
	// }
	
	// brushStrokes = []

	// for (let i = 0; i < numPoints; i++) {
	// 	let point = createVector(width/2, height/2)
	// 	points.push(point)

	// 	console.log(point)
	// }

	let N = 20
	for (let i=0; i < N; i++) {
		floorTiles.push(new FloorTile(400 + ((width - 800)/N * i), height / 3, random(0.1, 1.0) * ((width - 800)/N-50), 300, notes[i%4], i%4+1))
	}

	// exciter_history = new ExciterBuffer(120)
}

function draw() {

	background('Black')
	fill(255)
	textSize(48)
	textFont(emeritus)
	// text('Waterfall', width - 250, 55)

	// brushStrokes.forEach(brushStroke => {
	// 	brushStroke.draw()
	// })

	// if (mouseX !== pmouseX && mouseY !== pmouseY) {
	// 	points.shift()

	// 	let point = createVector(mouseX, mouseY)
	// 	points.push(point)
	// }

	// console.log(points);

	// stroke(255)

	// Trail
	// console.log(trailLifetime)
	trailLifetime -= 1
	// fill(trailLifetime)
	stroke(trailLifetime)
	strokeWeight(2)
	strokeJoin(ROUND)
	noFill()
	beginShape()
	for (let i=0; i<points.length; i++) {
		let pt = points[i]
		curveVertex(pt.x, pt.y)
	}
	endShape()

	// Exciters
	if (!hold) {
		for (let exciter of exciters) {
			gravity = createVector(0, 0.5)
			exciter.applyForce(gravity)
			exciter.update()
			exciter.edges()
			// exciter.show()	
		}

		for (let i = exciters.length-1; i >=0; i--) {
			if (exciters[i].finished()) {
				exciters.splice(i, 1)
			}
		}

		for (let exciter of exciters) {
			// store history
			exciter.updateHistory()
		}
		// exciter_history.pushClone(exciters)
	} else {
		// Draw exciter history 
		// exciter_history.show()

		// Draw current exciters
		// exciters = exciter_history.get()
		for (let exciter of exciters) {
			// exciter.show(true)	
			// exciter.history.show()
			exciter.history.incrementTimestep()
		}
		// Increment loop timestep
		// exciter_history.incrementTimestep()
	}

	// Floor tiles
	for (let floorTile of floorTiles) {
		floorTile.show()
	}

	// Check for intersections
	for (let floorTile in floorTiles) {
			floorTiles[floorTile].intersects(exciters)
		}

	// Check for hold
	if (mouseIsPressed) {
		if ((mouseX == clickX) && (mouseY == clickY)) {
			mousePressedDuration += 1
		} else {
			mousePressedDuration = 0
		}
		if (mousePressedDuration > 20) {
			hold = true
		}
	}  

	// if (hold) {
	// 	fill(255)
	// 	ellipse(mouseX, mouseY, 60, 60)
	// 	fill(0)
	// 	textSize(20)
	// 	textFont((dudler))
	// 	text("loop", mouseX-19, mouseY+7)
	// }


	if (frameCount % 5 == 0) {
		for (let i = 0; i < 5 * (1 + Math.sin(frameCount/60)); i++) {
			exciters.push(new Exciter(mouseX, mouseY, excLifetime))
		}
	}

	// // draw vertical line at mouseX
	// stroke(255);
	// strokeWeight(0.3);
	// line(mouseX, 0, mouseX, windowHeight);

	// for (tile of floorTiles) {
	// 	tile.height = 120 * (1.2 + Math.sin(millis()/1000))
	// }
}

function mouseClicked() {
	if (!MIDI_MODE) {
		if (!audioContextStarted) {
			userStartAudio();
			audioContextStarted = true
			for (osc of oscillators) {
				osc.start()
			}
		}
	}

	if (!hold) {
		exciters.push(new Exciter(mouseX, mouseY, excLifetime))
	}
	hold = false
}

function mouseDragged() {
	// brushStrokes.push(new BrushStroke(mouseX, mouseY))

	// if (!hold) {
		trailLifetime = 400

		if (mouseX < windowWidth && mouseY < windowHeight) {
			// let point = createVector(mouseX, mouseY)
			// points.push(point)

			// if (mouseX % 2 == 0) {
				exciters.push(new Exciter(mouseX, mouseY, excLifetime))
			// }
		}

		// Causes exciters to fall in a cool, circular pattern
		// for (const point in points) {
		// 	if (mouseX % 10 == 0) {	
		// 		exciters.push(new Exciter(mouseX, mouseY, excLifetime))
		// 	}
		// }

		// console.log(points.length, exciters.length)
	// }
}

function mousePressed() {
	if (mouseX < window.width && mouseY < window.height) {
		points = []
	}

	clickX = mouseX
	clickY = mouseY
	mousePressedDuration = 0
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	for (const floorTile in floorTiles) {
		floorTiles[floorTile].updateOnResize()
	}
  }

class Exciter {
	constructor(x, y, lifetime) {
		this.pos = createVector(x, y)
		this.vel = p5.Vector.mult(p5.Vector.random2D(), 4)
		this.acc = createVector(0, 0)
		this.lifetime = lifetime
		this.history = new ExciterBuffer(120)
	}

	finished() {
		return (this.lifetime <= 0)
	}

	applyForce(force) {
		this.acc = force
	}

	edges() {
		// if (this.pos.y >= height - 40) {
		// 	this.pos.y = height - 40
		// 	if (this.vel.y > 2) {
		// 		// this.vel.x = random(5, -5)
		// 		this.vel.x = random(-this.vel.y * 0.5, this.vel.y * 0.5)
		// 	} else {
		// 		this.vel.x = 0
		// 	}
		// 	// this.vel.y *= -1.5
		// 	// this.vel.y *= -0.93
		// 	this.vel.y *= -1
		// }

		if (this.pos.x < 0 || this.pos.x > width) {
			this.vel.x *= -0.93
		} 

		// console.log(this.pos.y);
	}

	update() {
		// let mouse = createVector(mouseX, mouseY)
		// this.acc = p5.Vector.sub(mouse, this.pos)
		// this.acc.setMag(1)

		this.vel.add(this.acc)
		// this.vel.limit(20)
	
		this.pos.add(this.vel)

		this.lifetime -= 1
	}

	show(held=false) {
		// fill(255)
		if (held) {
			// stroke(255, 0.5 * this.lifetime);
			fill(255)
			stroke(255, this.lifetime);
			strokeWeight(0.1)
		} else {
			stroke(255, this.lifetime);
			strokeWeight(1)
		}
		ellipse(this.pos.x, this.pos.y, 10, 10)
	}

	clone() {
		let exciter_copy = {}
		exciter_copy.pos = this.pos.copy()
		exciter_copy.vel = this.vel.copy()
		exciter_copy.acc = this.acc.copy()
		exciter_copy.lifetime = this.lifetime
		exciter_copy.show = this.show
		exciter_copy.finished = this.finished
		exciter_copy.applyForce = this.applyForce
		exciter_copy.edges = this.edges
		exciter_copy.update = this.update
		return exciter_copy
	}

	updateHistory() {
		this.history.push(this.clone())
	}
}

class ExciterBuffer {
    constructor(length) {
        this.pointer = 0 // last item added
		this.read_pointer = 0 // item to read
        this.buffer = []
		this.length = length
    }

    get() {
		return this.buffer[this.read_pointer] || [];
	}

    pushClone(exciters) {
        let excitersCloned = []
        for (let exciter of exciters) {
			let exciter_copy = {}
			exciter_copy.pos = exciter.pos.copy()
			exciter_copy.vel = exciter.vel.copy()
			exciter_copy.acc = exciter.acc.copy()
			exciter_copy.lifetime = exciter.lifetime
			exciter_copy.show = exciter.show
			exciter_copy.finished = exciter.finished
			exciter_copy.applyForce = exciter.applyForce
			exciter_copy.edges = exciter.edges
			exciter_copy.update = exciter.update
            excitersCloned.push(exciter_copy)
        }
		this.push(excitersCloned)
    }

    push(item){
		this.pointer = this.read_pointer
      	this.buffer[this.pointer] = item;
      	this.pointer = (this.pointer + 1) % this.length;
		this.read_pointer = this.pointer
    }

	incrementTimestep() {
      	this.read_pointer = (this.read_pointer + 1) % this.buffer.length;
	}

	plusplus(val) {
		return (val + 1) % this.buffer.length
	}
	
    show(trailLength=null) { // TODO: finish implementing this
	    // // if (!trailLength) {
	    // // 	trailLength = this.buffer.length / 4
	    // // }
		// //  	return this.buffer.slice((this.pointer - trailLength) % length, this.pointer)
		// noFill();
		// // for(let exciter_frame of this.buffer) {
		// for (let i = this.plusplus(this.pointer); i != this.pointer; i = this.plusplus(i)) {
		// 	let exciter_frame = this.buffer[i]
		// 	beginShape();
		// 	for (let exciter of exciter_frame) {
		// 		// exciter.show(alpha)
		// 		curveVertex(exciter.pos.x, exciter.pos.y);
		// 	}
		// 	endShape();
		// }
		noFill();
		beginShape();
		for (let i = this.plusplus(this.pointer); i != this.pointer; i = this.plusplus(i)) {
			curveVertex(this.buffer[i].pos.x, this.buffer[i].pos.y);
		}
		endShape();
    }
}

class FloorTile {
	constructor(x, y, w, h, note, ch) {
		this.pos = createVector(x, y)
		this.width = w
		this.height = h
		this.fillVal = 200
		this.note = note
		this.prevHit = false
		this.hit = false
		this.channel = ch
		console.log(this.channel)

		if (!MIDI_MODE) {
			this.env = new p5.Envelope()
		
			this.osc = new p5.Oscillator()
			this.osc.setType('triangle')
			// this.osc.start()
			this.osc.freq(midiToFreq(this.note.val + 12))
			this.osc.amp(this.env, 0)
			oscillators.push(this.osc)

			if (reverb)
				reverb.process(this.osc)
		}

		this.playing = false
	}

	onHit(other) {
		let velocity = (other.lifetime / excLifetime)**3 // velocity is between 0 and 1

		this.fillVal = 255 * min(1, sqrt(velocity * 5))

		// console.log(velocity)
		
		if (Math.abs(other.vel.y) > 2) {
			// this.env.setADSR(random(0, 0.2), 0.0, 0.1, 0.5) // RANDOM ATTACK

			if (MIDI_MODE) {
				if (midiOut) {
					// midiOut.channels[1].playNote(this.note.val, {duration: 100, attack: velocity});
					if (!this.prevHit)
						console.log(midiOut.channels)
						console.log(this.channel)
						midiOut.channels[this.channel].sendNoteOn(this.note.val, {attack: velocity});
						this.prevHit = true
				}
			} else {
				this.env.setADSR(0.2 * max(0, 0.9-velocity), 0.0, 0.1, 0.5) // GRADUAL ATTACK SLOWDOWN
				this.env.setRange(velocity, 0)
				// this.env.setRange(0.1, 0)
				this.env.play()
			}
		}
	}

	offHit() {
		if (midiOut && this.prevHit)
			midiOut.channels[this.channel].sendNoteOff(this.note.val);
			this.prevHit = false
	}

	intersects(exciters) {
		this.hit = false
		for (let exciter of exciters) {
			let collision = collideRectCircle(this.pos.x, this.pos.y, this.width, this.height, exciter.pos.x, exciter.pos.y, 10)
			this.hit = this.hit || collision
		}
		// if ((this.pos.y <= other.pos.y + 10) && (this.pos.x <= other.pos.x) && (this.pos.x + this.width >= other.pos.x)) {
		// 	this.hit = true
		// } else {
		// 	this.hit = false
		// }

		if (this.hit) {
			// console.log(this.note)
			this.onHit(exciters[exciters.length-1])
		} else {
			this.offHit()
		}
	}

	updateOnResize() {
		// TODO
	}

	show() {
		// if (this.hit == true) {
		// 	console.log(this.note)
		// } else {
		// 	console.log('Nothing is hit')
		// }
		fill(this.fillVal) //, 10, 100)
		this.fillVal *= 0.8
		noStroke()
		rect(this.pos.x, this.pos.y, this.width, this.height)
		// fill(255 - this.fillVal)
		// textSize(16)
		// textFont((dudler))
		// text(this.note.noteName, this.pos.x + 10, this.pos.y + 26)
		// text('o', this.pos.x + 10, this.pos.y + 26)
	}

}

//   class BrushStroke {
// 	constructor(x, y) {
// 		this.x = x
// 		this.y = y
// 	}

// 	draw() {
// 		noStroke()
// 		fill('white')
// 		stroke('white')
// 		strokeWeight(2)
// 		point(this.x, this.y)
// 	}
// }

function onMidiEnabled() {
  console.log("WebMidi enabled!") 

  // Inputs
  console.log("Inputs:") 
  WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));
  
  // Outputs
  console.log("Outputs:") 
  WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));

//   midiOut = WebMidi.getOutputByName("loopMIDI Port");
  midiOut = WebMidi.getOutputByName("loopMIDI Port");
//   console.log(midiOut.channels)
}
