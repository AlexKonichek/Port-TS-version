import * as PIXI from 'pixi.js';
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import { getRandomShipConfig } from "./getRandomShipConfig";
import * as TWEEN from '@tweenjs/tween.js'
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
      static Ticker:PIXI.Ticker;
      static docksState:number[] = [0, 0, 0, 0];
      static docksArray:any
      static currentShipTargetIndex:number;
      static shipInPort:boolean;
      static shipCourseToSea:number;
      static pointBeforeGate:number;
      static queueOfRedShips=[];
      static queueOfGreenShips=[];
      static currentShipTarget;
      static pointBeforeGateRed;
      static pointBeforeGateGreen;

    constructor(parent: HTMLElement, width: number, height: number) {

        this.app = new PIXI.Application({width, height, backgroundColor : 0x5AAFDA});
        parent.replaceChild(this.app.view, parent.lastElementChild); // Hack for parcel HMR
        App.Renderer = this.app.renderer;
        App.Stage = this.app.stage;
        App.Ticker = this.app.ticker
        

        App.Init();
        this.app.ticker.add(delta => {
            App.Play(delta);
        })
    }

    static Init() {
        App.AddGates()
        App.AddDocks(2,110)
        
        App.docksArray = (App.Stage.children[1])
        App.RenderShip()
        setInterval(() => { App.RenderShip() }, 8000);
        App.Ticker.add((delta) => this.GameLoop(delta));
      }

    static RenderShip() {
        
        const {color, fill, posY, posX} = getRandomShipConfig();
        
        const ship = App.AddShip(posX, posY, color, fill);
        if (color === '0xFF0000') {
            ship.filters = [new ColorOverlayFilter(0xFF0000)];
        }
        
    
        // logic, which depends on ship's type
        if (color === '0xFF0000') {
          // red ship
          console.log('red')
          this.currentShipTargetIndex = this.docksState.findIndex((loadValue) => loadValue === 0);
          
          if ((this.queueOfRedShips.length) || (this.currentShipTargetIndex === -1) || (this.shipInPort)) {
            
            this.queueOfRedShips.push(ship);
            
            App.MoveInQueue(ship, color);
          } else {
            this.shipCourseToSea = 190;
            App.EnterThePort(ship, color, this.docksArray.children[this.currentShipTargetIndex]);
          }
        } else {
          // green ship
          console.log('green')
          this.currentShipTargetIndex = this.docksState.findIndex((loadValue) => loadValue === 1);
          console.log(this.currentShipTargetIndex)
          if ((this.queueOfGreenShips.length) || (this.currentShipTargetIndex === -1) || (this.shipInPort)) {
            this.queueOfGreenShips.push(ship);
            App.MoveInQueue(ship, color);
            this.pointBeforeGate = (this.queueOfGreenShips.length + 2) * 100;
          } else {
            
            this.currentShipTarget = this.docksArray.children[this.currentShipTargetIndex];
            this.docksArray[this.currentShipTargetIndex]
            
            App.EnterThePort(ship, color, this.docksArray.children[this.currentShipTargetIndex]);
            this.shipCourseToSea = 290;
          }
        }
    
        App.Stage.addChild(ship);
      }

      static EnterThePort(ship, shipType, target) {
        console.log(`enter the port:${ship}, ${shipType}, ${target}`)
        this.shipInPort = true;
        this.currentShipTarget = target;
        
    
        const handleShipInDock = (shipType) => {
          if (shipType === "0x1F8A0A") {
              console.log('handle green ship')
              console.log(this.currentShipTargetIndex)

            ship.filters = [new ColorOverlayFilter(0x1F8A0A)];
            this.docksState[this.currentShipTargetIndex] = 0;
            this.shipCourseToSea = 190;
          }
          if (shipType === "0xFF0000") {
            ship.filters = null;
            this.docksState[this.currentShipTargetIndex] = 1;
            this.shipCourseToSea = 290;
          }
        };
    
        // define tweens
    
        const passGate = new TWEEN.Tween(ship).to({ x: 150 }, 2000);
        const inFrontOfDock = new TWEEN.Tween(ship).to({ y: this.currentShipTarget.y + 40 }, 500);
        const moorShip = new TWEEN.Tween(ship).to({ x: this.currentShipTarget.x + 45 }, 750);
        const unmooreShip = new TWEEN.Tween(ship).to({ x: 150 }, 750).delay(1500);
        const setCourseY = new TWEEN.Tween(ship).to({ y: this.shipCourseToSea }, 500);
        const moveToSea = new TWEEN.Tween(ship).to({ x: 1000 }, 3000)
          .easing(TWEEN.Easing.Sinusoidal.In);
    
        // play tween
        passGate.onComplete(() => {
          this.shipInPort = true;
          inFrontOfDock.onComplete(() => moorShip.onComplete(() => {
            setTimeout(() => handleShipInDock(shipType), 750);
            unmooreShip.onComplete(() => setCourseY.onComplete(() => {
              this.shipInPort = false;
              App.HandleShipsQueue();
              moveToSea.start();
            })
              .start())
              .start();
          })
            .start())
            .start();
        })
          .start();
      }
    
      static MoveInQueue(ship, shipType) {
        // ships with different type has a different queue
        if ((shipType === "0xFF0000") && (this.queueOfRedShips.length)) {
          this.pointBeforeGateRed = (this.queueOfRedShips.length + 2) * 100;
          new TWEEN.Tween(ship).to({ x: this.pointBeforeGateRed }, 1000).start();
          
          // green ship type
        }
        if ((shipType === "0x1F8A0A") && (this.queueOfGreenShips.length)) {
          this.pointBeforeGateGreen = (this.queueOfGreenShips.length + 2) * 100;
          new TWEEN.Tween(ship).to({ x: this.pointBeforeGateGreen }, 1000).start();
        }
        
      }
    
      static HandleShipsQueue() {
        if (this.queueOfGreenShips.length) {
            
          const index = this.docksState.findIndex((value) => value === 1);
          if (index !== -1 && this.shipInPort === false) {
             console.log(index, this.shipInPort)
            App.EnterThePort(this.queueOfGreenShips[0], "0x1F8A0A", this.docksArray.children[index]);
            this.queueOfGreenShips.shift();
            App.MoveShipsInQueue(this.queueOfGreenShips);
          }
        }
        if (this.queueOfRedShips.length) {
          const index = this.docksState.findIndex((value) => value === 0);
          if (index !== -1 && this.shipInPort === false) {
            
            App.EnterThePort(this.queueOfRedShips[0], colors.red, this.docksArray.children[index]);
            this.queueOfRedShips.shift();
            App.MoveShipsInQueue(this.queueOfRedShips);
          }
        }
      }
    
       static MoveShipsInQueue(shipsInQueue) {
        let beforeGates = 300;
        for (let i = 0; i < shipsInQueue.length; i++) {
          const moveShipsInQuee = new TWEEN.Tween(shipsInQueue[i]).to({ x: beforeGates }, 2000);
          beforeGates += 100;
          moveShipsInQuee.start();
        }
      }

    static RenderRect(color:number, fill:number, width:number, heigth:number, border:number){
        const rect = new PIXI.Graphics();
        rect.lineStyle(border, color, 1);
        rect.beginFill(fill);
        rect.drawRect(0, 0, width, heigth);
        rect.endFill();
        return rect;
    }

    static AddShip(posX, posY, color, fill) {
        const graphics = App.RenderRect(color, fill, 80, 30, 3);
        const texture = App.Renderer.generateTexture(graphics,1,1);
        const ship = new PIXI.Sprite(texture);
        ship.x = posX;
        ship.y = posY;
        App.Stage.addChild(ship);
        return ship;

      }

      static AddGates() {
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
            const graphics = App.RenderRect(colors.yellow, colors.blue, 40, 110, 3);
            const texture = App.Renderer.generateTexture(graphics,1,1)
            const dock = new PIXI.Sprite(texture);
            dock.x = border;
            dock.y = i * spacer + 1;
            containerDocks.addChild(dock);
            this.docksArray = containerDocks
            
        }
    }

    static GameLoop(delta:number){
        this.Play(delta);
        TWEEN.update();
        App.Renderer.render(App.Stage);
    }
    static Play(delta: number) {
        this.docksState.forEach((loadValue, i) => {
            if (loadValue === 1) {
                App.docksArray.children[i].filters = [new ColorOverlayFilter(colors.yellow)];
            } else {
                App.docksArray.children[i].filters = null;
            }
          });
      }
  


    

}
