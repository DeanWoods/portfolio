const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
const particleCount = 80;

const mouse = {
    x: null,
    y: null
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
});

// 3D tilt effect for the portrait card
const imageBox = document.querySelector(".image-box");
const tiltLayer = document.querySelector(".image-tilt");
const profileImage = document.querySelector(".profile-image");

if (imageBox && tiltLayer && profileImage) {
    const maxTilt = 18;

    function setTilt(e) {
        const rect = imageBox.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * maxTilt * 2;
        const rotateX = -(y - 0.5) * maxTilt * 2;

        tiltLayer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        profileImage.style.transform = "translateZ(0) scale(1.02)";
    }

    function resetTilt() {
        tiltLayer.style.transform = "rotateX(0deg) rotateY(0deg)";
        profileImage.style.transform = "translateZ(0) scale(1)";
    }

    imageBox.addEventListener("mousemove", setTilt);
    imageBox.addEventListener("mouseleave", resetTilt);
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.45 - 0.225;
        this.speedY = Math.random() * 0.45 - 0.225;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 65 && dist > 0) {
                const force = (65 - dist) / 65;
                this.x += (dx / dist) * force * 2.2;
                this.y += (dy / dist) * force * 2.2;
            }
        }

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const particle of particles) {
        particle.update();
        particle.draw();
    }

    requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
    resizeCanvas();
    init();
});

init();
animate();