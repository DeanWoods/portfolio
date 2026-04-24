const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");

let particles = [];
const particleCount = 60;

const mouse = {
    x: null,
    y: null
};

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

if (canvas) {
    resizeCanvas();

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.35 - 0.175;
            this.speedY = Math.random() * 0.35 - 0.175;
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
                    this.x += (dx / dist) * force * 1.9;
                    this.y += (dy / dist) * force * 1.9;
                }
            }

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.fillStyle = "rgba(255,255,255,0.55)";
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

    // Keep these commented out for now on the programming page.
    //init();
    //animate();
}


/* ------------------------------------------------------------------ */
/* Hover-play videos + thumbnail-backed hover videos + click-to-enlarge */
/* ------------------------------------------------------------------ */

let mediaViewerOverlay = null;
let mediaViewerContent = null;
let mediaViewerCloseBtn = null;

let activeSourceVideo = null;
let activeSourceWasPlaying = false;
let activeSourceStartTime = 0;

function ensureMediaViewer() {
    if (mediaViewerOverlay) return;

    mediaViewerOverlay = document.createElement("div");
    mediaViewerOverlay.className = "media-viewer-overlay";
    mediaViewerOverlay.style.position = "fixed";
    mediaViewerOverlay.style.inset = "0";
    mediaViewerOverlay.style.display = "none";
    mediaViewerOverlay.style.alignItems = "center";
    mediaViewerOverlay.style.justifyContent = "center";
    mediaViewerOverlay.style.background = "rgba(0, 0, 0, 0.78)";
    mediaViewerOverlay.style.zIndex = "100";

    const card = document.createElement("div");
    card.style.position = "relative";
    card.style.width = "min(92vw, 1200px)";
    card.style.height = "min(88vh, 800px)";
    card.style.background = "rgba(10, 10, 10, 0.96)";
    card.style.borderRadius = "18px";
    card.style.boxShadow = "0 18px 60px rgba(0, 0, 0, 0.45)";
    card.style.overflow = "hidden";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifyContent = "center";
    card.style.padding = "18px";

    mediaViewerCloseBtn = document.createElement("button");
    mediaViewerCloseBtn.type = "button";
    mediaViewerCloseBtn.innerHTML = "&times;";
    mediaViewerCloseBtn.setAttribute("aria-label", "Close media viewer");
    mediaViewerCloseBtn.style.position = "absolute";
    mediaViewerCloseBtn.style.top = "10px";
    mediaViewerCloseBtn.style.right = "16px";
    mediaViewerCloseBtn.style.border = "none";
    mediaViewerCloseBtn.style.background = "transparent";
    mediaViewerCloseBtn.style.color = "white";
    mediaViewerCloseBtn.style.fontSize = "38px";
    mediaViewerCloseBtn.style.cursor = "pointer";
    mediaViewerCloseBtn.style.lineHeight = "1";
    mediaViewerCloseBtn.style.zIndex = "2";

    mediaViewerContent = document.createElement("div");
    mediaViewerContent.style.width = "100%";
    mediaViewerContent.style.height = "100%";
    mediaViewerContent.style.display = "flex";
    mediaViewerContent.style.alignItems = "center";
    mediaViewerContent.style.justifyContent = "center";
    mediaViewerContent.style.overflow = "hidden";

    card.appendChild(mediaViewerCloseBtn);
    card.appendChild(mediaViewerContent);
    mediaViewerOverlay.appendChild(card);
    document.body.appendChild(mediaViewerOverlay);

    mediaViewerOverlay.addEventListener("click", (e) => {
        if (e.target === mediaViewerOverlay) closeMediaViewer();
    });

    mediaViewerCloseBtn.addEventListener("click", closeMediaViewer);
}

function closeMediaViewer() {
    if (!mediaViewerOverlay || !mediaViewerContent) return;

    const viewerVideo = mediaViewerContent.querySelector("video");

    if (activeSourceVideo && viewerVideo) {
        const currentTime = Number.isFinite(viewerVideo.currentTime) ? viewerVideo.currentTime : activeSourceStartTime;

        try {
            activeSourceVideo.currentTime = currentTime;
        } catch {
            // Ignore seek errors if metadata is not ready.
        }

        const sourceWrapper = activeSourceVideo.closest(".media-hover");

        if (sourceWrapper) {
            if (sourceWrapper.matches(":hover")) {
                sourceWrapper.classList.add("playing");
                if (activeSourceWasPlaying) {
                    activeSourceVideo.play().catch(() => { });
                }
            } else {
                sourceWrapper.classList.remove("playing");
                activeSourceVideo.pause();
            }
        } else if (activeSourceWasPlaying) {
            activeSourceVideo.play().catch(() => { });
        } else {
            activeSourceVideo.pause();
        }
    }

    activeSourceVideo = null;
    activeSourceWasPlaying = false;
    activeSourceStartTime = 0;

    mediaViewerOverlay.style.display = "none";
    mediaViewerContent.innerHTML = "";
}

function openMediaViewer(sourceEl) {
    ensureMediaViewer();

    mediaViewerContent.innerHTML = "";

    const tag = sourceEl.tagName.toLowerCase();

    if (tag === "video") {
        activeSourceVideo = sourceEl;
        activeSourceWasPlaying = !sourceEl.paused && !sourceEl.ended;
        activeSourceStartTime = sourceEl.currentTime || 0;

        sourceEl.pause();

        const video = document.createElement("video");
        const src = sourceEl.currentSrc || sourceEl.getAttribute("src");

        if (src) {
            video.src = src;
        }

        video.controls = true;
        video.autoplay = false;
        video.muted = true;
        video.loop = sourceEl.loop;
        video.playsInline = true;
        video.preload = "metadata";
        video.style.maxWidth = "100%";
        video.style.maxHeight = "100%";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "contain";
        video.style.display = "block";

        mediaViewerContent.appendChild(video);
        mediaViewerOverlay.style.display = "flex";

        video.addEventListener("loadedmetadata", () => {
            try {
                video.currentTime = activeSourceStartTime;
            } catch {
                // Ignore seek errors if the browser refuses the seek.
            }

            video.play().catch(() => { });
        }, { once: true });

        video.load();
        return;
    }

    if (tag === "img") {
        const img = document.createElement("img");
        img.src = sourceEl.currentSrc || sourceEl.src;
        img.alt = sourceEl.alt || "";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.display = "block";

        mediaViewerContent.appendChild(img);
        mediaViewerOverlay.style.display = "flex";
    }
}

function pauseAllVideos(exceptVideo = null) {
    document.querySelectorAll("video").forEach((video) => {
        if (video !== exceptVideo) {
            video.pause();
        }
    });
}

function bindHoverPlayback(video) {
    if (video.dataset.hoverBound === "true") return;
    video.dataset.hoverBound = "true";
    video.style.cursor = "zoom-in";

    video.addEventListener("mouseenter", () => {
        pauseAllVideos(video);
        video.play().catch(() => { });
    });

    video.addEventListener("mouseleave", () => {
        video.pause();
    });

    video.addEventListener("click", (e) => {
        e.stopPropagation();
        openMediaViewer(video);
    });
}

function bindHoverThumbnailWrapper(wrapper) {
    if (wrapper.dataset.hoverBound === "true") return;
    wrapper.dataset.hoverBound = "true";
    wrapper.style.cursor = "zoom-in";

    const video = wrapper.querySelector("video");
    if (!video) return;

    wrapper.addEventListener("mouseenter", () => {
        wrapper.classList.add("playing");
        pauseAllVideos(video);
        video.play().catch(() => { });
    });

    wrapper.addEventListener("mouseleave", () => {
        video.pause();
        wrapper.classList.remove("playing");
    });

    wrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        openMediaViewer(video);
    });
}

function bindMediaViewer(el) {
    if (el.dataset.viewerBound === "true") return;
    el.dataset.viewerBound = "true";
    el.style.cursor = "zoom-in";

    el.addEventListener("click", (e) => {
        e.stopPropagation();

        if (el.tagName.toLowerCase() === "video") {
            el.pause();
        }

        openMediaViewer(el);
    });
}

function bindInteractiveMedia(root = document) {
    root.querySelectorAll(".media-hover").forEach(bindHoverThumbnailWrapper);

    root.querySelectorAll("video").forEach((video) => {
        if (video.closest(".media-hover")) return;
        bindHoverPlayback(video);
    });

    root.querySelectorAll("img").forEach((img) => {
        if (img.closest(".media-hover")) return;
        bindMediaViewer(img);
    });
}

bindInteractiveMedia(document);