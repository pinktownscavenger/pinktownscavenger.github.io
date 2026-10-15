// Faint ASCII wave field in the background. Overlapping sine waves set each cell's glyph and brightness.
function initWaves(canvas) {
    const context = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const RAMP = ' .·:-=+*#%'; // sparse to dense
    const CELL_WIDTH = 12;
    const CELL_HEIGHT = 18;
    const FONT_SIZE = 13;
    const MAX_ALPHA = 0.16;
    const FRAME_MS = 1000 / 20;

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let lastDraw = 0;

    function resize() {
        const ratio = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        columns = Math.ceil(width / CELL_WIDTH);
        rows = Math.ceil(height / CELL_HEIGHT);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw(performance.now());
    }

    // Returns 0..1 for a cell at time t (seconds)
    function field(column, row, t) {
        const ripple = Math.hypot(column - columns * 0.7, row - rows * 0.3);
        const value = Math.sin(column * 0.07 + t * 0.9)
            + Math.sin(row * 0.13 - t * 0.6)
            + Math.sin((column + row) * 0.045 + t * 0.4)
            + Math.sin(ripple * 0.16 - t * 1.2);

        return (value + 4) / 8;
    }

    function draw(time) {
        const t = time / 1000;

        context.clearRect(0, 0, width, height);
        context.fillStyle = getComputedStyle(canvas).color;
        context.font = `${FONT_SIZE}px ui-monospace, Menlo, monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                // Only crests show; troughs stay empty so the wave bands read clearly
                const level = Math.max(0, (field(column, row, t) - 0.45) / 0.55);
                const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(level * RAMP.length))];

                if (glyph === ' ') {
                    continue;
                }

                context.globalAlpha = MAX_ALPHA * level;
                context.fillText(glyph, (column + 0.5) * CELL_WIDTH, (row + 0.5) * CELL_HEIGHT);
            }
        }

        context.globalAlpha = 1;
    }

    function tick(time) {
        if (time - lastDraw >= FRAME_MS) {
            lastDraw = time;
            draw(time);
        }

        requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();

    // Reduced motion gets a single still frame
    if (!reduceMotion) {
        requestAnimationFrame(tick);
    }
}

initWaves(document.querySelector('.bg-waves'));
