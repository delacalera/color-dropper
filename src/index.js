class Magnifier {
	constructor(container) {
		this.canvas = document.createElement("canvas");
		container.appendChild(this.canvas);
		this.context = this.canvas.getContext("2d");


		const fps = 60;//60
		this.fpsInterval = 1000 / fps;
		this.then = Date.now();
		
		this.point = { x: 0, y: 0 };
    this.distPoint = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };

		this.resize();
		this.bind();


		this.image = new Image();
    this.image.onload = () => {
      this.loop();
		};
    this.image.src = "../assets/1920x1080-4598441-beach-water-pier-tropical-sky-sea-clouds-island-palm-trees.jpg";


	}

	bind() {
		window.addEventListener("resize", this.resize.bind(this), false);
		
		this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
		
		this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));

	}

	render() {
		this.clear();
		// this.context.save()
		  this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
		
		this.pos.x += (this.point.x - this.pos.x) * 0.2;
    this.pos.y += (this.point.y - this.pos.y) * 0.2;

    this.context.save();
    this.context.beginPath();
    this.context.arc(this.pos.x, this.pos.y, this.canvas.height * 0.15, 0, Math.PI * 2, true);
    this.context.strokeStyle = "white";
    this.context.lineWidth = 6;
    // this.context.globalCompositeOperation = "screen";
    this.context.stroke();
    this.context.closePath();
    this.context.clip();
		
		this.context.drawImage(
      this.image,
      -this.canvas.width * 0.2 +
        (this.canvas.width - this.canvas.width * 1.4) * (this.distPoint.x * 1), //0.05,
      -this.canvas.height * 0.2 +
        (this.canvas.height - this.canvas.height * 1.4) * (this.distPoint.y * 1), //0.05,
      this.canvas.width * 1.4,
      this.canvas.height * 1.4
    );
    // this.context.opacity = 1;
    const bb = this.canvas.getBoundingClientRect();
    const x = Math.floor((this.point.x - bb.left) / bb.width * this.canvas.width);
    const y = Math.floor((this.point.y - bb.top) / bb.height * this.canvas.height);
    console.log('point x:' + this.point.x + ' y:' + this.point.y)
    console.log('pos x:' + this.pos.x + ' y:' + this.pos.y)
    console.log('x:' + x + ' y:' + y)
    const [ r, g, b, a ] = this.context.getImageData( this.pos.x, this.pos.y, 1, 1 ).data;
    const color =  `rgb(${r},${g},${b})`;
    console.log({ color, r, g, b, a });
    const hex = rgbToHex(r, g, b, a);

    document.body.style.background = hex;
    dataDialog.innerText = hex;
    this.context.restore();

	}

	loop() {
    this.raf = window.requestAnimationFrame(this.loop.bind(this));

		const now = Date.now();
		const delta = now - this.then;

		if (delta > this.fpsInterval) {
			// this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height )
			this.render();
			this.then = now;
		}
	}
	
finishMove(ev){
  this.distPoint = {
    x: (this.point.x - this.canvas.width * 0.5) / this.canvas.width,
    y: (this.point.y - this.canvas.height * 0.5) / this.canvas.height
  };	
}
  
	onMouseMove(ev){
		var rect = this.canvas.getBoundingClientRect();
		this.point = {
      x:
        (ev.clientX) - rect.left,
      y: (ev.clientY) - rect.top
    };
this.finishMove(ev);
    
	}
	
	onTouchMove(ev){
		var rect = this.canvas.getBoundingClientRect();
		this.point = {
      x:
        ev.touches[0].clientX - rect.left,
      y: ev.touches[0].clientY - rect.top
    };

    this.finishMove(ev);
	}

	resize() {
		this.canvas.width = window.innerWidth * 0.7;
		this.canvas.height = window.innerWidth * 0.7 / 1.77;
		this.screen = {
			center: { x: this.canvas.width / 2, y: this.canvas.height / 2 }
		};

		//this.reset();
	}
	
	clear(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	reset() {
		window.cancelAnimationFrame(this.raf);
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.loop();
	}
}
const dataDialog = document.getElementById('data');
const experience = new Magnifier(document.body);









// //Get color in hex
function rgbToHex(r, g, b, a) {
  if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
  hex = 
  (r | 1 << 8).toString(16).slice(1) +
  (g | 1 << 8).toString(16).slice(1) +
  (b | 1 << 8).toString(16).slice(1);
  return `#${hex}`;
}