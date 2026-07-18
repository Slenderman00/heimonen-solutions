let hsWorker;

initHsBackground = () => {
    let lcanvas = document.getElementById("canvas");
    lcanvas.height = window.innerHeight * 1.2;
    lcanvas.width = window.innerWidth * 1.2;

    hsWorker = new Worker('backgroundWorker.js');

    let canvas = document.getElementById("canvas").transferControlToOffscreen();

    let canvasRect = document.getElementById("canvas").getBoundingClientRect();
    let scaleX = canvas.width / canvasRect.width;
    let scaleY = canvas.height / canvasRect.height;

    let mouseMove = (e) => {
        const x = (e.clientX - canvasRect.left) * scaleX;
        const y = (e.clientY - canvasRect.top) * scaleY;
        hsWorker.postMessage({mouse: {x: x, y: y}, click: false, canvas: null });
    }

    document.addEventListener("mousemove", mouseMove);

    hsWorker.postMessage({mouse: null, click: false, canvas: canvas }, [canvas]);

    document.addEventListener("click", function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
            hsWorker.postMessage({mouse: null, click: true, canvas: null });
        }
    });

    hsWorker.onmessage = (e) => {
        console.log('Message received from worker');
        console.log(e.data);
    }
}

loadHsBackground = () => {
    initHsBackground();

    window.addEventListener("resize", function() {
        hsWorker.terminate();
        hsWorker = null;

        canvas = document.getElementById("canvas");
        canvas.remove();
        canvas = document.createElement("canvas");
        canvas.id = "canvas";
        document.getElementById("canvas-container").appendChild(canvas);
        initHsBackground();
    });
}

window.onload = loadHsBackground;
