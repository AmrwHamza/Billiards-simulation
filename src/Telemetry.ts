import Chart from "chart.js/auto";

export class Telemetry {
  private chart!: Chart;
  private time = 0;
  private readonly dt = 1 / 240;
  private readonly maxPoints = 100;

  private canvas!: HTMLCanvasElement;

  constructor() {
    this.createCanvas();
    this.createChart();
  }

  private createCanvas() {
    let canvas = document.getElementById("speedChart") as HTMLCanvasElement | null;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "speedChart";
      document.body.appendChild(canvas);
    }

    // مهم جدًا: إعداد الحجم الحقيقي (NOT CSS فقط)
    canvas.width = 400;
    canvas.height = 200;

    canvas.style.position = "fixed";
    canvas.style.top = "20px";
    canvas.style.left = "20px";
    canvas.style.zIndex = "9999";
    canvas.style.background = "white";
    canvas.style.pointerEvents = "none";

    this.canvas = canvas;
  }

  private createChart() {
    // تأخير بسيط لضمان DOM readiness
    requestAnimationFrame(() => {
      this.chart = new Chart(this.canvas, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Cue Ball Speed",
              data: [],
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: false,
          animation: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Time (s)"
              }
            },
           y: {
  min: 0,
  max: 6,
  title: {
    display: true,
    text: "Speed (m/s)"
  }
}
          }
        }
      });
    });
  }

  update(speed: number) {
    if (!this.chart) return; // حماية قبل التهيئة

    this.time += this.dt;

    this.chart.data.labels!.push(this.time.toFixed(2));
    this.chart.data.datasets[0].data.push(speed);

    if (this.chart.data.labels!.length > this.maxPoints) {
      this.chart.data.labels!.shift();
      this.chart.data.datasets[0].data.shift();
    }

    this.chart.update("none");
  }

  reset() {
    if (!this.chart) return;

    this.time = 0;
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.update();
  }
}