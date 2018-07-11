data=(function makeData () {
  function randInt(begin, end) {
    return Math.floor(Math.random() * (end - begin)) + begin;
  }
  var items = [];
  for (var i = 0; i < 20; i++) {
    items.push({
      id: 'item' + i,
      type: 'node',
      c: 'rgb(0, 153, 255)',
      t: 'item' + i
    });
    items.push({
      id: 'link' + i,
      type: 'link',
      id1: 'item' + i,
      id2: 'item' + ((i > 10) ? randInt(0, 11) : randInt(11, 20))
    });
  }
  return {
    type: 'LinkChart',
    items: items
  };
})();

