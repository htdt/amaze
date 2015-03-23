import World from "proj/world";
import Display from "proj/draw";


export function main(){
var plan = ["############################",
            "#      #    #      o      ##",
            "#    @                     #",
            "#          #####           #",
            "##         #   #    ##     #",
            "###           ##     #     #",
            "#           ###      #     #",
            "#   ####                   #",
            "#   ##       o             #",
            "# o  #         o       ### #",
            "#    #                     #",
            "############################"];

  var w = new World(plan);
  var d = new Display(w);

  var mainLoop = function(){
    d.render();
    requestAnimationFrame( mainLoop );
  }
  mainLoop();
}
main();