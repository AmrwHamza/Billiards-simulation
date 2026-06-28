import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { Ball } from "../Ball.ts";

export class ControlPanel {
  private gui: GUI;
  
  private config = {
    vx: 0.0,
    vy: 0.0,
    applyInitialVelocity: () => this.triggerShot()
  };

  private targetBall: Ball;

  constructor(ball: Ball) {
    this.targetBall = ball;
    this.gui = new GUI({ title: 'لوحة تحكم الفيزياء' });
    this.setupUI();
  }

  private setupUI() {
    const folder = this.gui.addFolder('السرعة الابتدائية للكرة البيضاء');
    
    // ضبط السلايدر ليكون بين -15 و +15 وهي أقصى سرعة اندفاع فيزيائية منطقية بالـ (m/s)
    // الصيغة: .add(object, property, min, max, step)
    folder.add(this.config, 'vx', -15.0, 15.0, 0.1)
          .name('سرعة X (m/s)');
          
    folder.add(this.config, 'vy', -15.0, 15.0, 0.1)
          .name('سرعة Y (m/s)');
    
    // زر التحديث والإطلاق
    folder.add(this.config, 'applyInitialVelocity').name('إطلاق / إعادة تعيين');
    
    folder.open();
  }

  private triggerShot() {
    // تطبيق السرعات الجديدة مباشرة في كود الفيزياء الخاص بك
    this.targetBall.velocity.set(this.config.vx, this.config.vy, 0);
    
    console.log("تم تطبيق السرعة الابتدائية الجديدة:", this.config.vx, this.config.vy);
  }
}