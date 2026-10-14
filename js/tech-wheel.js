// Rotating sphere of tech icons. Names without an entry in TECH_ICON_PATHS are skipped.
function initTechWheel(container, names) {
    const canvas = container.querySelector('.tech-wheel-canvas');
    const context = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const AUTO_SPEED = 0.25; // radians per second around the vertical axis
    const DRAG_SPEED = 0.008; // radians per dragged pixel
    const FRICTION = 0.92;

    // Spread icons evenly over a unit sphere (Fibonacci lattice)
    const iconNames = names.filter(name => TECH_ICON_PATHS[name]);
    const items = iconNames.map((name, index) => {
        const y = 1 - (2 * (index + 0.5)) / iconNames.length;
        const radius = Math.sqrt(1 - y * y);
        const theta = Math.PI * (3 - Math.sqrt(5)) * index;

        return {
            icon: new Path2D(TECH_ICON_PATHS[name]),
            x: Math.cos(theta) * radius,
            y,
            z: Math.sin(theta) * radius
        };
    });

    let size = 0;
    let angleX = -0.3;
    let angleY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let paused = reduceMotion;
    let dragging = null;
    let visible = false;
    let frame = null;
    let lastTime = 0;

    function resize() {
        const ratio = window.devicePixelRatio || 1;
        size = canvas.clientWidth;
        canvas.width = size * ratio;
        canvas.height = size * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw();
    }

    function draw() {
        const color = getComputedStyle(container).color;
        const sphereRadius = size * 0.42;
        const iconSize = Math.max(18, size * 0.085);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const projected = items.map(item => {
            const x1 = item.x * cosY + item.z * sinY;
            const z1 = -item.x * sinY + item.z * cosY;
            const y2 = item.y * cosX - z1 * sinX;
            const z2 = item.y * sinX + z1 * cosX;
            return { item, x: x1, y: y2, depth: (z2 + 1) / 2 };
        }).sort((a, b) => a.depth - b.depth);

        context.clearRect(0, 0, size, size);
        context.fillStyle = color;

        projected.forEach(({ item, x, y, depth }) => {
            const scale = 0.55 + 0.45 * depth;
            const cx = size / 2 + x * sphereRadius;
            const cy = size / 2 + y * sphereRadius;

            const drawn = iconSize * scale;

            context.globalAlpha = 0.12 + 0.88 * depth * depth;
            context.save();
            context.translate(cx - drawn / 2, cy - drawn / 2);
            context.scale(drawn / 24, drawn / 24);
            context.fill(item.icon);
            context.restore();
        });

        context.globalAlpha = 1;
    }

    function tick(time) {
        const seconds = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
        lastTime = time;

        if (!dragging) {
            angleY += (paused ? 0 : AUTO_SPEED * seconds) + velocityY;
            angleX += velocityX;
            velocityX *= FRICTION;
            velocityY *= FRICTION;
        }

        draw();
        frame = visible ? requestAnimationFrame(tick) : null;
    }

    function start() {
        if (frame === null && visible) {
            lastTime = 0;
            frame = requestAnimationFrame(tick);
        }
    }

    canvas.addEventListener('pointerdown', event => {
        dragging = { x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
        canvas.classList.add('is-dragging');
    });

    canvas.addEventListener('pointermove', event => {
        if (!dragging) {
            return;
        }

        velocityY = (event.clientX - dragging.x) * DRAG_SPEED;
        velocityX = -(event.clientY - dragging.y) * DRAG_SPEED;
        angleY += velocityY;
        angleX += velocityX;
        dragging = { x: event.clientX, y: event.clientY };
    });

    function endDrag() {
        dragging = null;
        canvas.classList.remove('is-dragging');
    }

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    // Only animate while the wheel is on screen
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        start();
    }).observe(canvas);

    new ResizeObserver(resize).observe(canvas);
}
