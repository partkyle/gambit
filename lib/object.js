Object.defineProperty(Object.prototype, 'size', {
  value: function() {
    var size = 0, key;
    for (key in this) {
        if (this.hasOwnProperty(key)) size++;
    }
    return size;
  },
  enumerable: false
});
