// simply lean polyfills EXCEPT in MY space (non-polluting to our client apps)
export const MyObj = {

  // Object.entries() 
  // - is NOT available in Node 6 (for some reason)
  //   ... unsure what this has to do with Node 6
  // - although it is a es2017 standard (according to the MDN)
  //   ... see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  // - technically, this is a "build only" problem on Node 6
  //   ... an antiquated browser would require client to polyfill just as anything else
  // - it is so lean and small, I just punted and included it here
  entries: (obj) => {
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
  },

};
