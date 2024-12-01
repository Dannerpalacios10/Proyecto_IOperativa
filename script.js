
const VALOR_MAXIMO = Infinity;
let nodePositions = [];
let draggingNode = null;
let grafo = [];
let nombres = [];

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

function parseGraph(input) {
    return input.trim().split("\n").map(row => row.split(" ").map(Number));
}

function calculateNodePositions(n) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 100;
    nodePositions = [];

    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions.push({ x, y });
    }
}

function drawGraph(camino = [], visitados = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const n = grafo.length;

    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 2;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (grafo[i][j] > 0) {
                const x1 = nodePositions[i].x;
                const y1 = nodePositions[i].y;
                const x2 = nodePositions[j].x;
                const y2 = nodePositions[j].y;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                ctx.font = "14px Arial";
                ctx.fillStyle = "#333";
                ctx.fillText(grafo[i][j], midX + 10, midY - 10);
            }
        }
    }

    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(nodePositions[i].x, nodePositions[i].y, 40, 0, 2 * Math.PI);
        const fillColor = visitados.includes(i) ? "#ff6347" : (camino.includes(i) ? "#ffd700" : "#ffffff");
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nombres[i], nodePositions[i].x, nodePositions[i].y);
    }
}

function drawInitialGraph() {
    const inputGrafo = document.getElementById("graph-data").value;
    nombres = document.getElementById("node-names").value.split(",");
    grafo = parseGraph(inputGrafo);
    calculateNodePositions(grafo.length);
    drawGraph();
}

function findShortestPath() {
    const nodoInicio = parseInt(document.getElementById("start-node").value, 10);
    const nodoFin = parseInt(document.getElementById("end-node").value, 10);
    const resultado = dijkstra(nodoInicio, nodoFin);

    if (resultado.camino === null) {
        document.getElementById("output").innerHTML = `No hay camino entre ${nombres[nodoInicio]} y ${nombres[nodoFin]}.`;
    } else {
        document.getElementById("output").innerHTML = `
            <p><strong>Distancia más corta:</strong> ${resultado.distancia}</p>
            <p><strong>Camino:</strong> ${resultado.camino.map(i => nombres[i]).join(" → ")}</p>`;
    }

    drawGraph(resultado.camino);
}

function dijkstra(inicio, fin) {
    const n = grafo.length;
    const dist = Array(n).fill(VALOR_MAXIMO);
    const prev = Array(n).fill(null);
    const visitado = Array(n).fill(false);
    dist[inicio] = 0;

    for (let i = 0; i < n - 1; i++) {
        let u = -1;
        for (let j = 0; j < n; j++) {
            if (!visitado[j] && (u === -1 || dist[j] < dist[u])) u = j;
        }

        if (dist[u] === VALOR_MAXIMO) break;
        visitado[u] = true;

        for (let v = 0; v < n; v++) {
            if (grafo[u][v] > 0 && !visitado[v]) {
                const nuevaDist = dist[u] + grafo[u][v];
                if (nuevaDist < dist[v]) {
                    dist[v] = nuevaDist;
                    prev[v] = u;
                }
            }
        }
    }

    const camino = [];
    for (let at = fin; at !== null; at = prev[at]) camino.push(at);
    camino.reverse();

    if (camino[0] !== inicio) return { distancia: VALOR_MAXIMO, camino: null };
    return { distancia: dist[fin], camino };
}

canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < nodePositions.length; i++) {
        const { x, y } = nodePositions[i];
        const dx = mouseX - x;
        const dy = mouseY - y;
        if (Math.sqrt(dx * dx + dy * dy) < 40) {
            draggingNode = i;
            break;
        }
    }
});

canvas.addEventListener("mousemove", e => {
    if (draggingNode !== null) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        nodePositions[draggingNode] = { x: mouseX, y: mouseY };
        drawGraph();
    }
});

canvas.addEventListener("mouseup", () => {
    draggingNode = null;
});
