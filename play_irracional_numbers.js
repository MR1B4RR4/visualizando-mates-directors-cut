class Visualizer {
    constructor(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.options = options;
        this.digitsIndex = 0;
        this.piDigits = this.options.piDigits;
        this.lastAnimationFrameTime = 0;
        this.animationSpeed = 150;
        this.sounds = {};
        this.loadSounds();
        this.animationFrameId = null;
    }

    clearCanvas() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getCoord(val, radius) {
        const theta = 2 * Math.PI * 0.1 * val;
        return {
            x: radius * Math.sin(theta) + this.canvas.width / 2,
            y: -radius * Math.cos(theta) + this.canvas.height / 2,
        };
    }

    drawBackground() {
        this.clearCanvas();
        
        let radius = this.options.radius;
        if (this.options.showDots) radius += 20;
        if (this.options.showBars) radius += 5;

        const colors = this.options.colors;
        this.ctx.lineWidth = 2;
        this.ctx.font = "16px Arial";

        for (let i = 0; i < 10; i++) {
            const from = this.getCoord(i, radius);
            const to = this.getCoord(i + 1, radius);
        
            // Calcula la dirección del segmento
            const dx = from.x - to.x;
            const dy = from.y - to.y;
        
            // Calcula el vector perpendicular (normal)
            const nx = -dy;
            const ny = dx;
        
            // Normaliza el vector para que tenga una longitud específica
            // La longitud determinará qué tan lejos está el punto de control del centro,
            // ajusta esto según sea necesario para hacer que la curva parezca un círculo
            const length = Math.sqrt(nx * nx + ny * ny);
            const controlLength = 20; // Ajusta este valor para controlar la curvatura
            const controlX = (from.x + to.x) / 2 + (nx / length) * controlLength;
            const controlY = (from.y + to.y) / 2 + (ny / length) * controlLength;
        
            this.ctx.beginPath();
            this.ctx.strokeStyle = colors[i % colors.length];
            this.ctx.moveTo(from.x, from.y);
            this.ctx.quadraticCurveTo(controlX, controlY, to.x, to.y);
            this.ctx.stroke();

            // Llamar a la función drawLabel para dibujar las etiquetas
            this.drawLabel(i, radius);
        }

        // Center text
        this.ctx.fillStyle = "white";
        this.ctx.font = "60px Times new roman";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.options.centerText, this.canvas.width / 2, this.canvas.height / 2);
    }

    drawLabel(i, radius) {
        const midTheta = 2 * Math.PI * 0.1 * i + 0.1 * Math.PI / 2;
        const mid = this.getCoord(i + 0.5, radius + (this.options.showBars ? 17 : 15));
        this.ctx.save();
        this.ctx.translate(mid.x, mid.y);
        this.ctx.fillStyle = "white"; 
        this.ctx.font = "20px Times new roman";
        this.ctx.fillText(i.toString(), 0, 0);
        this.ctx.restore();
    }

    loadSounds() {
        const baseURL = 'https://github.com/MR1B4RR4/visualizando-mates-directors-cut/blob/main/';
    
        for (let i = 0; i <= 9; i++) {
            const soundURL = `${i}.ogg`
            const sound = new Audio(soundURL);
            this.sounds[i] = sound;
        }
    }

    playSoundForDigit(digit) {
        if (this.sounds[digit]) {
            this.sounds[digit].currentTime = 0; // Reiniciar el sonido si ya estaba reproduciéndose
            this.sounds[digit].play();
        }
    }

    resetAnimation() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);  // Cancelar cualquier animación en curso
        }
        this.digitsIndex = 0;
        this.lastAnimationFrameTime = 0;
        this.clearCanvas();
        this.drawBackground();
        this.animationFrameId = requestAnimationFrame(this.animatePiDigits.bind(this));  // Iniciar la animación
    }

    setupAnimationStart() {
        const button = document.getElementById('playButton');
        button.addEventListener('click', () => {
            this.resetAnimation();  // Resetear y empezar la animación sin verificar running
        });
    }

    animatePiDigits(timestamp) {
        // Verificar si se han procesado todos los dígitos de Pi
        if (this.digitsIndex >= this.piDigits.length - 1) {
            cancelAnimationFrame(this.animationFrameId);  // Cancelar la animación actual
            this.animationFrameId = null;  // Reiniciar el ID de frame
            return;  // Detener la animación
        }
    
        // Comprobar si ha pasado suficiente tiempo desde la última animación
        if (timestamp - this.lastAnimationFrameTime > this.animationSpeed) {
            this.lastAnimationFrameTime = timestamp;  // Actualizar el tiempo de la última animación
            
            let radius = this.options.radius;
            if (this.options.showDots) radius += 20;
            if (this.options.showBars) radius += 5;
    
            const colors = this.options.colors;
    
            // Obtener los puntos basados en los dígitos de Pi
            const fromDigit = parseInt(this.piDigits[this.digitsIndex]);
            const toDigit = parseInt(this.piDigits[this.digitsIndex + 1]);
    
            const from = this.getCoord(fromDigit, radius);
            const to = this.getCoord(toDigit, radius);
    
            // Dibujar la línea
            this.ctx.beginPath();
            this.ctx.strokeStyle = colors[(this.digitsIndex % colors.length)];
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
            
            // Reproduce el sonido
            this.playSoundForDigit(toDigit);
    
            this.digitsIndex++;  // Mover al siguiente par de dígitos
        }
    
        // Solicitar el siguiente frame de la animación
        this.animationFrameId = requestAnimationFrame(this.animatePiDigits.bind(this));
    }
    
}

// Usage remains the same
const visualizer = new Visualizer('myCanvas', {
    radius: 200,
    showDots: true,
    showBars: true,
    colors: ["red", "green", "blue", "yellow", "cyan", "magenta", "white"], // Example color array
    centerText: "π",
    piDigits: "314159265358979323846264338327950288419716939937510"
});

visualizer.drawBackground();
visualizer.setupAnimationStart(); // Configurar el inicio de la animación con el botón

// requestAnimationFrame(visualizer.animatePiDigits.bind(visualizer)); // Iniciar la animación
