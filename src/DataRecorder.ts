export class DataRecorder {
  private data: { t: number; v: number; w: number }[] = [];
  private time = 0;

  record(dt: number, v: number, w: number) {
    this.time += dt;

    this.data.push({
      t: this.time,
      v,
      w,
    });
  }

  download() {
    let csv = "time,linearSpeed,angularSpeed\n";

    for (const d of this.data) {
      csv += `${d.t},${d.v},${d.w}\n`;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "experiment.csv";
    a.click();

    URL.revokeObjectURL(url);
  }
}