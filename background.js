let worker;
let canvasRect;
let scaleX;
let scaleY;

let pendingMouse = null;
let mouseMoveScheduled = false;

let flushMouseMove = () => {
    mouseMoveScheduled = false;
    if (pendingMouse) {
        worker.postMessage({mouse: pendingMouse, click: false, canvas: null });
        pendingMouse = null;
    }
}

let mouseMove = (e) => {
    const x = (e.clientX - canvasRect.left) * scaleX;
    const y = (e.clientY - canvasRect.top) * scaleY;
    pendingMouse = {x: x, y: y};
    if (!mouseMoveScheduled) {
        mouseMoveScheduled = true;
        requestAnimationFrame(flushMouseMove);
    }
}

initBackground = () => {
        // set canvas height and width
        let lcanvas = document.getElementById("canvas");
        lcanvas.height = window.innerHeight * 1.2;
        lcanvas.width = window.innerWidth * 1.2;

        worker = new Worker('backgroundWorker.js');

        let canvas = document.getElementById("canvas").transferControlToOffscreen();

        //data for mousemove
        canvasRect = document.getElementById("canvas").getBoundingClientRect();
        scaleX = canvas.width / canvasRect.width;
        scaleY = canvas.height / canvasRect.height;

        // canvas is destroyed and recreated on resize, so its listeners must be
        // re-attached to the new element each time (no leak: the old element and
        // its listeners are discarded together)
        document.getElementById("canvas").addEventListener("mousemove", mouseMove);

        //send message to worker
        worker.postMessage({mouse: null, click: false, canvas: canvas }, [canvas]);

        document.getElementById("canvas").addEventListener("click", function(e) {
            if (e.target.tagName !== 'BUTTON') {
                worker.postMessage({mouse: null, click: true, canvas: null });
            }
        });

        worker.onmessage = (e) => {
            console.log('Message received from worker');
            console.log(e.data);
        }
}

loadBackground = () => {
    // card and .center persist across resize, so these are registered once here
    // rather than inside initBackground() (which reruns on every resize)
    card = document.getElementsByClassName("card")[0];
    card.addEventListener("mousemove", mouseMove);

    document.getElementsByClassName("center")[0].addEventListener("click", function(e) {
        if (e.target.tagName !== 'BUTTON') {
            worker.postMessage({mouse: null, click: true, canvas: null });
        }
    });

    initBackground();

    //This does not work as the window is resized when scrolling on a mobile device
    //on window resize
    window.addEventListener("resize", function() {
        //destroy worker
        worker.terminate();
        worker = null;

        //destroy canvas
        canvas = document.getElementById("canvas");
        canvas.remove();
        canvas = document.createElement("canvas");
        canvas.id = "canvas";
        document.getElementById("canvas-container").appendChild(canvas);
        initBackground();
    });
}

