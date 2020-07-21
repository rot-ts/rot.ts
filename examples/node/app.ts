import { DisplayOptions, Display } from "../../src/display";

class App {
    static main (){
        const width:number = 11;
        const height:number = 5;

        const o: Partial<DisplayOptions> = {
            width: width,
            height: height,
            layout: "term"
        }
        
        let d = new Display(o);
        
        for (let i=0; i<width; i++) {
            for (let j=0; j<height; j++) {
                if (!i || !j || i+1 == o.width || j+1 == o.height) {
                    d.draw(i, j, "#", "gray");
                } else {
                    d.draw(i, j, ".", "#666");
                }
            }
        }
        d.draw(width >> 1, height >> 1, "@", "goldenrod");
    }
}
App.main();