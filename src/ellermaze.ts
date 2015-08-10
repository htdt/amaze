//algorithm http://www.neocomputer.org/projects/eller.html

export default function EllerMaze(width=16, height=16) {
  
  var curstr = [];
  var map = [];
  var ls = width * 2 + 1;

  for (let i = 0; i < width; i++) curstr[i] = i;
  
  border();
  for (var n = 0; n < height; n++) {
    drawline(line1(), false);
    drawline(line2(), true);
    unnull();
  }
  drawline(last(), false);
  border();

  log();
  return map;

  function log(){
    for (let n=0;n<map.length;n++)
      console.log(map[n].map(el=>el?"#":"-").join(""));
  }

  function line1() {
    let result = [], v1, v2;

    for (let i = 0; i < width - 1; i++) {
      result[i] = false;

      if (curstr[i] == curstr[i + 1]) result[i] = true;
      else {
        if (Math.random() > .5) result[i] = true;
        else {
          v1 = curstr[i];
          v2 = curstr[i + 1];
          curstr = curstr.map(x => {
            if (x == v2) return v1;
            else return x;
          });
        }
      }
    }
    return result;
  }

  function line2() {
    let result = [];
    for (var i = 0; i < width; i++) {
      result[i] = false;
      let l = curstr.filter(x => x == curstr[i]).length;
      if (l > 1 && Math.random() > .5) {
        result[i] = true;
        curstr[i] = null;
      }
    }
    return result;
  }

  function unique(){
    for (var i = 0;;i++)
      if (curstr.filter(x => x == i).length == 0) return i;
  }

  function unnull(){
    for (let i = 0; i < width; i++)
      if (curstr[i] == null) curstr[i] = unique();
  }

  function last(){
    let result = line1();
    for (let i = 0; i < width - 1; i++)
      if (curstr[i] != curstr[i + 1])
        result[i] = false;
    return result;
  }

  function drawline(l, isline2) {
    let outl = [];
    outl.push(true);
    for (let i = 0; i < width - 1; i++){
      if (isline2) outl.push(l[i], Math.random()>.3);
      else outl.push(false, l[i]);
    }
    outl.push(l[width-1]);
    outl.push(true);
    map.push(outl);
  }

  function border(){
    let l = [];
    for (let i = 0; i < ls; i++) l.push(true);
    map.push(l);
  }
}
