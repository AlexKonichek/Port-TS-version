import * as PIXI from 'pixi.js';
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import { getRandomShipConfig } from "./getRandomShipConfig";

enum colors {
    red = 0xFF0000,
    green = 0x1F8A0A,
    blue = 0x5AAFDA,
    yellow = 0xFFFF32,
    black = 0x000000,
    white = 0xFFFFFF,
}

export class App {

    private app: PIXI.Application;
    static ScoreText: PIXI.Text = new PIXI.Text("Score: ", {
        fontSize: 5,
        fill: "#aaff",
        align: "center",
        stroke: "#aaaaaa",
        strokeThickness: 0
      });

      static Stage: PIXI.Container;
      static Renderer: PIXI.Renderer;
      

    constructor(parent: HTMLElement, width: number, height: number) {

        this.app = new PIXI.Application({width, height, backgroundColor : 0x5AAFDA});
        parent.replaceChild(this.app.view, parent.lastElementChild); // Hack for parcel HMR
        console.log('App render', );
        App.Renderer = this.app.renderer;
        App.Stage = this.app.stage;
        

        App.Init();
        this.app.ticker.add(delta => {
            App.Play(delta);
        })
    }

    static Init() {
        App.AddGates()
        App.AddDocks(2,110)
       
      }

    static Play(delta: number) {
          
      }
    static AddGates() {
        console.log('addgates')
        let gatesContainer = new PIXI.Container();
        let gateTop = new PIXI.Graphics();
        gateTop.lineStyle(10, colors.yellow, 1);
        gateTop.position.set(250, 0);
        gateTop.moveTo(10, 0);
        gateTop.lineTo(10, App.Renderer.height/2 -100 );

        let gateBottom = new PIXI.Graphics();
        gateBottom.lineStyle(10, colors.yellow, 1);
        gateBottom.position.set(250, 0);
        gateBottom.moveTo(10, App.Renderer.height);
        gateBottom.lineTo(10, App.Renderer.height / 2 + 100);

        gatesContainer.addChild(gateTop);
        gatesContainer.addChild(gateBottom);
        App.Stage.addChild(gatesContainer);
    }

    static AddDocks(border:number, heigth:number) {
         let containerDocks = new PIXI.Container();
         App.Stage.addChild(containerDocks);
         
         let spacer = heigth + 5;

        for (let i = 0; i < 4; i++) {
            const graphics = this.renderRect(colors.yellow, colors.blue, 40, 110, 3);
            const texture = App.Renderer.generateTexture(graphics,1,1)
            const dock = new PIXI.Sprite(texture);
            dock.x = border;
            dock.y = i * spacer + 1;
            containerDocks.addChild(dock);
        }
    }
    static renderRect(color:number, fill:number, width:number, heigth:number, border:number){
        const rect = new PIXI.Graphics();
        rect.lineStyle(border, color, 1);
        rect.beginFill(fill);
        rect.drawRect(0, 0, width, heigth);
        rect.endFill();
        return rect;
    }



    

}
